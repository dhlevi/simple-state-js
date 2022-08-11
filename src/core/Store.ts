import { Action, ActionType, Executable } from "./Action"
import { StateSingleton } from "./StateSingleton"
import { ChangeState, DecoratorDefinition, ExecutableOptions, StoreOptions } from "./Options"
import { DECORATOR_KEY } from "./Decorators"
import { deepClone, stringifyMapReplacer, stringifyMapReviver } from "./Util"

/**
 * A Base store class. Defines the standard set of attributes and 
 * default for a data store. The store is not generic, and the 
 * data will accept `any` type
 */
export class Store {
  readonly name: string
  readonly isCachable: boolean
  public cacheTimeoutSeconds: number
  readonly persistCache: boolean
  private _cachePrefix: string

  private _loaders: Array<Action>
  private _actions: Array<Action>
  private _listeners: Array<Action>
  private _transformers: Array<Action>

  private _isCached: boolean
  private _isLoading: boolean
  private _lastLoadTime: Date | null
  private _lastStoreTime: Date | null

  private _previousStateData: any
  private _data: any

  /**
   * Create a Store for holding data
   * @param options
   * 
   */
  public constructor (options: StoreOptions) {
    this.name = options.name
    this.isCachable = options.isCachable || false
    this._isCached = false
    this.persistCache = options.persistCache || false
    this.cacheTimeoutSeconds = options.cacheTimeoutSeconds || -1
    this._cachePrefix = options.cachePrefix || ''
    this._isLoading = false
    this._loaders = []
    this._actions = []
    this._listeners = []
    this._transformers = []

    this._lastLoadTime = null
    this._lastStoreTime = null

    // Load existing local store cache
    // But, we can ignore this if we're running in nodejs
    if (this.persistCache && (!process || (process && typeof process !== 'object' && (process as any).title !== 'node'))) {
      const previousState = localStorage.getItem(`${this._cachePrefix}state-cache-${this.name}`)
      if (previousState) {
        try {
          this._data = JSON.parse(previousState)
          const timeout = localStorage.getItem(`${this._cachePrefix}state-cache-${this.name}-timeout`)
          if (timeout && Date.now() < parseInt(timeout)) {
            this.isCached = true
            this._lastLoadTime = new Date()
            this._lastStoreTime = new Date()
          }
        } catch (error) {
          console.warn(`Failed to load persisted state for Store ${this.name}`)
          localStorage.removeItem(`${this._cachePrefix}state-cache-${this.name}`)
        }
      }
    }
  }

  /**
   * Hander specifically for creating a store from a resource object. This is used
   * if you want to create a store specific to an object, and where the object will
   * contain observable properties.
   * 
   * This will automatically inject getters and setters on all attributes of the target
   * object (as long as they don't have them already). It will also detect any used
   * decorators and create Listeners and Actions as needed. For observable stores, it
   * is generally expected that you would not use a loader.
   * 
   * Any mutations to the source object will trigger any applied listener. All other
   * main store functions (caching, etc) can still be used,
   * 
   * @param targetObject 
   * @param options 
   * @returns 
   */
  public static observableStore(targetObject: any, options: StoreOptions): Store {
    // should only be called in constructor, so lets remove an existing store
    StateSingleton.removeStore(options.name)
    const store = new Store(options)
    StateSingleton.addStore(store)
    // inject actions onto target by scanning the prototypes
    try {
      const decorators: Map<string, DecoratorDefinition> = targetObject[DECORATOR_KEY]
      if (decorators) {
        for (const entry of Array.from(decorators.entries())) {
          const key = entry[0]
          const value = entry[1]
          switch (value.type) {
            case ActionType.ACTION:
            case ActionType.INLINE_ACTION:
              store.createAction(key, value.callback, value.type === ActionType.INLINE_ACTION)
            break
            case ActionType.LOADER:
              store.createLoader(key, value.callback)
            break
            case ActionType.LISTENER:
              store.createListener(key, value.callback)
            break
            case ActionType.TRANSFORMER:
              store.createTransformer(key, value.callback)
            break
          }
        }
      }
      // Inject setters on attributes for observable
      // listener execution on data change
      store.injectMonitorSetters(targetObject, store)
    } catch (error) {
      console.log('Decorator and Observer injection could not be completed. State may be corrupt: ', error)
    }

    store.setData(targetObject)

    return store
  }

  /**
   * This function traverses the supplied targetObject, and injects a default getter
   * and a setter with a listener call to detect changes. This will be injected on
   * all properties, as well as childrens properties where available. Child arrays
   * and maps will have their entities traversed, but the array/map itself is ignored
   * Functions are also ignored.
   * 
   * a new property '@state__<key>' will be added to store the value, and the original
   * will be replaced by the getter and setter Properties with existing getters/setters 
   * will have their getters/setters left intact. Any actions taken in them will be 
   * executed, so ensure they do not unintentionally interact with the store
   * 
   * @param targetObject 
   * @param targetKey 
   * @param store 
   */
  private injectMonitorSetters (targetObject: any, store: Store) {
    for(const key in targetObject) {
      if (targetObject[key] instanceof Map) {
        for (const entry of Array.from(targetObject[key].entries())) {
          const mapKey = (entry as any)[0]
          const value = (entry as any)[1]
          if (typeof mapKey === 'object' ) {
            this.injectMonitorSetters(mapKey, store)
          }
          if (typeof value === 'object' ) {
            this.injectMonitorSetters(value, store)
          }
        }
      } else if (targetObject[key] instanceof Array) {
        for (const obj of targetObject[key]) {
          if (typeof obj === 'object' ) {
            this.injectMonitorSetters(obj, store)
          }
        }
      } else if (typeof targetObject[key] === 'object') {
        this.injectMonitorSetters(targetObject[key], store)
      } else if (typeof targetObject[key] !== 'function') {
        const keyName = `@state__${key}`
        targetObject[keyName] = targetObject[key]
        Object.defineProperty(targetObject, key, {
          get: () => { 
            return targetObject[keyName]
          },
          set: (value: any) => {
            if (targetObject[keyName] !== value) {
              const previousObject = deepClone(targetObject)
              store.setPreviousData(previousObject)
              targetObject[keyName] = value
              store.executeListeners()
              store.acceptDirtyData()
            }
          }
        })
      }
    }
  }

  /**
   * Create a Store and add it to the State Singleton
   * @param name The name of the store
   * @param isCachable True if you want the store to be cacheable, defaults to FALSE
   * @param cacheTimeoutSeconds The timeout to use for invalidating the cache and loading new state, a value of zero or less will never invalidate, defaults to -1
   * @returns The created store
   */
  public static createStore (options: StoreOptions): Store {
    const existingStore = StateSingleton.findStore(options.name)
    if (existingStore) {
      throw new Error(`Store with the name "${options.name}" already exists. Please remove the store before re-creating it.`)
    }
    const store = new Store(options)
    StateSingleton.addStore(store)
    return store
  }

  public get isLoading (): boolean {
    return this._isLoading
  }

  public get isCached (): boolean {
    return this._isCached
  }

  private set isCached (isCached: boolean) {
    this._isCached = isCached
  }

  public get cachePrefix (): string {
    return this._cachePrefix
  }

  public get lastLoadTime (): Date | null {
    return this._lastLoadTime
  }

  public get lastStoreTime (): Date | null {
    return this._lastStoreTime
  }

  /**
   * Will return TRUE if the cache has been invalidated
   * A Cache becomes stale after the cache timeout is exceeded
   * @returns True when the cache is stale, False when the cache is valid
   */
  public isCacheStale (): boolean {
    if (!this.isCachable || !this.isCached || !this._lastStoreTime) {
      // Always return true if the store is not cachable, not cached, or we havn't stored data yet
      return true
    } else if (this.cacheTimeoutSeconds <= 0) {
      // Always return false if the cachetimeout is zero or less
      return false
    } else {
      // Otherwise, just check the timeout.
      return this.isCached && this._lastStoreTime && this._lastStoreTime.getTime() + (this.cacheTimeoutSeconds * 1000) < Date.now()
    }
    // The above conditions could be collapsed for simplicity, but I wanted
    // to make the states clear for explicit true/false states
  }

  public getData (): any {
    // Return a deep copy, preserve data state?
    return this._data
  }

  public setData (data: any) {
    const datatype = this.getType(data)

    if (datatype === 'function') {
      throw Error('Function types cannot be stored')
    }

    this._previousStateData = this.getData() ? deepClone(this.getData()) : null
    this._data = data
    this._lastStoreTime = new Date()
    this.executeListeners()
  }

  private setPreviousData (previous: any) {
    this._previousStateData = previous
  }

  private getType (data: any) {
    return data === null ? null : typeof data === 'object' || typeof data === 'function' 
           ? ({} as any)[({} as any).toString.call(data)] || 'object' : typeof data
  }
  
  /**
   * Identifies if the data stored by this Store has a been modified
   * from it's previous state. This can check for mutation on the data directly.
   * After a loader execution, this should always return false unless the data
   * was mutated directly
   * @returns 
   */
  public isDirty () {
    return (
      // update to use deepEqual
      JSON.stringify(this._data) !== JSON.stringify(this._previousStateData)
    )
  }

  /**
   * Execute and Action or Loader with the provided parameters.
   * If the action or loader does not exist, ad no-op Action will
   * be executed in its place that performs no action (but will log
   * to the console).
   * @param name The name of the Action or Loader to execute
   * @param args The parameters to pass into the Action or Loader
   * @returns A promise that will resolve the Action or Loaders callback
   * @throws Exceptions that occur in the callback will be re-thrown
   */
  public async execute (name: string, ...args: any[]): Promise<any> {
    try {
      let action = this.findEventHandler(name)
      if (!action) {
        action = new Action('no-op', () => { console.log(`Action ${name} not defined`) })
      }

      if (action.actionType === ActionType.TRANSFORMER) {
        args = [this.getData(), ...args]
      }

      if (action.actionType === ActionType.LOADER) {
        if (this._isLoading || !this.isCacheStale()) {
          action = new Action(`no-op`, () => { console.log(`Loader is currently ${this._isLoading ? 'Loading' : 'Cached'}. Load action ignored`)})
        } else {
          this._isLoading = true
        }
      }

      let results = null
      if (action.actionType === ActionType.INLINE_ACTION) {
        results = await this.getData()[action.name](...args)
      } else {
        results = await Executable.createExecutor(action, args).execute()
      }

      if (action.actionType === ActionType.LOADER) {
        this._lastLoadTime = new Date()

        if (this.isCachable) {
          this.isCached = true
          if (this.persistCache && (!process || (process && typeof process !== 'object' && (process as any).title !== 'node'))) {
            this.cacheData()
          }
        }

        this.setData(results)
        // Now that we've set data and alerted any listeners, we want to
        // accept our new data as clean so they won't fire again
        this.acceptDirtyData()
      } else {
        this.executeListeners()
      }

      return results
    } catch (error: any) {
      throw error
    } finally {
      this._isLoading = false
    }
  }

  public acceptDirtyData () {
    this._previousStateData = this.getData() ? deepClone(this.getData()) : null
  }

  private executeListeners () {
    // Only fire listeners if data is dirty
    if (this.isDirty()) {
      const previousState = this._previousStateData ? JSON.parse(JSON.stringify(deepClone(this._previousStateData), stringifyMapReplacer), stringifyMapReviver) : null
      const currentState = this.getData() ? JSON.parse(JSON.stringify(deepClone(this.getData()), stringifyMapReplacer), stringifyMapReviver) : null

      this.stripInjectedValues(previousState)
      this.stripInjectedValues(currentState)

      for (const listener of this._listeners) {
        const changeState: ChangeState = { newState: currentState, previousState: previousState }
        Executable.createExecutor(listener, [changeState]).execute()
      }
    }
  }

  private stripInjectedValues (data: any, propertyName: string | null = null, parent: any = null) {
    if (data === null) return

    if (data instanceof Array) {
      for (const entity of data) {
        this.stripInjectedValues(entity)
      }
    }
    else if (data instanceof Map) {
      for (const entry of Array.from(data.entries())) {
        const key = (entry as any)[0]
        const value = (entry as any)[1]
        if (typeof key === 'object' ) {
          this.stripInjectedValues(key)
        }
        if (typeof value === 'object' ) {
          this.stripInjectedValues(value)
        }
      }
    } else if (propertyName && propertyName.startsWith('@state__')) {
      delete parent[propertyName]
    } else if (data instanceof Object) {
      for(const property in data) {
        this.stripInjectedValues(data[property], property, data)
      }
    }
  }

  /**
   * Execute any action type in a sequential chain. Each loader will be executed in the order
   * receieved, regardless of whether they are async or not. If an action has a return, it will
   * be appended to a result list. Action returns can be forwarded to the next executing action
   * by passing true to forwardResult
   * 
   * @param actions A list of Executable definitions, inlucding the action name and params
   * @returns A promise that resolves to a list holding each action result
   */
  public async chain (actions: Array<ExecutableOptions>): Promise<Array<any>> {
    const results = []
    let lastResult: any = null
    let forwardResult = false
    for (const executableDef of actions) {
      // We can skip the forwarding anything to the first action
      if (forwardResult) {
        executableDef.params = [lastResult, ...executableDef.params || []]
      }
      const result = await this.execute(executableDef.action, ...executableDef.params || [])
      results.push(result)
      lastResult = result
      forwardResult = executableDef.forwardResult || false
    }
    return results
  }

  private cacheData () {
    try {
      // write cache to local storage for immediate store data on reload
      // ignore if we're running in node
      localStorage.setItem(`${this._cachePrefix}state-cache-${this.name}`, JSON.stringify(this.getData()))
      const cacheTimeout = this.cacheTimeoutSeconds <= 0 ? Date.now() + 1000 * 60 * 60 * 24 : Date.now() + (this.cacheTimeoutSeconds * 1000)
      localStorage.setItem(`${this._cachePrefix}state-cache-${this.name}-timeout`, (cacheTimeout).toString())
    } catch (error) {
      console.warn('Failed to write cache to local storage')
    }
  }

  /**
   * Create a Listener on this store. Listeners will be triggered
   * whenever a Loader is executed successfully.
   * @param name The name of the Listener
   * @param callback The callback to execute
   * @returns True if the listener was successfully created
   */
  public createListener (name: string, callback: Function): boolean {
    try {
      const existingListener = this._listeners.find(a => a.name === name)
      if (existingListener) {
        const removedHandler = this.removeEventHandler(this._listeners, name)
        if (!removedHandler) {
          throw Error('Failed to remove duplicate Listener. New listener cannot be created')
        }
      }
      const action = new Action(name, callback, ActionType.LISTENER)
      this._listeners.push(action)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * Create an Action on this store. Actions can only be triggered
   * manually
   * @param name The name of the Action
   * @param callback The callback to execute
   * @returns True if the Action was successfully created
   */
  public createAction (name: string, callback: Function, inline = false): boolean {
    try {
      const existingAction = this._actions.find(a => a.name === name)
      if (existingAction) {
        const removedHandler = this.removeEventHandler(this._actions, name)
        if (!removedHandler) {
          throw Error('Failed to remove duplicate Action. New action cannot be created')
        }
      }
      const action = new Action(name, callback, inline ? ActionType.INLINE_ACTION : ActionType.ACTION)
      this._actions.push(action)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * Create a Loader on this store. Loaders are used for loading
   * data only, and it will be expected that the result of the loader
   * can be stored in the stores data holder. Loader execution will
   * also execute any attached listeners.
   * @param name The name of the Loader
   * @param callback The callback to execute
   * @returns True if the Loader was successfully created
   */
  public createLoader (name: string, callback: Function): boolean {
    try {
      const existingLoader = this._loaders.find(a => a.name === name)
      if (existingLoader) {
        const removedHandler = this.removeEventHandler(this._loaders, name)
        if (!removedHandler) {
          throw Error('Failed to remove duplicate loader. New loader cannot be created')
        }
      }
      const loader = new Action(name, callback, ActionType.LOADER)
      this._loaders.push(loader)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * Create a Transformer on this store. Transformers are
   * functions that will transform or alter the data you've
   * stored, without altering the stored data.
   * @param name The name of the Transformer
   * @param callback The callback to execute
   * @returns True if the Transformer was successfully created
   */
   public createTransformer (name: string, callback: Function): boolean {
    try {
      const existingTransformer = this._transformers.find(a => a.name === name)
      if (existingTransformer) {
        const removedHandler = this.removeEventHandler(this._transformers, name)
        if (!removedHandler) {
          throw Error('Failed to remove duplicate transformer. New transformer cannot be created')
        }
      }
      const transformer = new Action(name, callback, ActionType.TRANSFORMER)
      this._transformers.push(transformer)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * Removes the named loader
   * @param name The name of the Loader
   * @returns True if the loader was successfully removed
   */
  public removeLoader (name: string): boolean {
    return this.removeEventHandler(this._loaders, name)
  }

  /**
   * Removes the named Action
   * @param name The name of the Action
   * @returns True if the Action was successfully removed
   */
  public removeAction (name: string): boolean {
    return this.removeEventHandler(this._actions, name)
  }

  /**
   * Removes the named Listener
   * @param name The name of the Listener
   * @returns True if the Listener was successfully removed
   */
  public removeListener (name: string): boolean {
    return this.removeEventHandler(this._listeners, name)
  }

  /**
   * Removes the named Transformer
   * @param name The name of the Transformer
   * @returns True if the Transformer was successfully removed
   */
   public removeTransformer (name: string): boolean {
    return this.removeEventHandler(this._transformers, name)
  }

  private removeEventHandler(handlers: Array<Action>, name: string): boolean {
    try {
      const handler = handlers.find(s => s.name === name)
      if (handler) {
        const idx = handlers.indexOf(handler)
        if (idx > -1) {
          handlers.splice(idx, 1);
        }
      }
      return true
    } catch (error) {
      console.error(`Failed to remove Event Handler: ${error}`)
      return false
    }
  }

  private findEventHandler (name: string): Action | undefined {
    return  this._actions.find(a => a.name === name) || this._loaders.find(a => a.name === name) || this._transformers.find(a => a.name === name)
  }
}

/**
 * A default generic datastore that accepts a type. This Store
 * should serve most needs for storing data
 */
export class GenericDataStore<T> extends Store {
  public constructor (options: StoreOptions) {
    super(options)
  }

  /**
   * Create a Generic Data Store of the defined type. This store will
   * also be added to the State singleton and autmatically acquire any
   * unbound actions, loaders or listeners that have been defined.
   * @param name The name of your store, used for fetching it later and decorators
   * @param isCachable Flag this store as cachable, which allows it to ignore repeat load requests. Used for code-tables that dont need reloading
   * @param cacheTimeoutSeconds If this store is cachable, this is the allowable lifetime of the cache. 0 or less will never invalidate
   * @returns The GenericDatastore that was created with this request
   */
  public static override createStore<T> (options: StoreOptions): GenericDataStore<T> {
    const existingStore = StateSingleton.findStore(options.name)
    if (existingStore) {
      throw new Error(`Store with the name "${options.name}" already exists. Please remove the store before re-creating it.`)
    }
    const store = new GenericDataStore<T>(options)
    StateSingleton.addStore(store)
    return store
  }

  public override getData (): T {
    return super.getData() as T
  }

  public override setData (data: T) {
    super.setData(data)
  }
}

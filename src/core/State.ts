/* tslint:disable:ban-types max-classes-per-file */
import { Action, ActionType } from "./Action"
import { StateObserver } from "./StateObserver"
import { Store } from "./Store"

/**
 * State structure for maintaining a consolidated state
 */
export class State {
  private stores: Store[]
  private observers: StateObserver<any>[]
  private loaders: Map<string, Action[]>
  private listeners: Map<string, Action[]>
  private actions: Map<string, Action[]>
  private transformers: Map<string, Action[]>

  constructor () {
    this.stores = []
    this.observers = []
    this.loaders = new Map<string, Action[]>()
    this.listeners = new Map<string, Action[]>()
    this.actions = new Map<string, Action[]>()
    this.transformers = new Map<string, Action[]>()
  }

  /**
   * Add an Action Event Handler to the unbound state. Internal utility method used by
   * addListener/Loader/Action
   */
  private addUnboundEventHandler (holder: Map<string, Action[]>, store: string, name: string, callback: Function, actionType: ActionType): boolean {
    try {
      let handlers: Action[] | undefined = []
      // Fetch our handlers, or create an empty array if we don't have handlers
      // for this store yet
      if (holder.has(store)) {
        handlers = holder.get(store)
      }

      if (!handlers) {
        handlers = []
      }

      // Identify if we have any existing handlers
      // if we do, we want to remove it, and replace it
      // with the new one
      const existingLstener = handlers.find(a => a.name === name)
      if (existingLstener) {
        const idx = handlers.indexOf(existingLstener)
        if (idx > -1) {
          handlers.splice(idx, 1);
        }
      }

      // then, push the handler on, and set the holder in state
      handlers.push(new Action(name, callback, actionType))
      holder.set(store, handlers)
      
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Add a listener to a store in the managed state. If the state does not 
   * have a store with the provided name, it will be added to the unbound
   * state and will be applied once that store becomes available.
   * @param store The name of the store
   * @param name The name of the listener
   * @param callback The callback to call when the listener is executed
   * @returns True if the Listener was created successfully
   */
  public addListener (store: string, name: string, callback: Function): boolean {
    let result = this.addUnboundEventHandler(this.listeners, store, name, callback, ActionType.LISTENER)

    const storeDef = this.findStore(store)
    if (result && storeDef) {
      result = storeDef.createListener(name, callback)
    }

    return result
  }

  /**
   * Add an Action to a store in the managed state. If the state does not 
   * have a store with the provided name, it will be added to the unbound
   * state and will be applied once that store becomes available.
   * @param store The name of the store
   * @param name The name of the Action
   * @param callback The callback to call when the ACtion is executed
   * @returns True if the Action was created successfully
   */
  public addAction (store: string, name: string, callback: Function): boolean {
    let result = this.addUnboundEventHandler(this.actions, store, name, callback, ActionType.ACTION)

    const storeDef = this.findStore(store)
    if (result && storeDef) {
      result = storeDef.createAction(name, callback)
    }

    return result
  }

  /**
   * Add a Loader to a store in the managed state. If the state does not 
   * have a store with the provided name, it will be added to the unbound
   * state and will be applied once that store becomes available.
   * @param store The name of the store
   * @param name The name of the Loader
   * @param callback The callback to call when the Loader is executed
   * @returns True if the Loader was created successfully
   */
  public addLoader (store: string, name: string, callback: Function): boolean {
    let result = this.addUnboundEventHandler(this.loaders, store, name, callback, ActionType.LOADER)

    const storeDef = this.findStore(store)
    if (result && storeDef) {
      result = storeDef.createLoader(name, callback)
    }

    return result
  }

  /**
   * Add a Transformer to a store in the managed state. If the state does not 
   * have a store with the provided name, it will be added to the unbound
   * state and will be applied once that store becomes available.
   * 
   * Note: The first parameter of your transformer callback will contain
   * your stores current data. You can supply additional parameters as needed
   * 
   * @param store The name of the store
   * @param name The name of the Transformer
   * @param callback The callback to call when the Transformer is executed
   * @returns True if the TRansformer was created successfully
   */
   public addTransformer (store: string, name: string, callback: Function): boolean {
    let result = this.addUnboundEventHandler(this.transformers, store, name, callback, ActionType.TRANSFORMER)

    const storeDef = this.findStore(store)
    if (result && storeDef) {
      result = storeDef.createTransformer(name, callback)
    }

    return result
  }

  /**
   * Add a store to the managed state. This is generaly executed automatically
   * by the static store factories, but you can manually create a store and
   * add it here
   * @param store The store to add
   */
  public addStore(store: Store) {
    this.stores.push(store)

    if (this.listeners.has(store.name)) {
      const storeListeners = this.listeners.get(store.name)
      if (storeListeners) {
        for (const listener of storeListeners) {
          store.createListener(listener.name, listener.callback)
        }
      }
    }

    if (this.actions.has(store.name)) {
      const storeActions = this.actions.get(store.name)
      if (storeActions) {
        for (const action of storeActions) {
          store.createAction(action.name, action.callback)
        }
      }
    }

    if (this.loaders.has(store.name)) {
      const storeLoaders = this.loaders.get(store.name)
      if (storeLoaders) {
        for (const action of storeLoaders) {
          store.createLoader(action.name, action.callback)
        }
      }
    }

    if (this.transformers.has(store.name)) {
      const storeTransformers = this.transformers.get(store.name)
      if (storeTransformers) {
        for (const action of storeTransformers) {
          store.createTransformer(action.name, action.callback)
        }
      }
    }
  }

  /**
   * Add a state observer
   * @param observer The observer to add
   */
  public addStateObserver<T> (observer: StateObserver<T>) {
    this.observers.push(observer)
  }

  /**
   * Find and fetch a store by name
   * @param name The name of the store
   * @returns The store that was found, or Undefined
   */
  public findStore (name: string): Store | undefined {
    return this.stores.find(s => s.name === name)
  }

  /**
   * Find and fetch a state observer
   * @param name 
   * @returns 
   */
  public findStateObserver<T> (name: string): StateObserver<T> | undefined {
    return this.observers.find(o => o.name === name)
  }

  /**
   * Remove a store from the managed state
   * @param name The store to remove
   * @returns True if the store was removed
   */
  public removeStore (name: string): boolean {
    try {
      const stores = this.stores
      const store = stores.find(s => s.name === name)
      if (store) {
        const storeIndex = stores.indexOf(store)
        if (storeIndex > -1) {
          stores.splice(storeIndex, 1);
        }

        this.loaders.delete(store.name)
        this.actions.delete(store.name)
        this.listeners.delete(store.name)
        this.transformers.delete(store.name)
      }
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Removes a state observer from the state monitor
   * @param name The observer to remove
   * @returns True if the observer was removed
   */
  public removeStateObserver (name: string): boolean {
    try {
      const observers = this.observers
      const observer = observers.find(o=> o.name === name)
      if (observer) {
        const observerIndex = observers.indexOf(observer)
        if (observerIndex > -1) {
          observers.splice(observerIndex, 1);
        }
      }
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Remove all stores, and unbound Loaders, Transformers, Listeners and Actions from the state
   * @returns True if the state has been cleared
   */
  public clearStores (): boolean {
    try {
      const state = this
      state.stores = []
      state.loaders = new Map<string, Action[]>()
      state.actions = new Map<string, Action[]>()
      state.listeners = new Map<string, Action[]>()
      state.transformers = new Map<string, Action[]>()

      return state.stores.length === 0 && state.loaders.size === 0 && state.actions.size === 0 && state.listeners.size === 0
    } catch (error) {
      return false
    }
  }

  /**
   * Clear the observers from the state
   * @returns True if observers were cleared from the state
   */
  public clearObservers (): boolean {
    try {
      this.observers = []
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Clear all stores and observers from the state
   * @returns True if observers and stores were cleared from the state
   */
  public clear (): boolean {
    return this.clearStores() && this.clearObservers()
  }
}

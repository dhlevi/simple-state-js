import { Action, ActionType, Executable } from "./Action"
import { StateSingleton } from "./StateSingleton"
import { ChangeState, DecoratorDefinition, ExecutableOptions, StateObserverOptions, StoreOptions } from "./Options"
import { DECORATOR_KEY } from "./Decorators"
import { deepClone, deepEquals, shallowClone, shallowEquals } from "./Util"
import { BaseStore } from "./Store"

// The prefix added to injected getters/setters
const INJECT_PREFIX = '@state__'

export class StateObserver extends BaseStore {
  constructor (options: StateObserverOptions) {
    super(options.name)
  }

  /**
   * Create an observable store
   * 
   * This will automatically inject getters and setters on all attributes of the target
   * object.  It will also detect any used decorators and create Listeners and Actions
   * as needed.
   * 
   * Any mutations to the source object will trigger any applied listener.
   * 
   * @param targetObject 
   * @param options 
   * @returns 
   */
   public static observableStore(targetObject: any, options: StateObserverOptions): StateObserver {
    StateSingleton.removeStateObserver(options.name)
    const observer = new StateObserver(options)
    StateSingleton.addStateObserver(observer)
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
              observer.createAction(key, value.callback, value.type === ActionType.INLINE_ACTION)
            break
            case ActionType.LISTENER:
              observer.createListener(key, value.callback)
            break
          }
        }
      }
      // Inject setters on attributes for observable
      // listener execution on data change
      observer.injectMonitorSetters(targetObject, observer)
    } catch (error) {
      console.log('Decorator and Observer injection could not be completed. State may be corrupt: ', error)
    }

    observer.setData(targetObject)

    return observer
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
   * @param observer 
   */
  private injectMonitorSetters (targetObject: any, observer: StateObserver) {
    for(const key in targetObject) {
      if (targetObject[key] instanceof Map) {
        for (const entry of Array.from(targetObject[key].entries())) {
          const mapKey = (entry as any)[0]
          const value = (entry as any)[1]
          if (typeof mapKey === 'object' ) {
            this.injectMonitorSetters(mapKey, observer)
          }
          if (typeof value === 'object' ) {
            this.injectMonitorSetters(value, observer)
          }
        }
      } else if (targetObject[key] instanceof Array) {
        for (const obj of targetObject[key]) {
          if (typeof obj === 'object' ) {
            this.injectMonitorSetters(obj, observer)
          }
        }
        // observe array changes
        const me = this;
        ['pop', 'push', 'shift', 'unshift', 'splice', 'concat'].forEach((m) => {
          targetObject[key][m] = function () {
            const startLength = targetObject[key].length
            const res = Array.prototype[m as any].apply(targetObject[key], arguments)
            const endLength = targetObject[key].length
            if (startLength !== endLength) {
              if (m !== 'pop' && m !== 'splice') {
                me.injectMonitorSetters(arguments, observer)
              }
              observer.executeListeners()
            }
            return res
        }})
      } else if (typeof targetObject[key] === 'object') {
        this.injectMonitorSetters(targetObject[key], observer)
      } else if (typeof targetObject[key] !== 'function') {
        const keyName = `${INJECT_PREFIX}${key}`
        targetObject[keyName] = targetObject[key]
        Object.defineProperty(targetObject, key, {
          get: () => { 
            return targetObject[keyName]
          },
          set: (value: any) => {
            if (targetObject[keyName] !== value) {
              const previousObject = deepClone(targetObject)
              observer.setPreviousData(previousObject)
              targetObject[keyName] = value
              observer.executeListeners()
              observer.acceptDirtyData()
            }
          }
        })
      }
    }
  }

  private setPreviousData (previous: any) {
    this._previousStateData = previous
  }

  public detach () {
    // unhook observables
  }

  protected executeListeners () {
    // Only fire listeners if data is dirty
    if (this.isDirty()) {
      const previousState = this._previousStateData ? shallowClone(this._previousStateData) : null
      const currentState = this.getData() ? shallowClone(this.getData()) : null

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
    } else if (propertyName && propertyName.startsWith(INJECT_PREFIX)) {
      delete parent[propertyName]
    } else if (data instanceof Object) {
      for(const property in data) {
        this.stripInjectedValues(data[property], property, data)
      }
    }
  }
}

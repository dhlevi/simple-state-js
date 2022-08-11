import { State } from "./State"
import { Store } from "./Store"

/**
 * Singleton State management class to be used as a global store for Stores
 * and unbound functions. The singleton is self-contained and not restricted
 * by any framework that it may be implemented in.
 * 
 * It is not thread safe. Creating stores in a seperate worker will not share
 * to other created instances.
 * 
 * It is global, and can be inappropriately abused. Do not abuse it, or suffer
 * the consequences of such abuse. Use as directed!
 * 
 * In frameworks where top-level injectable architecture can be used (for instance
 * Angular), you can use a non-singleton class from the root. This will serve the 
 * same function, but negate the inherit risks of a singleton (and makes for clean destruction).
 * This is what the base State class is for. Use that instead, and manage state independently
 * 
 * Another alternative is using global. I prefer a direct singleton rather than
 * pollution on self/global/window, but alternatively you could bind State to
 * global rather than use a singleton (this approach is used in a lot of observable stores)
 */
export class StateSingleton {
  private static _instance: State

  private constructor () { /* no constructor needed */}

  /**
   * Return the global state. If there is no state, a new state
   * object will be created
   * @returns The global state
   */
  public static instance (): State {
    if (!StateSingleton._instance) {
      StateSingleton._instance = new State()
    }
    return StateSingleton._instance
  }

  /**
   * Replace global state with a supplied state object.
   * Only use this if you know what you're doing... it will
   * totally destroy the exising state
   * @param state The state to apply
   */
  public static replaceInstance (state: State) {
    StateSingleton._instance = state
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
  public static addListener (store: string, name: string, callback: Function): boolean {
    return StateSingleton.instance().addListener(store, name, callback)
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
  public static addAction (store: string, name: string, callback: Function): boolean{
    return StateSingleton.instance().addAction(store, name, callback)
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
  public static addLoader (store: string, name: string, callback: Function): boolean {
    return StateSingleton.instance().addLoader(store, name, callback)
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
   * @param callback The callback to call when the TRansformer is executed
   * @returns True if the Transfomer was created successfully
   */
   public static addTransformer (store: string, name: string, callback: Function): boolean {
    return StateSingleton.instance().addTransformer(store, name, callback)
  }

  /**
   * Add a store to the managed state. This is generaly executed automatically
   * by the static store factories, but you can manually create a store and
   * add it here
   * @param store The store to add
   */
  public static addStore(store: Store) {
    StateSingleton.instance().addStore(store)
  }

  /**
   * Find and fetch a store by name
   * @param name The name of the store
   * @returns The store that was found, or Undefined
   */
  public static findStore(name: string): Store | undefined {
    return StateSingleton.instance().findStore(name)
  }

  /**
   * Remove a store from the managed state
   * @param name The store to remove
   * @returns True if the store was removed
   */
  public static removeStore(name: string): boolean {
    return StateSingleton.instance().removeStore(name)
  }

  /**
   * Clear all stores and unbound actions, listeners and Loaders Transformers from
   * the managed state
   * @returns True if the state was successfully cleared
   */
  public static clearStores (): boolean {
    return StateSingleton.instance().clearStores()
  }
}

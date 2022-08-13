import { State } from "./State";
import { StateObserver } from "./StateObserver";
import { Store } from "./Store";
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
export declare class StateSingleton {
    private static _instance;
    private constructor();
    /**
     * Return the global state. If there is no state, a new state
     * object will be created
     * @returns The global state
     */
    static instance(): State;
    /**
     * Replace global state with a supplied state object.
     * Only use this if you know what you're doing... it will
     * totally destroy the exising state
     * @param state The state to apply
     */
    static replaceInstance(state: State): void;
    /**
     * Add a listener to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the listener
     * @param callback The callback to call when the listener is executed
     * @returns True if the Listener was created successfully
     */
    static addListener(store: string, name: string, callback: Function): boolean;
    /**
     * Add an Action to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the Action
     * @param callback The callback to call when the ACtion is executed
     * @returns True if the Action was created successfully
     */
    static addAction(store: string, name: string, callback: Function): boolean;
    /**
     * Add a Loader to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the Loader
     * @param callback The callback to call when the Loader is executed
     * @returns True if the Loader was created successfully
     */
    static addLoader(store: string, name: string, callback: Function): boolean;
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
    static addTransformer(store: string, name: string, callback: Function): boolean;
    /**
     * Add a store to the managed state. This is generaly executed automatically
     * by the static store factories, but you can manually create a store and
     * add it here
     * @param store The store to add
     */
    static addStore(store: Store): void;
    /**
     * Add a state observer to the managed state. This is generaly executed automatically
     * by the static observer factories, but you can manually create an observer and
     * add it here
     * @param observer The observer to add
     */
    static addStateObserver<T>(observer: StateObserver<T>): void;
    /**
     * Find and fetch a store by name
     * @param name The name of the store
     * @returns The store that was found, or Undefined
     */
    static findStore(name: string): Store | undefined;
    /**
     * Find and fetch an observer by name
     * @param name The name of the observer
     * @returns The observer that was found, or undefined
     */
    static findStateObserver<T>(name: string): StateObserver<T> | undefined;
    /**
     * Remove a store from the managed state
     * @param name The store to remove
     * @returns True if the store was removed
     */
    static removeStore(name: string): boolean;
    /**
     * Remove an observer from the managed state
     * @param name The observer to remove
     * @returns True if the observer was removed
     */
    static removeStateObserver(name: string): boolean;
    /**
     * Clear all stores and unbound actions, listeners and Loaders Transformers from
     * the managed state
     * @returns True if the state was successfully cleared
     */
    static clearStores(): boolean;
    /**
     * Clear and detach all observers
     * @returns True if the observers were cleared
     */
    static clearStateObservers(): boolean;
    /**
     * Flush the state entirely (Calls clearStores and clearStateObservers)
     * @returns True if the state was cleared
     */
    static clear(): boolean;
}

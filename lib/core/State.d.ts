import { StateObserver } from "./StateObserver";
import { Store } from "./Store";
/**
 * State structure for maintaining a consolidated state
 */
export declare class State {
    private stores;
    private observers;
    private loaders;
    private listeners;
    private actions;
    private transformers;
    constructor();
    /**
     * Add an Action Event Handler to the unbound state. Internal utility method used by
     * addListener/Loader/Action
     */
    private addUnboundEventHandler;
    /**
     * Add a listener to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the listener
     * @param callback The callback to call when the listener is executed
     * @returns True if the Listener was created successfully
     */
    addListener(store: string, name: string, callback: Function): boolean;
    /**
     * Add an Action to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the Action
     * @param callback The callback to call when the ACtion is executed
     * @returns True if the Action was created successfully
     */
    addAction(store: string, name: string, callback: Function): boolean;
    /**
     * Add a Loader to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the Loader
     * @param callback The callback to call when the Loader is executed
     * @returns True if the Loader was created successfully
     */
    addLoader(store: string, name: string, callback: Function): boolean;
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
    addTransformer(store: string, name: string, callback: Function): boolean;
    /**
     * Add a store to the managed state. This is generaly executed automatically
     * by the static store factories, but you can manually create a store and
     * add it here
     * @param store The store to add
     */
    addStore(store: Store): void;
    /**
     * Add a state observer
     * @param observer The observer to add
     */
    addStateObserver<T>(observer: StateObserver<T>): void;
    /**
     * Find and fetch a store by name
     * @param name The name of the store
     * @returns The store that was found, or Undefined
     */
    findStore(name: string): Store | undefined;
    /**
     * Find and fetch a state observer
     * @param name
     * @returns
     */
    findStateObserver<T>(name: string): StateObserver<T> | undefined;
    /**
     * Remove a store from the managed state
     * @param name The store to remove
     * @returns True if the store was removed
     */
    removeStore(name: string): boolean;
    /**
     * Removes a state observer from the state monitor
     * @param name The observer to remove
     * @returns True if the observer was removed
     */
    removeStateObserver(name: string): boolean;
    /**
     * Remove all stores, and unbound Loaders, Transformers, Listeners and Actions from the state
     * @returns True if the state has been cleared
     */
    clearStores(): boolean;
    /**
     * Clear the observers from the state
     * @returns True if observers were cleared from the state
     */
    clearObservers(): boolean;
    /**
     * Clear all stores and observers from the state
     * @returns True if observers and stores were cleared from the state
     */
    clear(): boolean;
}

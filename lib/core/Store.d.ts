import { Action } from "./Action";
import { ExecutableOptions, StoreOptions } from "./Options";
/**
 * Base definition for Stores and Observable Stores.
 * This can be extended to create your own custom store
 * types
 */
export declare class BaseStore {
    readonly name: string;
    protected _data: any;
    protected _previousStateData: any;
    protected _actions: Action[];
    protected _listeners: Action[];
    constructor(name: string);
    getData(clone?: boolean): any;
    setData(data: any): void;
    /**
     * Identifies if the data stored by this Store has a been modified
     * from it's previous state. This can check for mutation on the data directly.
     * After a loader execution, this should always return false unless the data
     * was mutated directly
     * @returns
     */
    isDirty(shallow?: boolean): boolean;
    acceptDirtyData(): void;
    protected executeListeners(): void;
    protected removeEventHandler(handlers: Action[], name: string): boolean;
    /**
     * Create a Listener on this store. Listeners will be triggered
     * whenever a Loader is executed successfully.
     * @param name The name of the Listener
     * @param callback The callback to execute
     * @returns True if the listener was successfully created
     */
    createListener(name: string, callback: Function): boolean;
    /**
     * Create an Action on this store. Actions can only be triggered
     * manually
     * @param name The name of the Action
     * @param callback The callback to execute
     * @returns True if the Action was successfully created
     */
    createAction(name: string, callback: Function, inline?: boolean): boolean;
    /**
     * Removes the named Action
     * @param name The name of the Action
     * @returns True if the Action was successfully removed
     */
    removeAction(name: string): boolean;
    /**
     * Removes the named Listener
     * @param name The name of the Listener
     * @returns True if the Listener was successfully removed
     */
    removeListener(name: string): boolean;
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
    execute(name: string, ...args: any[]): Promise<any>;
    /**
     * Execute any action type in a sequential chain. Each loader will be executed in the order
     * receieved, regardless of whether they are async or not. If an action has a return, it will
     * be appended to a result list. Action returns can be forwarded to the next executing action
     * by passing true to forwardResult
     *
     * @param actions A list of Executable definitions, inlucding the action name and params
     * @returns A promise that resolves to a list holding each action result
     */
    chain(actions: ExecutableOptions[]): Promise<any[]>;
}
/**
 * A Base store class. Defines the standard set of attributes and
 * default for a data store. The store is not generic, and the
 * data will accept `any` type
 */
export declare class Store extends BaseStore {
    readonly isCachable: boolean;
    cacheTimeoutSeconds: number;
    readonly persistCache: boolean;
    private _cachePrefix;
    private _loaders;
    private _transformers;
    private _isCached;
    private _isLoading;
    private _lastLoadTime;
    private _lastStoreTime;
    /**
     * Create a Store for holding data
     * @param options
     *
     */
    constructor(options: StoreOptions);
    /**
     * Create a Store and add it to the State Singleton
     * @param name The name of the store
     * @param isCachable True if you want the store to be cacheable, defaults to FALSE
     * @param cacheTimeoutSeconds The timeout to use for invalidating the cache and loading new state, a value of zero or less will never invalidate, defaults to -1
     * @returns The created store
     */
    static createStore(options: StoreOptions): Store;
    get isLoading(): boolean;
    get isCached(): boolean;
    private set isCached(value);
    get cachePrefix(): string;
    get lastLoadTime(): Date | null;
    get lastStoreTime(): Date | null;
    /**
     * Will return TRUE if the cache has been invalidated
     * A Cache becomes stale after the cache timeout is exceeded
     * @returns True when the cache is stale, False when the cache is valid
     */
    isCacheStale(): boolean;
    setData(data: any): void;
    private cacheData;
    /**
     * Create a Loader on this store. Loaders are used for loading
     * data only, and it will be expected that the result of the loader
     * can be stored in the stores data holder. Loader execution will
     * also execute any attached listeners.
     * @param name The name of the Loader
     * @param callback The callback to execute
     * @returns True if the Loader was successfully created
     */
    createLoader(name: string, callback: Function): boolean;
    /**
     * Create a Transformer on this store. Transformers are
     * functions that will transform or alter the data you've
     * stored, without altering the stored data.
     * @param name The name of the Transformer
     * @param callback The callback to execute
     * @returns True if the Transformer was successfully created
     */
    createTransformer(name: string, callback: Function): boolean;
    /**
     * Removes the named loader
     * @param name The name of the Loader
     * @returns True if the loader was successfully removed
     */
    removeLoader(name: string): boolean;
    /**
     * Removes the named Transformer
     * @param name The name of the Transformer
     * @returns True if the Transformer was successfully removed
     */
    removeTransformer(name: string): boolean;
    private findEventHandler;
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
    execute(name: string, ...args: any[]): Promise<any>;
}
/**
 * A default generic datastore that accepts a type. This Store
 * should serve most needs for storing data
 */
export declare class GenericDataStore<T> extends Store {
    constructor(options: StoreOptions);
    /**
     * Create a Generic Data Store of the defined type. This store will
     * also be added to the State singleton and autmatically acquire any
     * unbound actions, loaders or listeners that have been defined.
     * @param name The name of your store, used for fetching it later and decorators
     * @param isCachable Flag this store as cachable, which allows it to ignore repeat load requests. Used for code-tables that dont need reloading
     * @param cacheTimeoutSeconds If this store is cachable, this is the allowable lifetime of the cache. 0 or less will never invalidate
     * @returns The GenericDatastore that was created with this request
     */
    static createStore<T>(options: StoreOptions): GenericDataStore<T>;
    getData(): T;
    setData(data: T): void;
}

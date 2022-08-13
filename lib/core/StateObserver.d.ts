import { StateObserverOptions } from "./Options";
import { BaseStore } from "./Store";
export declare class StateObserver<T> extends BaseStore {
    constructor(options: StateObserverOptions);
    getData(): T;
    setData(data: T): void;
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
    static observableStore<T>(targetObject: T, options: StateObserverOptions): StateObserver<T>;
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
    private injectMonitorSetters;
    private setPreviousData;
    protected executeListeners(): void;
    private stripInjectedValues;
}

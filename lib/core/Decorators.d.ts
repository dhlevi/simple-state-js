import { DecoratorOptions } from "./Options";
/**
 * @experimental
 * Set this function as a Listener to the provided store.
 *
 * For observerable stores, do not pass options, as the listener will be auto-wired
 *
 * For other store types, this will be added to the identified store when the store
 * is initialized, or, if the store is already initialized, it will be added immediately
 * If you choose not to supply a name for the listener, the function name will be used
 * Remember that duplicate listener names will override the previously existing name
 *
 * @param option The store options for non observed store types
 * @returns Target
 */
export declare function StoreListener(options?: DecoratorOptions | null): Function;
/**
 * Set this function as an Action to the provided store.
 *
 * For observerable stores, do not pass options, as the action will be auto-wired
 *
 * For other store types, this will be added to the identified store when the store
 * is initialized, or, if the store is already initialized, it will be added immediately
 * If you choose not to supply a name for the action, the function name will be used
 * Remember that duplicate action names will override the previously existing name
 *
 * @param option The store options for non observed store types
 * @returns Target
 */
export declare function StoreAction(options?: DecoratorOptions | null): Function;
/**
 * Set this function as a Loader that can be executed from the provided store.
 * This will be added to the identified store when the store is initialized, or,
 * if the store is already initialized, it will be added immediately
 *
 * If you choose not to supply a name for the Loader, the function name will be used
 * Remember that duplicate Loader names will override the previously existing name
 *
 * Note: These rely on the singleton so that any unbound handlers can be created and applied
 * to the store if it is created later. You can supply state as a parameter to ignore the singleton
 * but in general, these decorators are experimental and still "in progress"
 *
 * Note: Store Loaders cannot be used on observable stores (no load operation)
 *
 * @param store The name of the store to create a Loader on
 * @param name The name of this Loader. If not provided, the name of the function will be used
 * @returns Descriptor
 */
export declare function StoreLoader(options: DecoratorOptions): Function;
/**
 * @experimental
 * Set this function as a Transformer that can be executed from the provided store.
 * This will be added to the identified store when the store is initialized, or,
 * if the store is already initialized, it will be added immediately
 *
 * If you choose not to supply a name for the Transformer, the function name will be used
 * Remember that duplicate Transformer names will override the previously existing name
 *
 * Note: These rely on the singleton so that any unbound handlers can be created and applied
 * to the store if it is created later. You can supply state as a parameter to ignore the singleton
 * but in general, these decorators are experimental and still "in progress"
 *
 * Note: Store Transformers cannot be used on observable stores (no transform operation)
 *
 * @param store The name of the store to create a Transformer on
 * @param name The name of this Transformer. If not provided, the name of the function will be used
 * @returns Descriptor
 */
export declare function StoreTransformer(options: DecoratorOptions): Function;
export declare const DECORATOR_KEY = "state-decorators";

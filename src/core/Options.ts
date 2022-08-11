import { ActionType } from "./Action"
import { State } from "./State"
import { Store } from "./Store"

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>

/**
 * Options type for Executable options
 * @param action The action name
 * @param params Optional: The action params to pass into the callback
 * @param forwardResult Optional: Forward the result of the action to the next action executed in a chain
 */
export type ExecutableOptions = MakeOptional<{
  action: string,
  params: Array<any>,
  forwardResult: boolean
}, 'params' | 'forwardResult'>

/**
 * Options type for Store options
 * @param name The store name
 * @param isCachable Optional: Should the store be a persisted cache (single load only), Defaults to FALSE
 * @param cacheTimeoutSeconds Optional: When a store is cachable, this indicates how many seconds until the cache is invalidated and can be reloaded. A value of zero or less will never invalidate, Defaults to -1
 * @param persistCache Optional: If True and the store data is cachable, the cache will be persisted to localStorage for later retrieval, Defaults to FALSE
 * @param cachePrefix Optional: If True and the cache is persisted, this prefix will be applied to the item in local storage
 */
export type StoreOptions = MakeOptional<{
  name: string,
  isCachable: boolean,
  cacheTimeoutSeconds: number,
  persistCache: boolean,
  cachePrefix: string
}, 'isCachable' | 'cacheTimeoutSeconds' | 'persistCache' | 'cachePrefix'>

/**
 * Decorator options when applying decorators to functions.
 * @param store The name of the store
 * @param name The name of the action
 * @param state The state to inject
 */
export type DecoratorOptions = MakeOptional<{
  store: string | Store,
  name: string,
  state: State
}, 'name' | 'state'>

/**
 * Holder for change states, used by Listeners to send the current and previous state
 * of a store object
 */
export type ChangeState = {
  newState: any,
  previousState: any
}

/**
 * Holder for a decorator definition, used by Decorators
 */
export type DecoratorDefinition = {
  type: ActionType,
  callback: Function
}
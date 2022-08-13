/* tslint:disable:ban-types max-classes-per-file */

import { ActionType } from "./Action"
import { DecoratorDefinition, DecoratorOptions } from "./Options"
import { StateSingleton } from "./StateSingleton"
import { Store as StateStore } from "./Store"

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
export function StoreListener (options: DecoratorOptions | null = null): Function {
  return function getDecorator(target: any, property: string, descriptor: PropertyDescriptor) {
    if (options) {
      if (options.store instanceof StateStore) { 
        options.store.createListener(options.name || property, descriptor.value)
      } else if (options.state) {
        options.state.addListener(options.store, options.name || property, descriptor.value)
      } else {
        StateSingleton.addListener(options.store, options.name || property, descriptor.value)
      }
    } else {
      pushToPrototype(target, property, { type: ActionType.LISTENER, callback: descriptor.value })
    }

    return target
  }
}

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
export function StoreAction (options: DecoratorOptions | null = null): Function {
  return function getDecorator(target: any, property: string, descriptor: PropertyDescriptor) {
    if (options) {
      if (options.store instanceof StateStore) { 
        options.store.createAction(options.name || property, descriptor.value)
      } else if (options.state) {
        options.state.addAction(options.store, options.name || property, descriptor.value)
      } else {
        StateSingleton.addAction(options.store, options.name || property, descriptor.value)
      }
    } else {
      pushToPrototype(target, property, { type: ActionType.INLINE_ACTION, callback: descriptor.value })
    }

    return target
  }
}

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
export function StoreLoader (options: DecoratorOptions): Function {
  return function getDecorator(target: any, property: string, descriptor: PropertyDescriptor) {
    if (options) {
      if (options.store instanceof StateStore) { 
        options.store.createLoader(options.name || property, descriptor.value)
      } else if (options.state) {
        options.state.addLoader(options.store, options.name || property, descriptor.value)
      } else {
        StateSingleton.addLoader(options.store, options.name || property, descriptor.value)
      }
    }
    return target
  }
}

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
 export function StoreTransformer (options: DecoratorOptions): Function {
  return function getDecorator(target: any, property: string, descriptor: PropertyDescriptor) {
    if (options.store instanceof StateStore) { 
      options.store.createTransformer(options.name || property, descriptor.value)
    } else if (options.state) {
      options.state.addTransformer(options.store, options.name || property, descriptor.value)
    } else {
      StateSingleton.addTransformer(options.store, options.name || property, descriptor.value)
    }

    return target
  }
}

// could be replaced with reflect-metadata
function pushToPrototype(prototype: any, key: PropertyKey, def: DecoratorDefinition) {
  if (!Object.prototype.hasOwnProperty.call(prototype, DECORATOR_KEY)) {
    Object.defineProperty(prototype, DECORATOR_KEY, {
      enumerable: false,
      writable: true,
      configurable: true,
      ...prototype[DECORATOR_KEY]
    })
  }

  const decoratorProto: Map<string, DecoratorDefinition> = prototype[DECORATOR_KEY] || new Map<string, DecoratorDefinition>()
  decoratorProto.set(key.toString(), def)
  prototype[DECORATOR_KEY] = decoratorProto
}

export const DECORATOR_KEY = 'state-decorators'

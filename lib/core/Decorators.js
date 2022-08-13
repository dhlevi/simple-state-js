"use strict";
/* tslint:disable:ban-types max-classes-per-file */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECORATOR_KEY = exports.StoreTransformer = exports.StoreLoader = exports.StoreAction = exports.StoreListener = void 0;
var Action_1 = require("./Action");
var StateSingleton_1 = require("./StateSingleton");
var Store_1 = require("./Store");
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
function StoreListener(options) {
    if (options === void 0) { options = null; }
    return function getDecorator(target, property, descriptor) {
        if (options) {
            if (options.store instanceof Store_1.Store) {
                options.store.createListener(options.name || property, descriptor.value);
            }
            else if (options.state) {
                options.state.addListener(options.store, options.name || property, descriptor.value);
            }
            else {
                StateSingleton_1.StateSingleton.addListener(options.store, options.name || property, descriptor.value);
            }
        }
        else {
            pushToPrototype(target, property, { type: Action_1.ActionType.LISTENER, callback: descriptor.value });
        }
        return target;
    };
}
exports.StoreListener = StoreListener;
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
function StoreAction(options) {
    if (options === void 0) { options = null; }
    return function getDecorator(target, property, descriptor) {
        if (options) {
            if (options.store instanceof Store_1.Store) {
                options.store.createAction(options.name || property, descriptor.value);
            }
            else if (options.state) {
                options.state.addAction(options.store, options.name || property, descriptor.value);
            }
            else {
                StateSingleton_1.StateSingleton.addAction(options.store, options.name || property, descriptor.value);
            }
        }
        else {
            pushToPrototype(target, property, { type: Action_1.ActionType.INLINE_ACTION, callback: descriptor.value });
        }
        return target;
    };
}
exports.StoreAction = StoreAction;
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
function StoreLoader(options) {
    return function getDecorator(target, property, descriptor) {
        if (options) {
            if (options.store instanceof Store_1.Store) {
                options.store.createLoader(options.name || property, descriptor.value);
            }
            else if (options.state) {
                options.state.addLoader(options.store, options.name || property, descriptor.value);
            }
            else {
                StateSingleton_1.StateSingleton.addLoader(options.store, options.name || property, descriptor.value);
            }
        }
        return target;
    };
}
exports.StoreLoader = StoreLoader;
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
function StoreTransformer(options) {
    return function getDecorator(target, property, descriptor) {
        if (options.store instanceof Store_1.Store) {
            options.store.createTransformer(options.name || property, descriptor.value);
        }
        else if (options.state) {
            options.state.addTransformer(options.store, options.name || property, descriptor.value);
        }
        else {
            StateSingleton_1.StateSingleton.addTransformer(options.store, options.name || property, descriptor.value);
        }
        return target;
    };
}
exports.StoreTransformer = StoreTransformer;
// could be replaced with reflect-metadata
function pushToPrototype(prototype, key, def) {
    if (!Object.prototype.hasOwnProperty.call(prototype, exports.DECORATOR_KEY)) {
        Object.defineProperty(prototype, exports.DECORATOR_KEY, __assign({ enumerable: false, writable: true, configurable: true }, prototype[exports.DECORATOR_KEY]));
    }
    var decoratorProto = prototype[exports.DECORATOR_KEY] || new Map();
    decoratorProto.set(key.toString(), def);
    prototype[exports.DECORATOR_KEY] = decoratorProto;
}
exports.DECORATOR_KEY = 'state-decorators';
//# sourceMappingURL=Decorators.js.map
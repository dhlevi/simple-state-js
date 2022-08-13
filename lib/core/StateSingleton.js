"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSingleton = void 0;
/* tslint:disable:ban-types max-classes-per-file */
var State_1 = require("./State");
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
var StateSingleton = /** @class */ (function () {
    function StateSingleton() {
    }
    /**
     * Return the global state. If there is no state, a new state
     * object will be created
     * @returns The global state
     */
    StateSingleton.instance = function () {
        if (!StateSingleton._instance) {
            StateSingleton._instance = new State_1.State();
        }
        return StateSingleton._instance;
    };
    /**
     * Replace global state with a supplied state object.
     * Only use this if you know what you're doing... it will
     * totally destroy the exising state
     * @param state The state to apply
     */
    StateSingleton.replaceInstance = function (state) {
        StateSingleton._instance = state;
    };
    /**
     * Add a listener to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the listener
     * @param callback The callback to call when the listener is executed
     * @returns True if the Listener was created successfully
     */
    StateSingleton.addListener = function (store, name, callback) {
        return StateSingleton.instance().addListener(store, name, callback);
    };
    /**
     * Add an Action to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the Action
     * @param callback The callback to call when the ACtion is executed
     * @returns True if the Action was created successfully
     */
    StateSingleton.addAction = function (store, name, callback) {
        return StateSingleton.instance().addAction(store, name, callback);
    };
    /**
     * Add a Loader to a store in the managed state. If the state does not
     * have a store with the provided name, it will be added to the unbound
     * state and will be applied once that store becomes available.
     * @param store The name of the store
     * @param name The name of the Loader
     * @param callback The callback to call when the Loader is executed
     * @returns True if the Loader was created successfully
     */
    StateSingleton.addLoader = function (store, name, callback) {
        return StateSingleton.instance().addLoader(store, name, callback);
    };
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
    StateSingleton.addTransformer = function (store, name, callback) {
        return StateSingleton.instance().addTransformer(store, name, callback);
    };
    /**
     * Add a store to the managed state. This is generaly executed automatically
     * by the static store factories, but you can manually create a store and
     * add it here
     * @param store The store to add
     */
    StateSingleton.addStore = function (store) {
        StateSingleton.instance().addStore(store);
    };
    /**
     * Add a state observer to the managed state. This is generaly executed automatically
     * by the static observer factories, but you can manually create an observer and
     * add it here
     * @param observer The observer to add
     */
    StateSingleton.addStateObserver = function (observer) {
        StateSingleton.instance().addStateObserver(observer);
    };
    /**
     * Find and fetch a store by name
     * @param name The name of the store
     * @returns The store that was found, or Undefined
     */
    StateSingleton.findStore = function (name) {
        return StateSingleton.instance().findStore(name);
    };
    /**
     * Find and fetch an observer by name
     * @param name The name of the observer
     * @returns The observer that was found, or undefined
     */
    StateSingleton.findStateObserver = function (name) {
        return StateSingleton.instance().findStateObserver(name);
    };
    /**
     * Remove a store from the managed state
     * @param name The store to remove
     * @returns True if the store was removed
     */
    StateSingleton.removeStore = function (name) {
        return StateSingleton.instance().removeStore(name);
    };
    /**
     * Remove an observer from the managed state
     * @param name The observer to remove
     * @returns True if the observer was removed
     */
    StateSingleton.removeStateObserver = function (name) {
        return StateSingleton.instance().removeStateObserver(name);
    };
    /**
     * Clear all stores and unbound actions, listeners and Loaders Transformers from
     * the managed state
     * @returns True if the state was successfully cleared
     */
    StateSingleton.clearStores = function () {
        return StateSingleton.instance().clearStores();
    };
    /**
     * Clear and detach all observers
     * @returns True if the observers were cleared
     */
    StateSingleton.clearStateObservers = function () {
        return StateSingleton.instance().clearObservers();
    };
    /**
     * Flush the state entirely (Calls clearStores and clearStateObservers)
     * @returns True if the state was cleared
     */
    StateSingleton.clear = function () {
        return StateSingleton.instance().clear();
    };
    return StateSingleton;
}());
exports.StateSingleton = StateSingleton;
//# sourceMappingURL=StateSingleton.js.map
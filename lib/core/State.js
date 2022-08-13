"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
/* tslint:disable:ban-types max-classes-per-file */
var Action_1 = require("./Action");
/**
 * State structure for maintaining a consolidated state
 */
var State = /** @class */ (function () {
    function State() {
        this.stores = [];
        this.observers = [];
        this.loaders = new Map();
        this.listeners = new Map();
        this.actions = new Map();
        this.transformers = new Map();
    }
    /**
     * Add an Action Event Handler to the unbound state. Internal utility method used by
     * addListener/Loader/Action
     */
    State.prototype.addUnboundEventHandler = function (holder, store, name, callback, actionType) {
        try {
            var handlers = [];
            // Fetch our handlers, or create an empty array if we don't have handlers
            // for this store yet
            if (holder.has(store)) {
                handlers = holder.get(store);
            }
            if (!handlers) {
                handlers = [];
            }
            // Identify if we have any existing handlers
            // if we do, we want to remove it, and replace it
            // with the new one
            var existingLstener = handlers.find(function (a) { return a.name === name; });
            if (existingLstener) {
                var idx = handlers.indexOf(existingLstener);
                if (idx > -1) {
                    handlers.splice(idx, 1);
                }
            }
            // then, push the handler on, and set the holder in state
            handlers.push(new Action_1.Action(name, callback, actionType));
            holder.set(store, handlers);
            return true;
        }
        catch (error) {
            return false;
        }
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
    State.prototype.addListener = function (store, name, callback) {
        var result = this.addUnboundEventHandler(this.listeners, store, name, callback, Action_1.ActionType.LISTENER);
        var storeDef = this.findStore(store);
        if (result && storeDef) {
            result = storeDef.createListener(name, callback);
        }
        return result;
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
    State.prototype.addAction = function (store, name, callback) {
        var result = this.addUnboundEventHandler(this.actions, store, name, callback, Action_1.ActionType.ACTION);
        var storeDef = this.findStore(store);
        if (result && storeDef) {
            result = storeDef.createAction(name, callback);
        }
        return result;
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
    State.prototype.addLoader = function (store, name, callback) {
        var result = this.addUnboundEventHandler(this.loaders, store, name, callback, Action_1.ActionType.LOADER);
        var storeDef = this.findStore(store);
        if (result && storeDef) {
            result = storeDef.createLoader(name, callback);
        }
        return result;
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
     * @param callback The callback to call when the Transformer is executed
     * @returns True if the TRansformer was created successfully
     */
    State.prototype.addTransformer = function (store, name, callback) {
        var result = this.addUnboundEventHandler(this.transformers, store, name, callback, Action_1.ActionType.TRANSFORMER);
        var storeDef = this.findStore(store);
        if (result && storeDef) {
            result = storeDef.createTransformer(name, callback);
        }
        return result;
    };
    /**
     * Add a store to the managed state. This is generaly executed automatically
     * by the static store factories, but you can manually create a store and
     * add it here
     * @param store The store to add
     */
    State.prototype.addStore = function (store) {
        this.stores.push(store);
        if (this.listeners.has(store.name)) {
            var storeListeners = this.listeners.get(store.name);
            if (storeListeners) {
                for (var _i = 0, storeListeners_1 = storeListeners; _i < storeListeners_1.length; _i++) {
                    var listener = storeListeners_1[_i];
                    store.createListener(listener.name, listener.callback);
                }
            }
        }
        if (this.actions.has(store.name)) {
            var storeActions = this.actions.get(store.name);
            if (storeActions) {
                for (var _a = 0, storeActions_1 = storeActions; _a < storeActions_1.length; _a++) {
                    var action = storeActions_1[_a];
                    store.createAction(action.name, action.callback);
                }
            }
        }
        if (this.loaders.has(store.name)) {
            var storeLoaders = this.loaders.get(store.name);
            if (storeLoaders) {
                for (var _b = 0, storeLoaders_1 = storeLoaders; _b < storeLoaders_1.length; _b++) {
                    var action = storeLoaders_1[_b];
                    store.createLoader(action.name, action.callback);
                }
            }
        }
        if (this.transformers.has(store.name)) {
            var storeTransformers = this.transformers.get(store.name);
            if (storeTransformers) {
                for (var _c = 0, storeTransformers_1 = storeTransformers; _c < storeTransformers_1.length; _c++) {
                    var action = storeTransformers_1[_c];
                    store.createTransformer(action.name, action.callback);
                }
            }
        }
    };
    /**
     * Add a state observer
     * @param observer The observer to add
     */
    State.prototype.addStateObserver = function (observer) {
        this.observers.push(observer);
    };
    /**
     * Find and fetch a store by name
     * @param name The name of the store
     * @returns The store that was found, or Undefined
     */
    State.prototype.findStore = function (name) {
        return this.stores.find(function (s) { return s.name === name; });
    };
    /**
     * Find and fetch a state observer
     * @param name
     * @returns
     */
    State.prototype.findStateObserver = function (name) {
        return this.observers.find(function (o) { return o.name === name; });
    };
    /**
     * Remove a store from the managed state
     * @param name The store to remove
     * @returns True if the store was removed
     */
    State.prototype.removeStore = function (name) {
        try {
            var stores = this.stores;
            var store = stores.find(function (s) { return s.name === name; });
            if (store) {
                var storeIndex = stores.indexOf(store);
                if (storeIndex > -1) {
                    stores.splice(storeIndex, 1);
                }
                this.loaders.delete(store.name);
                this.actions.delete(store.name);
                this.listeners.delete(store.name);
                this.transformers.delete(store.name);
            }
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Removes a state observer from the state monitor
     * @param name The observer to remove
     * @returns True if the observer was removed
     */
    State.prototype.removeStateObserver = function (name) {
        try {
            var observers = this.observers;
            var observer = observers.find(function (o) { return o.name === name; });
            if (observer) {
                var observerIndex = observers.indexOf(observer);
                if (observerIndex > -1) {
                    observers.splice(observerIndex, 1);
                }
            }
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Remove all stores, and unbound Loaders, Transformers, Listeners and Actions from the state
     * @returns True if the state has been cleared
     */
    State.prototype.clearStores = function () {
        try {
            var state = this;
            state.stores = [];
            state.loaders = new Map();
            state.actions = new Map();
            state.listeners = new Map();
            state.transformers = new Map();
            return state.stores.length === 0 && state.loaders.size === 0 && state.actions.size === 0 && state.listeners.size === 0;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Clear the observers from the state
     * @returns True if observers were cleared from the state
     */
    State.prototype.clearObservers = function () {
        try {
            this.observers = [];
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Clear all stores and observers from the state
     * @returns True if observers and stores were cleared from the state
     */
    State.prototype.clear = function () {
        return this.clearStores() && this.clearObservers();
    };
    return State;
}());
exports.State = State;
//# sourceMappingURL=State.js.map
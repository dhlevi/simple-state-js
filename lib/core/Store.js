"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericDataStore = exports.Store = exports.BaseStore = void 0;
/* tslint:disable:ban-types max-classes-per-file */
var Action_1 = require("./Action");
var StateSingleton_1 = require("./StateSingleton");
var Util_1 = require("./Util");
/**
 * Base definition for Stores and Observable Stores.
 * This can be extended to create your own custom store
 * types
 */
var BaseStore = /** @class */ (function () {
    function BaseStore(name) {
        this.name = name;
        this._actions = [];
        this._listeners = [];
    }
    BaseStore.prototype.getData = function (clone) {
        if (clone === void 0) { clone = false; }
        // Return a deep copy, preserve data state?
        return clone ? (0, Util_1.deepClone)(this._data) : this._data;
    };
    BaseStore.prototype.setData = function (data) {
        if (data && typeof data === 'function') {
            throw new Error('Functions cannot be stored');
        }
        this._previousStateData = this.getData() ? (0, Util_1.deepClone)(this.getData()) : null;
        this._data = data;
    };
    /**
     * Identifies if the data stored by this Store has a been modified
     * from it's previous state. This can check for mutation on the data directly.
     * After a loader execution, this should always return false unless the data
     * was mutated directly
     * @returns
     */
    BaseStore.prototype.isDirty = function (shallow) {
        if (shallow === void 0) { shallow = true; }
        return shallow ? !(0, Util_1.shallowEquals)(this._data, this._previousStateData) : !(0, Util_1.deepEquals)(this._data, this._previousStateData);
    };
    BaseStore.prototype.acceptDirtyData = function () {
        this._previousStateData = this.getData() ? (0, Util_1.deepClone)(this.getData()) : null;
    };
    BaseStore.prototype.executeListeners = function () {
        // Only fire listeners if data is dirty
        if (this.isDirty()) {
            var previousState = this._previousStateData ? (0, Util_1.shallowClone)(this._previousStateData) : null;
            var currentState = this.getData() ? (0, Util_1.shallowClone)(this.getData()) : null;
            for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                var changeState = { newState: currentState, previousState: previousState };
                Action_1.Executable.createExecutor(listener, [changeState]).execute();
            }
        }
    };
    BaseStore.prototype.removeEventHandler = function (handlers, name) {
        try {
            var handler = handlers.find(function (s) { return s.name === name; });
            if (handler) {
                var idx = handlers.indexOf(handler);
                if (idx > -1) {
                    handlers.splice(idx, 1);
                }
            }
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Create a Listener on this store. Listeners will be triggered
     * whenever a Loader is executed successfully.
     * @param name The name of the Listener
     * @param callback The callback to execute
     * @returns True if the listener was successfully created
     */
    BaseStore.prototype.createListener = function (name, callback) {
        try {
            var existingListener = this._listeners.find(function (a) { return a.name === name; });
            if (existingListener) {
                var removedHandler = this.removeEventHandler(this._listeners, name);
                if (!removedHandler) {
                    throw Error('Failed to remove duplicate Listener. New listener cannot be created');
                }
            }
            var action = new Action_1.Action(name, callback, Action_1.ActionType.LISTENER);
            this._listeners.push(action);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Create an Action on this store. Actions can only be triggered
     * manually
     * @param name The name of the Action
     * @param callback The callback to execute
     * @returns True if the Action was successfully created
     */
    BaseStore.prototype.createAction = function (name, callback, inline) {
        if (inline === void 0) { inline = false; }
        try {
            var existingAction = this._actions.find(function (a) { return a.name === name; });
            if (existingAction) {
                var removedHandler = this.removeEventHandler(this._actions, name);
                if (!removedHandler) {
                    throw Error('Failed to remove duplicate Action. New action cannot be created');
                }
            }
            var action = new Action_1.Action(name, callback, inline ? Action_1.ActionType.INLINE_ACTION : Action_1.ActionType.ACTION);
            this._actions.push(action);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Removes the named Action
     * @param name The name of the Action
     * @returns True if the Action was successfully removed
     */
    BaseStore.prototype.removeAction = function (name) {
        return this.removeEventHandler(this._actions, name);
    };
    /**
     * Removes the named Listener
     * @param name The name of the Listener
     * @returns True if the Listener was successfully removed
     */
    BaseStore.prototype.removeListener = function (name) {
        return this.removeEventHandler(this._listeners, name);
    };
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
    BaseStore.prototype.execute = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var action, results, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        action = this._actions.find(function (a) { return a.name === name; });
                        if (!action) {
                            action = new Action_1.Action('no-op', function () { });
                        }
                        results = null;
                        if (!(action.actionType === Action_1.ActionType.INLINE_ACTION)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (_a = this.getData())[action.name].apply(_a, args)];
                    case 1:
                        results = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Action_1.Executable.createExecutor(action, args).execute()];
                    case 3:
                        results = _b.sent();
                        _b.label = 4;
                    case 4:
                        this.executeListeners();
                        return [2 /*return*/, results];
                    case 5:
                        error_1 = _b.sent();
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute any action type in a sequential chain. Each loader will be executed in the order
     * receieved, regardless of whether they are async or not. If an action has a return, it will
     * be appended to a result list. Action returns can be forwarded to the next executing action
     * by passing true to forwardResult
     *
     * @param actions A list of Executable definitions, inlucding the action name and params
     * @returns A promise that resolves to a list holding each action result
     */
    BaseStore.prototype.chain = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            var results, lastResult, forwardResult, _i, actions_1, executableDef, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        lastResult = null;
                        forwardResult = false;
                        _i = 0, actions_1 = actions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < actions_1.length)) return [3 /*break*/, 4];
                        executableDef = actions_1[_i];
                        // We can skip the forwarding anything to the first action
                        if (forwardResult) {
                            executableDef.params = __spreadArray([lastResult], executableDef.params || [], true);
                        }
                        return [4 /*yield*/, this.execute.apply(this, __spreadArray([executableDef.action], executableDef.params || [], false))];
                    case 2:
                        result = _a.sent();
                        results.push(result);
                        lastResult = result;
                        forwardResult = executableDef.forwardResult || false;
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    return BaseStore;
}());
exports.BaseStore = BaseStore;
/**
 * A Base store class. Defines the standard set of attributes and
 * default for a data store. The store is not generic, and the
 * data will accept `any` type
 */
var Store = /** @class */ (function (_super) {
    __extends(Store, _super);
    /**
     * Create a Store for holding data
     * @param options
     *
     */
    function Store(options) {
        var _this = _super.call(this, options.name) || this;
        _this.isCachable = options.isCachable || false;
        _this._isCached = false;
        _this.persistCache = options.persistCache || false;
        _this.cacheTimeoutSeconds = options.cacheTimeoutSeconds || -1;
        _this._cachePrefix = options.cachePrefix || '';
        _this._isLoading = false;
        _this._loaders = [];
        _this._transformers = [];
        _this._lastLoadTime = null;
        _this._lastStoreTime = null;
        // Load existing local store cache
        // But, we can ignore this if we're running in nodejs
        if (_this.persistCache && (!process || (process && typeof process !== 'object' && process.title !== 'node'))) {
            var previousState = localStorage.getItem("".concat(_this._cachePrefix, "state-cache-").concat(_this.name));
            if (previousState) {
                try {
                    _this._data = (0, Util_1.parseJsonString)(previousState);
                    var timeout = localStorage.getItem("".concat(_this._cachePrefix, "state-cache-").concat(_this.name, "-timeout"));
                    if (timeout && Date.now() < parseInt(timeout, 10)) {
                        _this.isCached = true;
                        _this._lastLoadTime = new Date();
                        _this._lastStoreTime = new Date();
                    }
                }
                catch (error) {
                    localStorage.removeItem("".concat(_this._cachePrefix, "state-cache-").concat(_this.name));
                    localStorage.removeItem("".concat(_this._cachePrefix, "state-cache-").concat(_this.name, "-timeout"));
                }
            }
        }
        return _this;
    }
    /**
     * Create a Store and add it to the State Singleton
     * @param name The name of the store
     * @param isCachable True if you want the store to be cacheable, defaults to FALSE
     * @param cacheTimeoutSeconds The timeout to use for invalidating the cache and loading new state, a value of zero or less will never invalidate, defaults to -1
     * @returns The created store
     */
    Store.createStore = function (options) {
        var existingStore = StateSingleton_1.StateSingleton.findStore(options.name);
        if (existingStore) {
            throw new Error("Store with the name \"".concat(options.name, "\" already exists. Please remove the store before re-creating it."));
        }
        var store = new Store(options);
        StateSingleton_1.StateSingleton.addStore(store);
        return store;
    };
    Object.defineProperty(Store.prototype, "isLoading", {
        get: function () {
            return this._isLoading;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "isCached", {
        get: function () {
            return this._isCached;
        },
        set: function (isCached) {
            this._isCached = isCached;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "cachePrefix", {
        get: function () {
            return this._cachePrefix;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "lastLoadTime", {
        get: function () {
            return this._lastLoadTime;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "lastStoreTime", {
        get: function () {
            return this._lastStoreTime;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Will return TRUE if the cache has been invalidated
     * A Cache becomes stale after the cache timeout is exceeded
     * @returns True when the cache is stale, False when the cache is valid
     */
    Store.prototype.isCacheStale = function () {
        if (!this.isCachable || !this.isCached || !this._lastStoreTime) {
            // Always return true if the store is not cachable, not cached, or we havn't stored data yet
            return true;
        }
        else if (this.cacheTimeoutSeconds <= 0) {
            // Always return false if the cachetimeout is zero or less
            return false;
        }
        else {
            // Otherwise, just check the timeout.
            return this.isCached && this._lastStoreTime && this._lastStoreTime.getTime() + (this.cacheTimeoutSeconds * 1000) < Date.now();
        }
        // The above conditions could be collapsed for simplicity, but I wanted
        // to make the states clear for explicit true/false states
    };
    Store.prototype.setData = function (data) {
        _super.prototype.setData.call(this, data);
        this._lastStoreTime = new Date();
        this.executeListeners();
    };
    Store.prototype.cacheData = function () {
        try {
            // write cache to local storage for immediate store data on reload
            // ignore if we're running in node
            localStorage.setItem("".concat(this._cachePrefix, "state-cache-").concat(this.name), JSON.stringify(this.getData()));
            var cacheTimeout = this.cacheTimeoutSeconds <= 0 ? Date.now() + 1000 * 60 * 60 * 24 : Date.now() + (this.cacheTimeoutSeconds * 1000);
            localStorage.setItem("".concat(this._cachePrefix, "state-cache-").concat(this.name, "-timeout"), (cacheTimeout).toString());
        }
        catch (error) {
            // ignore (could log out)
        }
    };
    /**
     * Create a Loader on this store. Loaders are used for loading
     * data only, and it will be expected that the result of the loader
     * can be stored in the stores data holder. Loader execution will
     * also execute any attached listeners.
     * @param name The name of the Loader
     * @param callback The callback to execute
     * @returns True if the Loader was successfully created
     */
    Store.prototype.createLoader = function (name, callback) {
        try {
            var existingLoader = this._loaders.find(function (a) { return a.name === name; });
            if (existingLoader) {
                var removedHandler = this.removeEventHandler(this._loaders, name);
                if (!removedHandler) {
                    throw Error('Failed to remove duplicate loader. New loader cannot be created');
                }
            }
            var loader = new Action_1.Action(name, callback, Action_1.ActionType.LOADER);
            this._loaders.push(loader);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Create a Transformer on this store. Transformers are
     * functions that will transform or alter the data you've
     * stored, without altering the stored data.
     * @param name The name of the Transformer
     * @param callback The callback to execute
     * @returns True if the Transformer was successfully created
     */
    Store.prototype.createTransformer = function (name, callback) {
        try {
            var existingTransformer = this._transformers.find(function (a) { return a.name === name; });
            if (existingTransformer) {
                var removedHandler = this.removeEventHandler(this._transformers, name);
                if (!removedHandler) {
                    throw Error('Failed to remove duplicate transformer. New transformer cannot be created');
                }
            }
            var transformer = new Action_1.Action(name, callback, Action_1.ActionType.TRANSFORMER);
            this._transformers.push(transformer);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Removes the named loader
     * @param name The name of the Loader
     * @returns True if the loader was successfully removed
     */
    Store.prototype.removeLoader = function (name) {
        return this.removeEventHandler(this._loaders, name);
    };
    /**
     * Removes the named Transformer
     * @param name The name of the Transformer
     * @returns True if the Transformer was successfully removed
     */
    Store.prototype.removeTransformer = function (name) {
        return this.removeEventHandler(this._transformers, name);
    };
    Store.prototype.findEventHandler = function (name) {
        return this._actions.find(function (a) { return a.name === name; }) || this._loaders.find(function (a) { return a.name === name; }) || this._transformers.find(function (a) { return a.name === name; });
    };
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
    Store.prototype.execute = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var action, results, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        action = this.findEventHandler(name);
                        if (!action) {
                            action = new Action_1.Action('no-op', function () { });
                        }
                        if (action.actionType === Action_1.ActionType.TRANSFORMER) {
                            args = __spreadArray([this.getData()], args, true);
                        }
                        if (action.actionType === Action_1.ActionType.LOADER) {
                            if (this._isLoading || !this.isCacheStale()) {
                                action = new Action_1.Action("no-op", function () { });
                            }
                            else {
                                this._isLoading = true;
                            }
                        }
                        results = null;
                        if (!(action.actionType === Action_1.ActionType.INLINE_ACTION)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (_a = this.getData())[action.name].apply(_a, args)];
                    case 1:
                        results = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Action_1.Executable.createExecutor.apply(Action_1.Executable, __spreadArray([action], args, false)).execute()];
                    case 3:
                        results = _b.sent();
                        _b.label = 4;
                    case 4:
                        if (action.actionType === Action_1.ActionType.LOADER) {
                            this._lastLoadTime = new Date();
                            if (this.isCachable) {
                                this.isCached = true;
                                if (this.persistCache && (!process || (process && typeof process !== 'object' && process.title !== 'node'))) {
                                    this.cacheData();
                                }
                            }
                            this.setData(results);
                            // Now that we've set data and alerted any listeners, we want to
                            // accept our new data as clean so they won't fire again
                            this.acceptDirtyData();
                        }
                        else {
                            this.executeListeners();
                        }
                        return [2 /*return*/, results];
                    case 5:
                        error_2 = _b.sent();
                        throw error_2;
                    case 6:
                        this._isLoading = false;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return Store;
}(BaseStore));
exports.Store = Store;
/**
 * A default generic datastore that accepts a type. This Store
 * should serve most needs for storing data
 */
var GenericDataStore = /** @class */ (function (_super) {
    __extends(GenericDataStore, _super);
    function GenericDataStore(options) {
        return _super.call(this, options) || this;
    }
    /**
     * Create a Generic Data Store of the defined type. This store will
     * also be added to the State singleton and autmatically acquire any
     * unbound actions, loaders or listeners that have been defined.
     * @param name The name of your store, used for fetching it later and decorators
     * @param isCachable Flag this store as cachable, which allows it to ignore repeat load requests. Used for code-tables that dont need reloading
     * @param cacheTimeoutSeconds If this store is cachable, this is the allowable lifetime of the cache. 0 or less will never invalidate
     * @returns The GenericDatastore that was created with this request
     */
    GenericDataStore.createStore = function (options) {
        var existingStore = StateSingleton_1.StateSingleton.findStore(options.name);
        if (existingStore) {
            throw new Error("Store with the name \"".concat(options.name, "\" already exists. Please remove the store before re-creating it."));
        }
        var store = new GenericDataStore(options);
        StateSingleton_1.StateSingleton.addStore(store);
        return store;
    };
    GenericDataStore.prototype.getData = function () {
        return _super.prototype.getData.call(this);
    };
    GenericDataStore.prototype.setData = function (data) {
        _super.prototype.setData.call(this, data);
    };
    return GenericDataStore;
}(Store));
exports.GenericDataStore = GenericDataStore;
//# sourceMappingURL=Store.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateObserver = void 0;
/* tslint:disable:ban-types max-classes-per-file only-arrow-functions */
var Action_1 = require("./Action");
var StateSingleton_1 = require("./StateSingleton");
var Decorators_1 = require("./Decorators");
var Util_1 = require("./Util");
var Store_1 = require("./Store");
// The prefix added to injected getters/setters
var INJECT_PREFIX = '@state__';
var StateObserver = /** @class */ (function (_super) {
    __extends(StateObserver, _super);
    function StateObserver(options) {
        return _super.call(this, options.name) || this;
    }
    StateObserver.prototype.getData = function () {
        return _super.prototype.getData.call(this);
    };
    StateObserver.prototype.setData = function (data) {
        throw new Error('Cannot directly change State Observer Store data');
    };
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
    StateObserver.observableStore = function (targetObject, options) {
        StateSingleton_1.StateSingleton.removeStateObserver(options.name);
        var observer = new StateObserver(options);
        StateSingleton_1.StateSingleton.addStateObserver(observer);
        // inject actions onto target by scanning the prototypes
        try {
            var decorators = targetObject[Decorators_1.DECORATOR_KEY];
            if (decorators) {
                for (var _i = 0, _a = Array.from(decorators.entries()); _i < _a.length; _i++) {
                    var entry = _a[_i];
                    var key = entry[0];
                    var value = entry[1];
                    switch (value.type) {
                        case Action_1.ActionType.ACTION:
                        case Action_1.ActionType.INLINE_ACTION:
                            observer.createAction(key, value.callback, value.type === Action_1.ActionType.INLINE_ACTION);
                            break;
                        case Action_1.ActionType.LISTENER:
                            observer.createListener(key, value.callback);
                            break;
                    }
                }
            }
            // Inject setters on attributes for observable
            // listener execution on data change
            observer.injectMonitorSetters(targetObject, observer);
        }
        catch (_error) {
            // ignore
        }
        observer._data = targetObject;
        observer._previousStateData = (0, Util_1.deepClone)(targetObject);
        return observer;
    };
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
    StateObserver.prototype.injectMonitorSetters = function (targetObject, observer) {
        var _loop_1 = function (key) {
            if (targetObject[key] instanceof Map) {
                for (var _i = 0, _a = Array.from(targetObject[key].entries()); _i < _a.length; _i++) {
                    var entry = _a[_i];
                    var mapKey = entry[0];
                    var value = entry[1];
                    if (typeof mapKey === 'object') {
                        this_1.injectMonitorSetters(mapKey, observer);
                    }
                    if (typeof value === 'object') {
                        this_1.injectMonitorSetters(value, observer);
                    }
                }
            }
            else if (targetObject[key] instanceof Array) {
                for (var _b = 0, _c = targetObject[key]; _b < _c.length; _b++) {
                    var obj = _c[_b];
                    if (typeof obj === 'object') {
                        this_1.injectMonitorSetters(obj, observer);
                    }
                }
                // observe array changes
                var me_1 = this_1;
                ['pop', 'push', 'shift', 'unshift', 'splice', 'concat'].forEach(function (m) {
                    targetObject[key][m] = function () {
                        var startLength = targetObject[key].length;
                        var res = Array.prototype[m].apply(targetObject[key], arguments);
                        var endLength = targetObject[key].length;
                        if (startLength !== endLength) {
                            if (m !== 'pop' && m !== 'splice') {
                                me_1.injectMonitorSetters(arguments, observer);
                            }
                            observer.executeListeners();
                        }
                        return res;
                    };
                });
            }
            else if (typeof targetObject[key] === 'object') {
                this_1.injectMonitorSetters(targetObject[key], observer);
            }
            else if (typeof targetObject[key] !== 'function') {
                var keyName_1 = "".concat(INJECT_PREFIX).concat(key);
                targetObject[keyName_1] = targetObject[key];
                Object.defineProperty(targetObject, key, {
                    get: function () {
                        return targetObject[keyName_1];
                    },
                    set: function (value) {
                        if (targetObject[keyName_1] !== value) {
                            var previousObject = (0, Util_1.deepClone)(targetObject);
                            observer.setPreviousData(previousObject);
                            targetObject[keyName_1] = value;
                            observer.executeListeners();
                            observer.acceptDirtyData();
                        }
                    }
                });
            }
        };
        var this_1 = this;
        for (var key in targetObject) {
            _loop_1(key);
        }
    };
    StateObserver.prototype.setPreviousData = function (previous) {
        this._previousStateData = previous;
    };
    StateObserver.prototype.executeListeners = function () {
        // Only fire listeners if data is dirty
        if (this.isDirty()) {
            var previousState = this._previousStateData ? (0, Util_1.shallowClone)(this._previousStateData) : null;
            var currentState = this.getData() ? (0, Util_1.shallowClone)(this.getData()) : null;
            this.stripInjectedValues(previousState);
            this.stripInjectedValues(currentState);
            for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                var changeState = { newState: currentState, previousState: previousState };
                Action_1.Executable.createExecutor(listener, [changeState]).execute();
            }
        }
    };
    StateObserver.prototype.stripInjectedValues = function (data, propertyName, parent) {
        if (propertyName === void 0) { propertyName = null; }
        if (parent === void 0) { parent = null; }
        if (data === null)
            return;
        if (data instanceof Array) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var entity = data_1[_i];
                this.stripInjectedValues(entity);
            }
        }
        else if (data instanceof Map) {
            for (var _a = 0, _b = Array.from(data.entries()); _a < _b.length; _a++) {
                var entry = _b[_a];
                var key = entry[0];
                var value = entry[1];
                if (typeof key === 'object') {
                    this.stripInjectedValues(key);
                }
                if (typeof value === 'object') {
                    this.stripInjectedValues(value);
                }
            }
        }
        else if (propertyName && propertyName.startsWith(INJECT_PREFIX)) {
            delete parent[propertyName];
        }
        else if (data instanceof Object) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    this.stripInjectedValues(data[property], property, data);
                }
            }
        }
    };
    return StateObserver;
}(Store_1.BaseStore));
exports.StateObserver = StateObserver;
//# sourceMappingURL=StateObserver.js.map
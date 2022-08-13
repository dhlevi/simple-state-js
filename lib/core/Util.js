"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyMapReviver = exports.stringifyMapReplacer = exports.get = exports.deepEquals = exports.deepClone = exports.shallowEquals = exports.shallowClone = exports.parseJsonString = exports.stringify = void 0;
/* tslint:disable:ban-types max-classes-per-file */
/**
 * Stringify with map replaced
 * @param obj
 * @returns
 */
function stringify(obj) {
    return JSON.stringify(obj, stringifyMapReplacer);
}
exports.stringify = stringify;
/**
 * Parse with map reviver
 * @param string
 * @returns
 */
function parseJsonString(jsonString) {
    return JSON.parse(jsonString, stringifyMapReviver);
}
exports.parseJsonString = parseJsonString;
/**
 * Clone a provided object. This clone will be shallow:
 * Parse(stringify)
 * @param obj
 * @returns
 */
function shallowClone(obj) {
    if (obj)
        return parseJsonString(stringify(obj));
    else
        return null;
}
exports.shallowClone = shallowClone;
/**
 * Do a shallow equality check for two objects
 * @param a
 * @param b
 * @returns
 */
function shallowEquals(a, b) {
    return stringify(a) === stringify(b);
}
exports.shallowEquals = shallowEquals;
/**
 * Clone a provided object. Traverse child objects as well
 * This will also traverse Arrays and Maps
 * @param obj
 * @returns
 */
function deepClone(obj) {
    var copy = null;
    if (obj === null || typeof obj !== 'object')
        return obj;
    // Date Copy
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Array Copy
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0; i < obj.length; i++) {
            copy[i] = deepClone(obj[i]);
        }
        return copy;
    }
    // Map Copy
    if (obj instanceof Map) {
        copy = new Map();
        for (var _i = 0, _a = Array.from(obj.entries()); _i < _a.length; _i++) {
            var entry = _a[_i];
            var key = entry[0];
            var value = entry[1];
            copy.set(deepClone(key), deepClone(value));
        }
        return copy;
    }
    // Object Copy
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                copy[attr] = deepClone(obj[attr]);
            }
        }
        return copy;
    }
    throw new Error('Cannot clone object');
}
exports.deepClone = deepClone;
/**
 * Test objects for deep equality
 * @param a Object A
 * @param b Object B
 * @returns True if equal
 */
function deepEquals(a, b) {
    if (typeof a !== typeof b)
        return false;
    else if (shallowEquals(a, b))
        return true;
    else if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length)
            return false;
        else {
            for (var i = 0; i < a.length; i++) {
                var result = deepEquals(a[i], b[i]);
                if (!result)
                    return false;
            }
            return true;
        }
    }
    else if (a instanceof Map && b instanceof Map) {
        if (a.size !== b.size)
            return false;
        var result = deepEquals(Array.from(a.keys()), Array.from(b.keys()));
        if (!result)
            return false;
        return deepEquals(Array.from(a.values()), Array.from(b.values()));
    }
    else if (a instanceof Object && b instanceof Object) {
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                var result = Object.prototype.hasOwnProperty.call(b, key) && deepEquals(a[key], b[key]);
                if (!result)
                    return false;
            }
        }
        return true;
    }
    else
        return a === b;
}
exports.deepEquals = deepEquals;
// find a property value from a string path "param.1.my.other.2.param"
var get = function (d, path) { return path.split('.').reduce(function (r, k) { return r === null || r === void 0 ? void 0 : r[k]; }, d); };
exports.get = get;
/**
 * Replacer for Map objects when using JSON.stringify
 * @param _key
 * @param value
 * @returns
 */
function stringifyMapReplacer(_key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    else {
        return value;
    }
}
exports.stringifyMapReplacer = stringifyMapReplacer;
/**
 * Reviver for Map objects when using JSON.parse, after stringify
 * @param _key
 * @param value
 * @returns
 */
function stringifyMapReviver(_key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}
exports.stringifyMapReviver = stringifyMapReviver;
//# sourceMappingURL=Util.js.map
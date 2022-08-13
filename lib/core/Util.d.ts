/**
 * Stringify with map replaced
 * @param obj
 * @returns
 */
export declare function stringify(obj: any): string;
/**
 * Parse with map reviver
 * @param string
 * @returns
 */
export declare function parseJsonString(jsonString: string): unknown;
/**
 * Clone a provided object. This clone will be shallow:
 * Parse(stringify)
 * @param obj
 * @returns
 */
export declare function shallowClone(obj: any): any;
/**
 * Do a shallow equality check for two objects
 * @param a
 * @param b
 * @returns
 */
export declare function shallowEquals<T>(a: T, b: T): boolean;
/**
 * Clone a provided object. Traverse child objects as well
 * This will also traverse Arrays and Maps
 * @param obj
 * @returns
 */
export declare function deepClone(obj: any): any;
/**
 * Test objects for deep equality
 * @param a Object A
 * @param b Object B
 * @returns True if equal
 */
export declare function deepEquals(a: any, b: any): boolean;
export declare const get: (d: any, path: any) => any;
/**
 * Replacer for Map objects when using JSON.stringify
 * @param _key
 * @param value
 * @returns
 */
export declare function stringifyMapReplacer(_key: any, value: any): any;
/**
 * Reviver for Map objects when using JSON.parse, after stringify
 * @param _key
 * @param value
 * @returns
 */
export declare function stringifyMapReviver(_key: any, value: any): any;

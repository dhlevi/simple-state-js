/**
 * Stringify with map replaced
 * @param obj 
 * @returns 
 */
export function stringify (obj: any): string {
  return JSON.stringify(obj, stringifyMapReplacer)
}

/**
 * Parse with map reviver
 * @param string 
 * @returns 
 */
export function parse (string: string): any {
  return JSON.parse(string, stringifyMapReviver)
}

/**
 * Clone a provided object. This clone will be shallow:
 * Parse(stringify)
 * @param obj 
 * @returns 
 */
export function shallowClone (obj: any): any {
  if (obj) return parse(stringify(obj))
  else return null
}

/**
 * Do a shallow equality check for two objects
 * @param a 
 * @param b 
 * @returns 
 */
export function shallowEquals<T> (a: T, b: T): boolean {
  return stringify(a) === stringify(b)
}

/**
 * Clone a provided object. Traverse child objects as well
 * This will also traverse Arrays and Maps
 * @param obj 
 * @returns 
 */
export function deepClone (obj: any): any {
  let copy: any = null
  if (obj === null || typeof obj !== 'object') return obj

  // Date Copy
  if (obj instanceof Date) {
    copy = new Date()
    copy.setTime(obj.getTime())
    return copy
  }

  // Array Copy
  if (obj instanceof Array) {
    copy = []
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepClone(obj[i])
    }
    return copy
  }

  // Map Copy
  if (obj instanceof Map) {
    copy = new Map<any, any>()
    for (const entry of Array.from(obj.entries())) {
      const key = entry[0]
      const value = entry[1]
      copy.set(deepClone(key), deepClone(value))
    }
    return copy
  }

  // Object Copy
  if (obj instanceof Object) {
    copy = {}
    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        copy[attr] = deepClone(obj[attr])
      }
    }
    return copy
  }

  throw new Error('Cannot clone object')
}

/**
 * Test objects for deep equality
 * @param a Object A
 * @param b Object B
 * @returns True if equal
 */
export function deepEquals (a: any, b: any): boolean {
  if (typeof a !== typeof b) return false
  else if (shallowEquals(a, b)) return true
  else if (a instanceof Array && b instanceof Array) {
    if (a.length !== b.length) return false
    else {
      for (let i = 0; i < a.length; i++) {
        const result = deepEquals(a[i], b[i])
        if (!result) return false
      }
      return true
    }
  } else if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    let result = deepEquals(Array.from(a.keys()), Array.from(b.keys()))
    if (!result) return false
    return deepEquals(Array.from(a.values()), Array.from(b.values()))
  } else if (a instanceof Object && b instanceof Object) {
    for(const key in a) {
      const result = Object.prototype.hasOwnProperty.call(b, key) && deepEquals(a[key], b[key])
      if (!result) return false
    }
    return true
  } else return a === b
}

// find a property value from a string path "param.1.my.other.2.param"
export const get = (d: any, path: any) => path.split('.').reduce((r: any, k: any) => r?.[k], d)

/**
 * Replacer for Map objects when using JSON.stringify
 * @param _key 
 * @param value 
 * @returns 
 */
export function stringifyMapReplacer(_key: any, value: any) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

/**
 * Reviver for Map objects when using JSON.parse, after stringify
 * @param _key 
 * @param value 
 * @returns 
 */
export function stringifyMapReviver(_key: any, value: any) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

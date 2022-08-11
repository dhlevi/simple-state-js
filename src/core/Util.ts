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

// find a property value from a string path "param.1.my.other.2.param"
export const get = (d: any, path: any) => path.split('.').reduce((r: any, k: any) => r?.[k], d)

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

export function stringifyMapReviver(_key: any, value: any) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

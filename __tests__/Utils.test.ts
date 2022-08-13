import { deepClone, deepEquals, shallowEquals, stringify, parse } from "../lib/core/Util"

test('Stringify with map', () => {
  const mapObj = {
    test: 'Test!',
    map: new Map<string, string>()
  }

  mapObj.map.set('thing 1', 'Hello')
  mapObj.map.set('thing 2', 'Goodby')

  const unsafeStringify = JSON.stringify(mapObj)
  const safeStringify = stringify(mapObj)

  console.log('unsafe', unsafeStringify)
  console.log('safe', safeStringify)

  expect(unsafeStringify).not.toEqual(safeStringify)
  expect(parse(unsafeStringify)).not.toEqual(parse(safeStringify))
  expect(deepEquals(mapObj, parse(safeStringify))).toBeTruthy()
})

test('Deep Equals, Shallow Equals', () => {
  expect(deepEquals(1, 1)).toBeTruthy()
  expect(deepEquals(1, 2)).toBeFalsy()
  expect(deepEquals("string", "anotherString")).toBeFalsy()
  expect(deepEquals("string", "string")).toBeTruthy()
  expect(deepEquals(new Date(10000000), new Date(10000000))).toBeTruthy()

  const obj1 = {
    param1: 'param',
    param2: [{ a: '1', b: '2'}, { a: '3', b: '4'}],
    param3: new Map<string, any>()
  }

  const obj2 = {
    param2: (deepClone(obj1.param2) as Array<any>).reverse(),
    param1: 'param',
    param3: new Map<string, any>()
  }

  obj1.param3.set("test", { a: '1', b: '2'})
  obj2.param3.set("test", { a: '1', b: '2'})

  expect(shallowEquals(obj1, obj2)).toBeFalsy()
  expect(deepEquals(obj1, obj2)).toBeFalsy()
  obj2.param2.reverse()
  expect(deepEquals(obj1, obj2)).toBeTruthy()
  obj2.param3.set("test2", { a: '1', b: '2'})
  expect(deepEquals(obj1, obj2)).toBeFalsy()
})

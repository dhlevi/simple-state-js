import { StateSingleton, GenericDataStore } from "../lib"
import { ChangeState } from "../lib/core/Options"

// For some longer running tests, we'll want more than 5 seconds
jest.setTimeout(20000)

test('Create Store', async () => {
  const store = GenericDataStore.createStore<number>({ name: 'testStore'})
  store.setData(99)

  expect(store.getData()).toBe(99);
})

test('Create Duplicate Store', async () => {
  expect(() => {
    GenericDataStore.createStore<number>({ name: 'testStore'})
  }).toThrowError('Store with the name "testStore" already exists. Please remove the store before re-creating it')
})

test('Find Store', () => {
  const store = StateSingleton.findStore('testStore') as GenericDataStore<number>
  expect(store).toBeDefined()

  const noStore = StateSingleton.findStore('nostore')
  expect(noStore).toBeUndefined()
})

test('Create Loader', async () => {
  const store = GenericDataStore.createStore<number>({ name: 'testStore2'})

  store.createLoader('loader', async () => {
    await new Promise((r) => setTimeout(r, 5000))
    return 1234
  })
  await store.execute('loader')
  expect(store.getData()).toBe(1234)
  // test isLoading
  expect(store.isLoading).toBeFalsy()
  // execute without await to test isLoading
  const loadPromise = store.execute('loader')
  expect(store.isLoading).toBeTruthy()
  await expect(loadPromise).resolves.toBe(1234)
  expect(store.isLoading).toBeFalsy()

})

test('Create Duplicate Loader', async () => {
  const store = GenericDataStore.createStore<number>({ name: 'testStore2.1' })

  store.createLoader('loader', () => {
    return 1234
  })

  store.createLoader('loader', () => {
    return 1234
  })
})

test('Create Caching Store', async () => {
  const store = GenericDataStore.createStore<number>({ name: 'testStoreCache', isCachable: true, cacheTimeoutSeconds: 5, persistCache: true })

  store.createLoader('loader', () => {
    return Math.floor(Math.random() * 1000)
  })

  expect(store.isCached).toBeFalsy()
  expect(store.isCachable).toBeTruthy()
  expect(store.isCacheStale()).toBeTruthy()

  await store.execute('loader')
  let cachedVal = store.getData()
  expect(store.isCacheStale()).toBeFalsy()
  expect(store.isCached).toBeTruthy()
  
  await store.execute('loader')
  expect(store.isCacheStale()).toBeFalsy()
  expect(store.isCached).toBeTruthy()
  // and the value won't change, because cache is not stale
  expect(store.getData()).toBe(cachedVal)

  // wait...

  await new Promise((r) => setTimeout(r, 5000))
  expect(store.isCacheStale()).toBeTruthy()
  await store.execute('loader')
  expect(store.isCacheStale()).toBeFalsy()
  // and the value will change, because cache was stale
  expect(store.getData() !== cachedVal).toBeTruthy()
  
  cachedVal = store.getData()
  StateSingleton.removeStore('testStoreCache')
  // recreate store data from cache on localStorage
  // Note, doesn't seem to pick up when running in jsdom mode
  //const recreatedStore = GenericDataStore.createStore<number>({ name: 'testStoreCache', isCachable: true, cacheTimeoutSeconds: 5, persistCache: true })
  //expect(recreatedStore.isCached).toBeTruthy()
  //expect(recreatedStore.isCacheStale()).toBeFalsy()
  //expect(recreatedStore.getData() === cachedVal).toBeTruthy()
})

test('Dirty flag', async () => {
  const store = StateSingleton.findStore('testStore') as GenericDataStore<number>
  expect(store).toBeDefined()

  store.createLoader('testDirty', () => {
    return Math.floor(Math.random() + 1000)
  })

  store.createListener('dirtyListener', (data: ChangeState) => {
    console.log('New', data.newState)
    console.log('Previous', data.previousState)
  })

  await store.execute('testDirty')

  expect(store.isDirty()).toBeFalsy()
  expect(store.isDirty(true)).toBeFalsy()
  store.setData(100)
  expect(store.isDirty()).toBeTruthy()
  expect(store.isDirty(true)).toBeTruthy()
  store.acceptDirtyData()
  expect(store.isDirty()).toBeFalsy()
  expect(store.isDirty(true)).toBeFalsy()
  store.setData(100)
  expect(store.isDirty()).toBeFalsy()
  expect(store.isDirty(true)).toBeFalsy()
})

test('Create Listener', async () => {
  const store = GenericDataStore.createStore<number>({ name: 'testStore3' })

  store.createLoader('loader', () => {
    return 1234
  })

  let listenerCalled = false
  store.createListener('listener', () => {
    listenerCalled = true
  })

  await store.execute('loader')

  expect(store.getData()).toBe(1234)
  expect(listenerCalled).toBe(true)
})

test('Create Action', async () => {
  const store = GenericDataStore.createStore<number>({ name: 'testStore4' })

  let actionCalled = false
  store.createAction('action', () => {
    actionCalled = true
  })

  await store.execute('action')
  expect(actionCalled).toBe(true)

  store.createAction('actionError', () => {
    throw Error('Action Failed')
  })
  
  await expect(store.execute('actionError')).rejects.toThrowError()
})

test('Create Transformer', async () => {
  const store = StateSingleton.findStore('testStore3') as GenericDataStore<number>

  store.createTransformer('transformer', (data: number, someArg: number) => {
    console.log('SOMEARG', someArg)
    return (data * 2) + someArg
  })

  const transformedResult = await store.execute('transformer', 100)
  expect(transformedResult).toBe(2568)
})

test('Chain Actions', async () => {
  const store = StateSingleton.findStore('testStore3') as GenericDataStore<number>

  store.createAction('returnAction', () => {
    return 100
  })

  const results = await store.chain([
    { action: 'loader' },
    { action: 'returnAction', forwardResult: true },
    { action: 'transformer' }
  ])

  expect(results).toBeDefined()
  expect(results.length).toBe(3)
  expect(results[0]).toBe(1234)
  expect(results[1]).toBe(100)
  expect(results[2]).toBe(2568)
})

test('Remove Loader', () => {
  const store = StateSingleton.findStore('testStore3') as GenericDataStore<number>
  expect(store).toBeDefined()

  const result = store.removeLoader('loader')
  expect(result).toBeTruthy()
})

test('Remove Action', () => {
  const store = StateSingleton.findStore('testStore4') as GenericDataStore<number>
  expect(store).toBeDefined()

  const result = store.removeAction('action')
  expect(result).toBeTruthy()
})

test('Remove Listener', () => {
  const store = StateSingleton.findStore('testStore3') as GenericDataStore<number>
  expect(store).toBeDefined()

  const result = store.removeListener('listener')
  expect(result).toBeTruthy()
})

test('Remove Transformer', () => {
  const store = StateSingleton.findStore('testStore3') as GenericDataStore<number>
  expect(store).toBeDefined()

  const result = store.removeListener('transformer')
  expect(result).toBeTruthy()
})

test('Add unbound Actions', async () => {
  let result = StateSingleton.addAction('newStore', 'unboundAction', () => { console.log('useless!') })
  expect(result).toBeTruthy()
  let listenerCalled = false
  result = StateSingleton.addListener('newStore', 'unboundListener', () => { listenerCalled = true })
  expect(result).toBeTruthy()
  result = StateSingleton.addLoader('newStore', 'unboundLoader', () => { return 1337 })
  expect(result).toBeTruthy()

  const store = GenericDataStore.createStore<number>({ name: 'newStore' })
  await store.execute('unboundLoader')
  expect(store.getData()).toBe(1337)
  expect(listenerCalled).toBeTruthy()
})

test('Remove Store', () => {
  const result = StateSingleton.removeStore('testStore')
  expect(result).toBeTruthy()
})

test('Clear Stores', () => {
  const result = StateSingleton.clearStores()
  expect(result).toBeTruthy()
})

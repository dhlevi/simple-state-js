# simple-state-js
A simple state manager and state observer for Javascript or Typescript

## Usage

For a basic store, which includes functions for loading data:

```Typescript
// Create a store
const store = GenericDataStore.createStore<MyObject>({ name: 'myStore'})
// Add a loader
store.createLoader('loader', async () => {
  // fetch some data (using whatever method you need to use)
  const myData: MyObject = await fetch('myDataEndpoint')
  return myData
})
// execute the loader
await store.execute('loader)
// and use your data
store.getData()
```

## State and StateSingleton

You can fetch a store via the global singleton, which is just a holder for a `State` object. The global singleton is used in place of injecting to the `global`, but if you prefer you can wire in a `State` object into `global` directly.

By default though, most actions will expect a `StateSingleton`.

```Typescript
// load an existing store from the global state
const store = StateSingleton.findStore('myStore') as GenericDataStore<MyObject>
```


### Store Options

```json
{
  name: string,
  isCachable: boolean,
  cacheTimeoutSeconds: number,
  persistCache: boolean,
  cachePrefix: string
}
```

#### `name`

The Name of the store. This is only used or needed if you want to fetch the store from the global singleton. It must be unique. Adding stores with the same name will throw an error

#### `isCachable` (optional)

Set to `True` if you want to be able to cache the data. Caching indicates that once the data is loaded, it won't reload (even if you call a loader) until the cache is expired. Useful for Objects that contain a list of code values that don't change much.

#### `cacheTimeoutSeconds` (optional)

Set a timeout value, in seconds, to indicate when the cache will flag as expired and allow a loader to refresh the data. A value of zero or less will never timeout.

#### `persistCache` (optional)

Set to `True` if you want to enable cache persistence. This will attempt to write the cached data to local storage, and when the store is recreated, it will initialize by trying to reload the data from the store. It will also track your timeout so it won't refresh unless expired. For caches with a timeout of zero or less, a default expiry of 24 hours is applied

#### `cachePrefix` (optional)

If you set persistCache to `True`, the cache prefix will apply a specified prefix value to the cache data in local storage, in case you're concerned about overwriting data.

## Loaders, Actions, Listeners, and Transformers

Loaders are the default form of action that a store will use, as it sets the data held by the store. In addition to loaders, stores can have `Actions`, `Listeners` and `Transformers`.

### Loaders

Loaders are actions that expect to load data into the store. A loader function must return data.

Executing a loader will trigger a stores listeners

```Typescript
store.createLoader('loader', async (page: number, rows: number) => {
  // fetch some data (using whatever method you need to use)
  const myData: MyObject = await fetch('myDataEndpoint')
  return myData
})
// execute the loader
await store.execute('loader', 1, 10)
```

### Listeners

Listeners are special actions that can be created to observe a store. When a stores data is changed or any action is executed, the listener actions will be automatically triggered in response, if the data state is determined to have changed.

Listeners will have a default parameter applied of the type `ChangeState`. ChangeState will include the new data state, as well as the previous data state, so changes can be compared.

Note that Listeners cannot be executed via the `execute` function.

```Typescript
store.createListener('listener', (data: ChangeState) => {
  console.log('New', data.newState)
  console.log('Previous', data.previousState)
})
// execute the loader
store.execute('loader')
// once the loader is complete, the listener will execute
```

### Actions

Actions are generic function executions. They don't have any parameters by default, but you an pass in any that you need on the executer. An action will trigger listeners if the data state is mutated.

```Typescript
store.createAction('action', (param: string, param2: object) => {
  // do something...
})
// execute the action
store.execute('action', 'hello', { test: 'value' })
// once complete, listeners will be called if data is changed
```

### Transformers

Transformers are actions that recieve the current data state as a clone, and return a new object. They can be used like any other action, but receive the data internally

```Typescript
store.createTransformer('transformer', (data: MyObject, param: number ) => {
  return data.value + param
})
// execute the action
const result = await store.execute('transformer', 100)
```

## Actions, async, and Promises

the `execute` function will always return a promise. Actions (any type) can be async or not. When executing actions, the execute function will, by default, await for the execution to complete, then return the result. You can resolve the promise or await the result.

```Typescript
// execute the action
const result = await store.execute('someAction', 100, 200, { someval: 'someval' })
// or
store.execute('action', 100, 200, { someval: 'someval' }).then(() => {
  // do something once resolved
})
```

## Action Chains

Actions can be chained together so you can execute a bunch of them without having to repeatedly call execute. Chain executions use a type `ExecutableOptions` for setting their options.

The options are:
- action
 - The name of the action to execute
- params
 - An array of parameters to pass into the action
- forwardResult
 - If true, the return of the action will be passed into the first parameter of the next action

```Typescript
store.chain([
  { action: 'loader' },
  { action: 'returnAction', forwardResult: true },
  { action: 'transformer', params: [1, 2, 3]}
]).then((transformedData: NewObject) => {
  // do something once resolved
})
```

Calling actions and loaders will execute listeners if needed, but they will not be resolved as part of the chain, but after each action/loader is complete.

# Observable Stores

Another type of store is a State Observer Store. State Observer stores are used, and behave, very differently to the basic stores details above. State Observers are a type of store that is injected directly into an object when it is constructed. The resulting store is available in the global state, as an `observer`.

A simple example:

```Typescript
class MyObservableObject {
  someParam: string
  someOtherParam: number
  constructor (p1: string, p2: number) {
    someParam = p1
    someOtherParam = p2

    // Create the observer 
    StateObserver.observableStore(this, {
      name: 'myObservable'
    })
  }

  @StoreListener()
  private changeDetect (data: ChangeState) {
    console.log('Change Detected')
    console.log('Previous', data.previousState)
    console.log('Now', data.newState)
  }

  @StoreAction()
  public doSomething () {
    this.someOtherParam += 100
  }
}

const myObserver = new MyObservableObject('hello', 100)
// changeDetect will be executed once the param is updated
myObserver.someOtherParam += 100
// changeDetect will be executed again
myObserver.doSomething()

// you can load the store from the global state
const store = StateSingleton.findStateObserver<MyObservableObject>('myObservable') as StateObserver<MyObservableObject>
// this will call changeDetect too
store.getData().someOtherParam += 100
store.setData() // this will throw an exception
```

The key piece is executing `StateObserver.observableStore`. Typically, this would be added to your classes constructor (but technically doesn't need to be). Once this is executed, your class will be observable, and any mutation done to the class parameters will trigger listeners.

In place of using `store.addAction` or `store.addListener` you can use decorators for identifying which functions are actions or listeners on your observable class. the add functions are still available on the store directly, however, in case you want to listen or execute actions from another object.

The same "no duplicate name" rules on stores apply to observable stores. You must ensure your names are unique. Attempting to create a second object of an observable store

Observable stores are not cachable or persistable.

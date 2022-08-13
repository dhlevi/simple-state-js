import { StateSingleton } from "../lib"
import { TestStore } from "../__mocks__/TestObserverStore"

// For some longer running tests, we'll want more than 5 seconds
jest.setTimeout(20000)

test('Observable Store', async () => {
  const observerClass = new TestStore()
  const observer = StateSingleton.findStateObserver('employees')
  let changes = 0
  observer?.createListener('changeCounter', () => {
    console.log('Call changecounter')
    changes++
  })
  expect(observer).toBeDefined()

  await observerClass.increaseWages(0.05)
  expect(changes).toBe(3)

  await observerClass.addResource()
  await new Promise((r) => setTimeout(r, 5000))
  expect(changes).toBe(4)

  const newObserverClass = new TestStore()
  const reloadedStore = StateSingleton.findStateObserver<TestStore>('employees')
  // At this point, the store stored in the singleton has been replaced with the 
  // newObserverClass
  expect(reloadedStore).toBeDefined()
  expect(reloadedStore?.getData().employees.length).toEqual(newObserverClass.employees.length)
  expect(reloadedStore?.getData().employees.length).not.toEqual(observerClass.employees.length)
})

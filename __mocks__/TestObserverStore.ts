import { ChangeState, GenericDataStore, StateObserver, StoreAction, StoreListener } from "../lib"
import { StoreTransformer } from "../lib/core/Decorators"

class Employment {
  job: string
  wage: number
  constructor (job: string, wage: number) {
    this.job = job
    this.wage = wage
  }
}

class Resource {
  id: number
  firstName: string
  lastName: string
  employment: Employment
  constructor (id: number, firstName: string, lastName: string, employment: Employment) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.employment = employment
  }
}

export class TestStore {
  employees: Array<Resource>
  roles: Map<string, Array<Employment>>
  constructor () {
    this.employees = []
    this.roles = new Map<string, Array<Employment>>()

    this.employees.push(new Resource(1, 'Jim', 'Jimmson', {
      job: 'Manager',
      wage: 100
    }))

    this.employees.push(new Resource(2, 'Jane', 'Janeson', {
      job: 'CEO',
      wage: 1000
    }))

    this.employees.push(new Resource(3, 'John', 'Johnson', {
      job: 'Janitor',
      wage: 87.66
    }))

    this.roles.set('Executive', [{
      job: 'Manager',
      wage: 100
    },{
      job: 'CEO',
      wage: 1000
    },{
      job: 'CTO',
      wage: 900
    }])

    this.roles.set('Grunts', [{
      job: 'Janitor',
      wage: 87.66
    },{
      job: 'Drone (sector 7G)',
      wage: 34.11
    },{
      job: 'Clerk',
      wage: 65.43
    }])

    StateObserver.observableStore(this, {
      name: 'employees'
    })
  }

  public addResource () {
    console.log('push complete, waiting for listener')
    this.employees.push({
      id: 123,
      firstName: 'Ham',
      lastName: 'Sandwich',
      employment: {
        job: 'test',
        wage: 1
      }
    })
  }

  @StoreListener()
  private changeDetect (data: ChangeState) {
    console.log('Change Detected')
    console.log('Previous', data.previousState)
    console.log('Now', data.newState)
  }

  @StoreAction()
  public increaseWages (bumpPercent: number) {
    if (bumpPercent > 1) throw new Error ('Value must be between 0.0 and 1.0')
    for (const employee of this.employees) {
      employee.employment.wage += employee.employment.wage * bumpPercent
    }
  }
}
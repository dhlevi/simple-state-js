/* tslint:disable:ban-types max-classes-per-file */

/**
 * Action Types. When defining actions, use Loader, Transformer or Listener
 * Inline Action is a special type for observable stores, and shouldn't
 * be used unless you're sure you've manually wired things correctly
 * for inline action execution. This is not exposed to the action add
 * methods from Store or State.
 */
export enum ActionType { LOADER, TRANSFORMER, LISTENER, ACTION, INLINE_ACTION }

/**
 * An action is a non-functional holder for a callback
 * isLoader is a flag that identifies this action as an
 * action that can load data for the store. It is expected
 * that if isLoader = true, the callback will return data.
 * This will also trigger listeners
 */
export class Action {
  readonly name: string
  readonly callback: Function
  readonly actionType: ActionType

  constructor (name: string, callback: Function, actionType: ActionType = ActionType.ACTION) {
    this.name = name
    this.callback = callback
    this.actionType = actionType
  }
}

/**
 * An Executable is a holder for an Action, and the parameters
 * to apply when executing the action. The only functional component
 * of an Executable is a state Create function, and the execute
 * function which will execute the action with the provided parameters
 */
export class Executable {
  readonly action: Action
  readonly params: any[]

  private constructor (action: Action, ...params: any[]) {
    this.action = action
    this.params = params
  }

  /**
   * Create an Executer for the provided action. Executers are just holders for
   * an action, and the parameters to apply to it.
   * @param action 
   * @param params 
   * @returns 
   */
  public static createExecutor (action: Action, ...params: any[]): Executable {
    return new Executable(action, ...params)
  }

  /**
   * Asyncronously execute the action
   * @returns A Promise that will resolve to the result of the action callback
   * @Throws Action execution errors will be re-thrown by this function
   */
  public async execute (): Promise<any> {
    if (this.action.callback) {
      try {
        return await this.action.callback.apply(this.action.callback, this.params)
      } catch (error) {
        throw Error(error as string)
      }
    }
  }
}

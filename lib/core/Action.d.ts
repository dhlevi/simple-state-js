/**
 * Action Types. When defining actions, use Loader, Transformer or Listener
 * Inline Action is a special type for observable stores, and shouldn't
 * be used unless you're sure you've manually wired things correctly
 * for inline action execution. This is not exposed to the action add
 * methods from Store or State.
 */
export declare enum ActionType {
    LOADER = 0,
    TRANSFORMER = 1,
    LISTENER = 2,
    ACTION = 3,
    INLINE_ACTION = 4
}
/**
 * An action is a non-functional holder for a callback
 * isLoader is a flag that identifies this action as an
 * action that can load data for the store. It is expected
 * that if isLoader = true, the callback will return data.
 * This will also trigger listeners
 */
export declare class Action {
    readonly name: string;
    readonly callback: Function;
    readonly actionType: ActionType;
    constructor(name: string, callback: Function, actionType?: ActionType);
}
/**
 * An Executable is a holder for an Action, and the parameters
 * to apply when executing the action. The only functional component
 * of an Executable is a state Create function, and the execute
 * function which will execute the action with the provided parameters
 */
export declare class Executable {
    readonly action: Action;
    readonly params: any[];
    private constructor();
    /**
     * Create an Executer for the provided action. Executers are just holders for
     * an action, and the parameters to apply to it.
     * @param action
     * @param params
     * @returns
     */
    static createExecutor(action: Action, ...params: any[]): Executable;
    /**
     * Asyncronously execute the action
     * @returns A Promise that will resolve to the result of the action callback
     * @Throws Action execution errors will be re-thrown by this function
     */
    execute(): Promise<any>;
}

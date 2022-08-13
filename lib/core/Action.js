"use strict";
/* tslint:disable:ban-types max-classes-per-file */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executable = exports.Action = exports.ActionType = void 0;
/**
 * Action Types. When defining actions, use Loader, Transformer or Listener
 * Inline Action is a special type for observable stores, and shouldn't
 * be used unless you're sure you've manually wired things correctly
 * for inline action execution. This is not exposed to the action add
 * methods from Store or State.
 */
var ActionType;
(function (ActionType) {
    ActionType[ActionType["LOADER"] = 0] = "LOADER";
    ActionType[ActionType["TRANSFORMER"] = 1] = "TRANSFORMER";
    ActionType[ActionType["LISTENER"] = 2] = "LISTENER";
    ActionType[ActionType["ACTION"] = 3] = "ACTION";
    ActionType[ActionType["INLINE_ACTION"] = 4] = "INLINE_ACTION";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
/**
 * An action is a non-functional holder for a callback
 * isLoader is a flag that identifies this action as an
 * action that can load data for the store. It is expected
 * that if isLoader = true, the callback will return data.
 * This will also trigger listeners
 */
var Action = /** @class */ (function () {
    function Action(name, callback, actionType) {
        if (actionType === void 0) { actionType = ActionType.ACTION; }
        this.name = name;
        this.callback = callback;
        this.actionType = actionType;
    }
    return Action;
}());
exports.Action = Action;
/**
 * An Executable is a holder for an Action, and the parameters
 * to apply when executing the action. The only functional component
 * of an Executable is a state Create function, and the execute
 * function which will execute the action with the provided parameters
 */
var Executable = /** @class */ (function () {
    function Executable(action) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        this.action = action;
        this.params = params;
    }
    /**
     * Create an Executer for the provided action. Executers are just holders for
     * an action, and the parameters to apply to it.
     * @param action
     * @param params
     * @returns
     */
    Executable.createExecutor = function (action) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return new (Executable.bind.apply(Executable, __spreadArray([void 0, action], params, false)))();
    };
    /**
     * Asyncronously execute the action
     * @returns A Promise that will resolve to the result of the action callback
     * @Throws Action execution errors will be re-thrown by this function
     */
    Executable.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.action.callback) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.action.callback.apply(this.action.callback, this.params)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        throw Error(error_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Executable;
}());
exports.Executable = Executable;
//# sourceMappingURL=Action.js.map
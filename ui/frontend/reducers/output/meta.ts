import { Action, ActionType } from '../../actions';
import { Focus } from '../../types';

import api from '../api';

const DEFAULT: State = {
};

interface State {
  focus?: Focus;
}

export default function meta(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.ChangeFocus:
      return { ...state, focus: action.focus };

    case ActionType.RequestMacroExpansion:
      return { ...state, focus: Focus.MacroExpansion };

    case ActionType.CompileLlvmIrRequest:
      return { ...state, focus: Focus.LlvmIr };

    case ActionType.CompileMirRequest:
      return { ...state, focus: Focus.Mir };

    case ActionType.CompileHirRequest:
      return { ...state, focus: Focus.Hir };

    case ActionType.CompileWasmRequest:
      return { ...state, focus: Focus.Wasm };

    case ActionType.CompileAssemblyRequest:
      return { ...state, focus: Focus.Asm };

    case ActionType.ExecuteRequest:
      return { ...state, focus: Focus.Execute };

    case ActionType.RequestGistLoad:
    case ActionType.RequestGistSave:
      return { ...state, focus: Focus.Gist };

    default:
      if (api.endpoints.format.matchPending(action)) {
        return { ...state, focus: Focus.Format };
      } else if (api.endpoints.format.matchFulfilled(action)) {
        return { ...state, focus: undefined };
      } else if (api.endpoints.clippy.matchPending(action)) {
        return { ...state, focus: Focus.Clippy };
      } else if (api.endpoints.miri.matchPending(action)) {
        return { ...state, focus: Focus.Miri };
      } else {
        return state;
      }
  }
}

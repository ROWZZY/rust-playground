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

    case ActionType.RequestClippy:
      return { ...state, focus: Focus.Clippy };

    case ActionType.RequestMiri:
      return { ...state, focus: Focus.Miri };

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
      } else {
        return state;
      }
  }
}

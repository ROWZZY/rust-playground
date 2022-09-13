import { Action, ActionType } from '../../actions';
import { finish, start } from './sharedStateManagement';

const DEFAULT: State = {
  requestsInProgress: 0,
};

interface State {
  requestsInProgress: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export default function execute(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.ExecuteRequest:
      return start(DEFAULT, state);
    case ActionType.ExecuteSucceeded: {
      const { stdout = '', stderr = '' } = action;
      return finish(state, { stdout, stderr });
    }
    case ActionType.ExecuteFailed: {
      const { error } = action;
      return finish(state, { error });
    }
    default:
      return state;
  }
}

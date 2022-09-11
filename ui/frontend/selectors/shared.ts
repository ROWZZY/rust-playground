import { createSelector } from 'reselect';

import State from '../state';
import { PrimaryActionCore } from '../types';

export const selectCode = (state: State) => state.code;

const HAS_TESTS_RE = /^\s*#\s*\[\s*test\s*([^"]*)]/m;
const selectHasTests = createSelector(selectCode, code => !!code.match(HAS_TESTS_RE));

const HAS_MAIN_FUNCTION_RE = /^\s*(pub\s+)?\s*(const\s+)?\s*(async\s+)?\s*fn\s+main\s*\(\s*\)/m;
export const selectHasMainFunction = createSelector(selectCode, code => !!code.match(HAS_MAIN_FUNCTION_RE));

const CRATE_TYPE_RE = /^\s*#!\s*\[\s*crate_type\s*=\s*"([^"]*)"\s*]/m;
const selectUserCrateType = createSelector(selectCode, code => (code.match(CRATE_TYPE_RE) || [])[1]);

export const selectAutoPrimaryAction = createSelector(
  selectUserCrateType,
  selectHasTests,
  selectHasMainFunction,
  (crateType, hasTests, hasMainFunction) => {
    if (crateType && crateType !== 'proc-macro') {
      if (crateType === 'bin') {
        return PrimaryActionCore.Execute;
      } else {
        return PrimaryActionCore.Compile;
      }
    } else {
      if (hasTests) {
        return PrimaryActionCore.Test;
      } else if (hasMainFunction) {
        return PrimaryActionCore.Execute;
      } else {
        return PrimaryActionCore.Compile;
      }
    }
  },
);

export const selectEdition = (state: State) => state.configuration.edition;

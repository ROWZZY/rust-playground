import { combineReducers } from 'redux';

import assembly from './assembly';
import execute from './execute';
import gist from './gist';
import hir from './hir';
import llvmIr from './llvmIr';
import macroExpansion from './macroExpansion';
import meta from './meta';
import mir from './mir';
import wasm from './wasm';

const output = combineReducers({
  meta,
  macroExpansion,
  assembly,
  llvmIr,
  mir,
  hir,
  wasm,
  execute,
  gist,
});

export type State = ReturnType<typeof output>;

export default output;

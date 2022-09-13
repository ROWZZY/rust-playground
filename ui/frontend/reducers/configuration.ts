import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  AssemblyFlavor,
  Backtrace,
  Channel,
  DemangleAssembly,
  Edition,
  Editor,
  Mode,
  Orientation,
  PairCharacters,
  PrimaryAction,
  PrimaryActionAuto,
  ProcessAssembly,
} from '../types';

export interface State {
  editor: Editor;
  ace: {
    keybinding: string;
    theme: string;
    pairCharacters: PairCharacters;
  };
  monaco: {
    theme: string;
  };
  orientation: Orientation;
  assemblyFlavor: AssemblyFlavor;
  demangleAssembly: DemangleAssembly;
  processAssembly: ProcessAssembly;
  primaryAction: PrimaryAction;
  channel: Channel;
  mode: Mode;
  edition: Edition;
  backtrace: Backtrace;
}

const initialState: State = {
  editor: Editor.Ace,
  ace: {
    keybinding: 'ace',
    theme: 'github',
    pairCharacters: PairCharacters.Enabled,
  },
  monaco: {
    theme: 'vscode-dark-plus',
  },
  orientation: Orientation.Automatic,
  assemblyFlavor: AssemblyFlavor.Att,
  demangleAssembly: DemangleAssembly.Demangle,
  processAssembly: ProcessAssembly.Filter,
  primaryAction: PrimaryActionAuto.Auto,
  channel: Channel.Stable,
  mode: Mode.Debug,
  edition: Edition.Rust2021,
  backtrace: Backtrace.Disabled,
};

const slice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    changeEditor: (state, action: PayloadAction<Editor>) => {
      state.editor = action.payload;
    },

    changeKeybinding: (state, action: PayloadAction<string>) => {
      state.ace.keybinding = action.payload;
    },

    changeAceTheme: (state, action: PayloadAction<string>) => {
      state.ace.theme = action.payload;
    },

    changePairCharacters: (state, action: PayloadAction<PairCharacters>) => {
      state.ace.pairCharacters = action.payload;
    },

    changeMonacoTheme: (state, action: PayloadAction<string>) => {
      state.monaco.theme = action.payload;
    },

    changeOrientation: (state, action: PayloadAction<Orientation>) => {
      state.orientation = action.payload;
    },

    changeAssemblyFlavor: (state, action: PayloadAction<AssemblyFlavor>) => {
      state.assemblyFlavor = action.payload;
    },

    changeDemangleAssembly: (state, action: PayloadAction<DemangleAssembly>) => {
      state.demangleAssembly = action.payload;
    },

    changeProcessAssembly: (state, action: PayloadAction<ProcessAssembly>) => {
      state.processAssembly = action.payload;
    },

    changePrimaryAction: (state, action: PayloadAction<PrimaryAction>) => {
      state.primaryAction = action.payload;
    },

    changeChannel: (state, action: PayloadAction<Channel>) => {
      state.channel = action.payload;
    },

    changeMode: (state, action: PayloadAction<Mode>) => {
      state.mode = action.payload;
    },

    changeEdition: (state, action: PayloadAction<Edition>) => {
      state.edition = action.payload;
    },

    changeBacktrace: (state, action: PayloadAction<Backtrace>) => {
      state.backtrace = action.payload;
    },
  },
});

export const {
  changeEditor,
  changeKeybinding,
  changeAceTheme,
  changePairCharacters,
  changeMonacoTheme,
  changeOrientation,
  changeAssemblyFlavor,
  changeDemangleAssembly,
  changeProcessAssembly,
  changePrimaryAction,
  changeChannel,
  changeMode,
  changeEdition,
  changeBacktrace,
} = slice.actions;

export default slice.reducer;

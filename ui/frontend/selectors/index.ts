import { source } from 'common-tags';
import { createSelector } from 'reselect';
import * as url from 'url';

import { selectFormat, selectClippy, selectMiri } from '../reducers/api';
import { State } from '../reducers';
import {
  AceResizeKey,
  Backtrace,
  Channel,
  Edition,
  Orientation,
  PrimaryActionAuto,
  PrimaryActionCore,
  Version,
} from '../types';

import * as shared from './shared';
const {
  selectAutoPrimaryAction,
  selectCode,
  selectEdition,
} = shared;
export const {
  selectCrateType,
  selectHasMainFunction,
} = shared;

export const runAsTest = createSelector(
  selectAutoPrimaryAction,
  primaryAction => primaryAction === PrimaryActionCore.Test,
);

const selectRawPrimaryAction = (state: State) => state.configuration.primaryAction;

export const selectIsAutoBuild = createSelector(
  selectRawPrimaryAction,
  selectAutoPrimaryAction,
  (primaryAction, autoPrimaryAction) => (
    primaryAction === PrimaryActionAuto.Auto && autoPrimaryAction === PrimaryActionCore.Compile
  ),
);

const primaryActionSelector = createSelector(
  selectRawPrimaryAction,
  selectAutoPrimaryAction,
  (primaryAction, autoPrimaryAction): PrimaryActionCore => (
    primaryAction === PrimaryActionAuto.Auto ? autoPrimaryAction : primaryAction
  ),
);

const LABELS: { [index in PrimaryActionCore]: string } = {
  [PrimaryActionCore.Asm]: 'Show Assembly',
  [PrimaryActionCore.Compile]: 'Build',
  [PrimaryActionCore.Execute]: 'Run',
  [PrimaryActionCore.LlvmIr]: 'Show LLVM IR',
  [PrimaryActionCore.Hir]: 'Show HIR',
  [PrimaryActionCore.Mir]: 'Show MIR',
  [PrimaryActionCore.Test]: 'Test',
  [PrimaryActionCore.Wasm]: 'Show WASM',
};

export const getExecutionLabel = createSelector(primaryActionSelector, primaryAction => LABELS[primaryAction]);

const selectStableVersion = (state: State) => state.versions?.stable;
const selectBetaVersion = (state: State) => state.versions?.beta;
const selectNightlyVersion = (state: State) => state.versions?.nightly;
const selectRustfmtVersion = (state: State) => state.versions?.rustfmt;
const selectClippyVersion = (state: State) => state.versions?.clippy;
const selectMiriVersion = (state: State) => state.versions?.miri;

const versionNumber = (v: Version | undefined) => v ? v.version : '';
export const selectStableVersionText = createSelector(selectStableVersion, versionNumber);
export const selectBetaVersionText = createSelector(selectBetaVersion, versionNumber);
export const selectNightlyVersionText = createSelector(selectNightlyVersion, versionNumber);
export const selectClippyVersionText = createSelector(selectClippyVersion, versionNumber);
export const selectRustfmtVersionText = createSelector(selectRustfmtVersion, versionNumber);
export const selectMiriVersionText = createSelector(selectMiriVersion, versionNumber);

const versionDetails = (v: Version | undefined) => v ? `${v.date} ${v.hash.slice(0, 20)}` : '';
export const selectBetaVersionDetailsText = createSelector(selectBetaVersion, versionDetails);
export const selectNightlyVersionDetailsText = createSelector(selectNightlyVersion, versionDetails);
export const selectClippyVersionDetailsText = createSelector(selectClippyVersion, versionDetails);
export const selectRustfmtVersionDetailsText = createSelector(selectRustfmtVersion, versionDetails);
export const selectMiriVersionDetailsText = createSelector(selectMiriVersion, versionDetails);

export const isNightlyChannel = (state: State) => (
  state.configuration.channel === Channel.Nightly
);
export const isWasmAvailable = isNightlyChannel;
export const isHirAvailable = isNightlyChannel;

export const getModeLabel = (state: State) => {
  const { configuration: { mode } } = state;
  return `${mode}`;
};

export const getChannelLabel = (state: State) => {
  const { configuration: { channel } } = state;
  return `${channel}`;
};

export const isEditionDefault = createSelector(
  selectEdition,
  edition => edition == Edition.Rust2021,
);

export const selectBacktraceEnabled = createSelector(
  (state: State) => state.configuration.backtrace,
  (backtrace) => backtrace === Backtrace.Enabled,
);

export const getAdvancedOptionsSet = createSelector(
  isEditionDefault, selectBacktraceEnabled,
  (editionDefault, backtraceSet) => (
    !editionDefault || backtraceSet
  ),
);

export const hasProperties = (obj: {}) => Object.values(obj).some(val => !!val);

const getOutputs = (state: State) => [
  state.output.assembly,
  state.output.execute,
  state.output.gist,
  state.output.llvmIr,
  state.output.mir,
  state.output.hir,
  state.output.macroExpansion,
  state.output.wasm,
];

export const getSomethingToShow = createSelector(
  getOutputs,
  selectFormat,
  selectClippy,
  selectMiri,
  (outs, ...newOuts) => outs.some(hasProperties) || newOuts.some(o => !o.isUninitialized),
);

const baseUrlSelector = (state: State) =>
  state.globalConfiguration.baseUrl;

const gistSelector = (state: State) =>
  state.output.gist;

// Selects url.query of build configs.
const urlQuerySelector = createSelector(
  gistSelector,
  gist => ({
    version: gist.channel,
    mode: gist.mode,
    edition: gist.edition,
  }),
);

export const showGistLoaderSelector = createSelector(
  gistSelector,
  gist => gist.requestsInProgress > 0,
);

export const permalinkSelector = createSelector(
  baseUrlSelector, urlQuerySelector, gistSelector,
  (baseUrl, query, gist) => {
    const u = url.parse(baseUrl, true);
    u.query = { ...query, gist: gist.id };
    return url.format(u);
  },
);

const codeBlock = (code: string, language = '') =>
  '```' + language + `\n${code}\n` + '```';

const maybeOutput = (code: string | undefined, whenPresent: (_: string) => void) => {
  if (code && code.length !== 0) { whenPresent(code); }
};

const snippetSelector = createSelector(
  gistSelector, permalinkSelector,
  (gist, permalink) => {
    let snippet = '';

    maybeOutput(gist.code, code => {
      snippet += source`
        ${codeBlock(code, 'rust')}

        ([Playground](${permalink}))
      `;
    });

    maybeOutput(gist.stdout, stdout => {
      snippet += '\n\n';
      snippet +=
        source`
          Output:

          ${codeBlock(stdout)}
        `;
    });

    maybeOutput(gist.stderr, stderr => {
      snippet += '\n\n';
      snippet +=
        source`
          Errors:

          ${codeBlock(stderr)}
        `;
    });

    return snippet;
  },
);

export const urloUrlSelector = createSelector(
  snippetSelector,
  snippet => {
    const newUsersPostUrl = url.parse('https://users.rust-lang.org/new-topic', true);
    newUsersPostUrl.query = { body: snippet };
    return url.format(newUsersPostUrl);
  },
);

export const codeUrlSelector = createSelector(
  baseUrlSelector, urlQuerySelector, gistSelector,
  (baseUrl, query, gist) => {
    const u = url.parse(baseUrl, true);
    u.query = { ...query, code: gist.code };
    return url.format(u);
  },
);

const notificationsSelector = (state: State) => state.notifications;

const NOW = new Date();

const MONACO_EDITOR_AVAILABLE_END = new Date('2022-02-15T00:00:00Z');
const MONACO_EDITOR_AVAILABLE_OPEN = NOW <= MONACO_EDITOR_AVAILABLE_END;
export const showMonacoEditorAvailableSelector = createSelector(
  notificationsSelector,
  notifications => MONACO_EDITOR_AVAILABLE_OPEN && !notifications.seenMonacoEditorAvailable,
);

export const anyNotificationsToShowSelector = createSelector(
  showMonacoEditorAvailableSelector,
  (...allNotifications) => allNotifications.some(n => n),
);

export const selectCompileRequest = createSelector(
  selectCode,
  (state: State) => {
    const { channel, mode, edition, assemblyFlavor, demangleAssembly, processAssembly } = state.configuration;
    return { channel, mode, edition, assemblyFlavor, demangleAssembly, processAssembly };
  },
  selectBacktraceEnabled,
  selectCrateType,
  runAsTest,
  (_state: State, target: string) => target,
  (code, base, backtrace, crateType, tests, target) => ({ ...base, code, backtrace, crateType, tests, target }),
);

export const selectExecuteRequest = createSelector(
  selectCode,
  (state: State) => {
    const { channel, mode, edition } = state.configuration;
    return { channel, mode, edition };
  },
  selectBacktraceEnabled,
  (_state: State, crateType: string, tests: boolean) => ({ crateType, tests }),
  (code, base, backtrace, { crateType, tests }) => ({ ...base, code, backtrace, crateType, tests }),
)

const focus = (state: State) => state.output.meta.focus;
export const isOutputFocused = createSelector(
  focus,
  (focus) => !!focus,
);

const orientationConfig = (state: State) => state.configuration.orientation;
const browserWidthIsSmall = (state: State) => state.browser.isSmall;

export const orientation = createSelector(
  orientationConfig,
  browserWidthIsSmall,
  (orientation, widthIsSmall) => {
    if (orientation == Orientation.Automatic) {
      if (widthIsSmall) { return Orientation.Horizontal } else { return Orientation.Vertical }
    } else {
      return orientation;
    }
  }
)

const ratioGeneration = (state: State) => state.browser.ratioGeneration;

export const aceResizeKey = createSelector(
  focus,
  ratioGeneration,
  (focus, ratioGeneration): AceResizeKey => [focus, ratioGeneration],
)

export const offerCrateAutocompleteOnUse = createSelector(
  selectEdition,
  (edition) => edition !== Edition.Rust2015,
);

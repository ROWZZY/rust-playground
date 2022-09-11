import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import ButtonMenuItem from './ButtonMenuItem';
import MenuGroup from './MenuGroup';
import MenuAside from './MenuAside';

import { usePerformFormat } from './reducers/api';
import * as selectors from './selectors';
import * as actions from './actions';
import { useAppDispatch } from './configureStore';

interface ToolsMenuProps {
  close: () => void;
}

const ToolsMenu: React.FC<ToolsMenuProps> = props => {
  const rustfmtVersion = useSelector(selectors.selectRustfmtVersionText);
  const rustfmtVersionDetails = useSelector(selectors.selectRustfmtVersionDetailsText);
  const clippyVersionDetails = useSelector(selectors.selectClippyVersionDetailsText);
  const clippyVersion = useSelector(selectors.selectClippyVersionText);
  const miriVersionDetails = useSelector(selectors.selectMiriVersionDetailsText);
  const miriVersion = useSelector(selectors.selectMiriVersionText);
  const nightlyVersion = useSelector(selectors.selectNightlyVersionText);
  const nightlyVersionDetails = useSelector(selectors.selectNightlyVersionDetailsText);

  const dispatch = useAppDispatch();
  const performFormat = usePerformFormat();

  const clippy = useCallback(() => {
    dispatch(actions.performClippy());
    props.close();
  }, [dispatch, props]);
  const miri = useCallback(() => {
    dispatch(actions.performMiri());
    props.close();
  }, [dispatch, props]);
  const format = useCallback(() => {
    performFormat();
    props.close();
  }, [performFormat, props]);
  const expandMacros = useCallback(() => {
    dispatch(actions.performMacroExpansion());
    props.close();
  }, [dispatch, props]);

  return (
    <MenuGroup title="Tools">
      <ButtonMenuItem
        name="Rustfmt"
        onClick={format}>
        <div>Format this code with Rustfmt.</div>
        <MenuAside>{rustfmtVersion} ({rustfmtVersionDetails})</MenuAside>
      </ButtonMenuItem>
      <ButtonMenuItem
        name="Clippy"
        onClick={clippy}>
        <div>Catch common mistakes and improve the code using the Clippy linter.</div>
        <MenuAside>{clippyVersion} ({clippyVersionDetails})</MenuAside>
      </ButtonMenuItem>
      <ButtonMenuItem
        name="Miri"
        onClick={miri}>
        <div>
          Execute this program in the Miri interpreter to detect certain
          cases of undefined behavior (like out-of-bounds memory access).
        </div>
        <MenuAside>{miriVersion} ({miriVersionDetails})</MenuAside>
      </ButtonMenuItem>
      <ButtonMenuItem
        name="Expand macros"
        onClick={expandMacros}>
        <div>
          Expand macros in code using the nightly compiler.
        </div>
        <MenuAside>{nightlyVersion} ({nightlyVersionDetails})</MenuAside>
      </ButtonMenuItem>
    </MenuGroup>
  );
};

export default ToolsMenu;

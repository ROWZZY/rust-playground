import React, { Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import MenuGroup from './MenuGroup';
import SelectOne from './SelectOne';

import * as actions from './reducers/configuration';
import * as selectors from './selectors';
import State from './state';
import { Channel } from './types';

import styles from './ChannelMenu.module.css';

interface ChannelMenuProps {
  close: () => void;
}

const ChannelMenu: React.FC<ChannelMenuProps> = props => {
  const channel = useSelector((state: State) => state.configuration.channel);
  const stableVersion = useSelector(selectors.selectStableVersionText);
  const betaVersion = useSelector(selectors.selectBetaVersionText);
  const nightlyVersion = useSelector(selectors.selectNightlyVersionText);
  const betaVersionDetails = useSelector(selectors.selectBetaVersionDetailsText);
  const nightlyVersionDetails = useSelector(selectors.selectNightlyVersionDetailsText);

  const dispatch = useDispatch();
  const changeChannel = useCallback((channel) => {
    dispatch(actions.changeChannel(channel));
    props.close();
  }, [dispatch, props]);

  return (
    <Fragment>
      <MenuGroup title="Channel &mdash; Choose the rust version">
        <SelectOne
          name="Stable channel"
          currentValue={channel}
          thisValue={Channel.Stable}
          changeValue={changeChannel}
        >
          <Desc>Build using the Stable version: {stableVersion}</Desc>
        </SelectOne>
        <SelectOne
          name="Beta channel"
          currentValue={channel}
          thisValue={Channel.Beta}
          changeValue={changeChannel}
        >
          <Desc>Build using the Beta version: {betaVersion}</Desc>
          <Desc>({betaVersionDetails})</Desc>
        </SelectOne>
        <SelectOne
          name="Nightly channel"
          currentValue={channel}
          thisValue={Channel.Nightly}
          changeValue={changeChannel}
        >
          <Desc>Build using the Nightly version: {nightlyVersion}</Desc>
          <Desc>({nightlyVersionDetails})</Desc>
        </SelectOne>
      </MenuGroup>
    </Fragment>
  );
};

const Desc: React.FC<{}> = ({ children }) => (
  <p className={styles.description}>{children}</p>
);

export default ChannelMenu;

import { merge } from 'lodash';
import { useDispatch } from 'react-redux';
import * as url from 'url';
import { configureStore as reduxConfigureStore } from '@reduxjs/toolkit';
import type {} from 'redux-thunk/extend-redux';

import { initializeApplication } from './actions';
import initializeLocalStorage from './local_storage';
import initializeSessionStorage from './session_storage';
import reducer from './reducers';

export default function configureStore(window: Window) {
  const baseUrl = url.resolve(window.location.href, '/');

  const initialGlobalState = {
    globalConfiguration: {
      baseUrl,
    },
  };
  const initialAppState = reducer(undefined, initializeApplication());

  const localStorage = initializeLocalStorage();
  const sessionStorage = initializeSessionStorage();

  const preloadedState = merge(
    initialAppState,
    initialGlobalState,
    localStorage.initialState,
    sessionStorage.initialState,
  );

  const store = reduxConfigureStore({
    reducer,
    preloadedState,
  })

  store.subscribe(() => {
    const state = store.getState();
    localStorage.saveChanges(state);
    sessionStorage.saveChanges(state);
  })

  return store;
}

export type AppDispatch = ReturnType<typeof configureStore>['dispatch'];
export const useAppDispatch = () => useDispatch<AppDispatch>()

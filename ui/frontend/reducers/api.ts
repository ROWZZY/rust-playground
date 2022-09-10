import { useCallback } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery, TypedUseMutationResult, MutationDefinition } from '@reduxjs/toolkit/query/react';
import { MutationResultSelectorResult } from '@reduxjs/toolkit/dist/query/core/buildSelectors';
import { ApiEndpointMutation } from '@reduxjs/toolkit/dist/query/core/module';
import { MutationHooks } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { sortBy } from 'lodash';
import { useSelector } from 'react-redux';

import RootState from '../state';
import { Crate } from '../types';
import { selectCode, selectEdition, selectCrateType } from '../selectors/shared';

interface FormatRequestBody {
  code: string;
  edition: string;
}

interface FormatResponseBody {
  success: boolean;
  code: string;
  stdout: string;
  stderr: string;
}

interface ClippyRequestBody {
  code: string;
  edition: string;
  crateType: string;
}

interface ClippyResponseBody {
  success: boolean;
  stdout: string;
  stderr: string;
}

interface MiriRequestBody {
  code: string;
  edition: string;
}

interface MiriResponseBody {
  success: boolean;
  stdout: string;
  stderr: string;
}

const api = createApi({
  reducerPath: 'playgroundApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    format: builder.mutation<FormatResponseBody, FormatRequestBody>({
      query: (body) => ({
        url: '/format',
        method: 'POST',
        body,
      }),
    }),

    clippy: builder.mutation<ClippyResponseBody, ClippyRequestBody>({
      query: (body) => ({
        url: '/clippy',
        method: 'POST',
        body,
      }),
    }),

    miri: builder.mutation<MiriResponseBody, MiriRequestBody>({
      query: (body) => ({
        url: '/miri',
        method: 'POST',
        body,
      }),
    }),

    crates: builder.query<Crate[], void>({
      query: () => '/meta/crates',
      transformResponse: (response: { crates: Crate[] }) => sortBy(response.crates, c => c.name),
    }),
  }),
});

function createCompatSelector<State, T extends object>(
  selector: (state: State) => MutationResultSelectorResult<MutationDefinition<T, any, any, any>>,
) {
  return createSelector(
    selector,
    (format) => ({
      ...format.data,
      requestsInProgress: format.isLoading ? 1 : 0,
    }));
}

function createPerformHook<T>(
  useMutation: () => TypedUseMutationResult<any, T, any, any>, selectFormat: (state: RootState) => T
) {
  return () => {
    const [perform] = useMutation();
    const request = useSelector(selectFormat);

    return useCallback(() => {
      perform(request);
    }, [perform, request])
  };
}

type MutationEndpoint<Arg, Ret> =
  ApiEndpointMutation<MutationDefinition<Arg, any, any, Ret, any>, any>
  & MutationHooks<MutationDefinition<Arg, any, any, Ret, any>>;

function createSingletonMutation<Arg, Ret>(
  name: string,
  endpoint: MutationEndpoint<Arg, Ret>,
  selectRequest: (state: RootState) => any,
) {
  const fixedCacheKey = `${name} singleton`;
  const useMutation = () => endpoint.useMutation({ fixedCacheKey });
  const select = endpoint.select({ requestId: undefined, fixedCacheKey });
  const selectCompat = createCompatSelector(select);
  const usePerform = createPerformHook(useMutation, selectRequest);

  return {
    select, selectCompat, usePerform,
  };
}

// ----------

const selectFormatRequest = createSelector(
  selectCode,
  selectEdition,
  (code, edition) => ({ code, edition }),
);

export const {
  select: selectFormat,
  selectCompat: selectFormatCompat,
  usePerform: usePerformFormat,
} = createSingletonMutation('format', api.endpoints.format, selectFormatRequest);

// ----------

const selectClippyRequest = createSelector(
  selectCode,
  selectEdition,
  selectCrateType,
  (code, edition, crateType) => ({ code, edition, crateType }),
);

export const {
  select: selectClippy,
  selectCompat: selectClippyCompat,
  usePerform: usePerformClippy,
} = createSingletonMutation('clippy', api.endpoints.clippy, selectClippyRequest);

// ----------

const selectMiriRequest = createSelector(
  selectCode,
  selectEdition,
  (code, edition) => ({ code, edition }),
);

export const {
  select: selectMiri,
  selectCompat: selectMiriCompat,
  usePerform: usePerformMiri,
} = createSingletonMutation('miri', api.endpoints.miri, selectMiriRequest);

// ----------

export const { useCratesQuery } = api;

export default api;

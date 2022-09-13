import { useCallback } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery, TypedUseMutationResult, MutationDefinition, FetchBaseQueryError, FetchBaseQueryMeta, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { MutationResultSelectorResult } from '@reduxjs/toolkit/dist/query/core/buildSelectors';
import { ApiEndpointMutation } from '@reduxjs/toolkit/dist/query/core/module';
import { MutationHooks } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { sortBy } from 'lodash';
import { useSelector } from 'react-redux';

import RootState from '../state';
import { Crate, Version } from '../types';
import { selectCode, selectEdition, selectCrateType, selectBacktraceEnabled } from '../selectors/shared';
import { BaseQueryApi, BaseQueryError, QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { QueryApi } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers';

interface ExecuteRequestBody {
  channel: string;
  mode: string;
  crateType: string;
  tests: boolean;
  code: string;
  edition: string;
  backtrace: boolean;
}

interface ExecuteResponseBody {
  stdout: string;
  stderr: string;
}

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

interface MacroExpansionRequestBody {
  code: string;
  edition: string;
}

interface MacroExpansionResponseBody {
  success: boolean;
  stdout: string;
  stderr: string;
}

type K = ReturnType<typeof fetchBaseQuery>;
type A = Parameters<K>[0];

type Omicron = <Request>(query: A, selectRequest: (state: RootState) => Request) => Zeta;
type Zeta = <Response>(arg: void, queryApi: BaseQueryApi, opts: {}, baseQuery: K) => MaybePromise<QueryReturnValue<Response, FetchBaseQueryError, FetchBaseQueryMeta>>;

const y: Omicron = (query, selectRequest): Zeta =>
  async <Response>(_arg, queryApi, opts, baseQuery) => {
    const state = queryApi.getState() as RootState;
    const body = selectRequest(state);

    const queryObj = (typeof query === 'string') ? { url: query } : { ...query, body };

    const resp = await baseQuery(queryObj, queryApi, opts) as QueryReturnValue<Response, FetchBaseQueryError, FetchBaseQueryMeta>;

    return resp;
  };

const z = async(_arg: void, queryApi: BaseQueryApi, opts: {}, baseQuery: K) => {
  const state = queryApi.getState() as RootState;
  const body: ExecuteRequestBody = selectExecuteRequest(state, 'bin', false);

  const resp = await baseQuery({
    url: '/execute',
    method: 'POST',
    body,
  }, queryApi, opts) as QueryReturnValue<ExecuteResponseBody, FetchBaseQueryError>;

  return resp;
}

const api = createApi({
  reducerPath: 'playgroundApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    execute: builder.mutation<ExecuteResponseBody, void>({
      // queryFn: async (_arg, queryApi, _extraOptions, baseQuery) => {
      //   const state = queryApi.getState() as RootState;
      //   const body: ExecuteRequestBody = selectExecuteRequest(state, 'bin', false);

      //   const resp = await baseQuery({
      //     url: '/execute',
      //     method: 'POST',
      //     body,
      //   }) as QueryReturnValue<ExecuteResponseBody, FetchBaseQueryError>;

      //   return resp;
      // },
      //queryFn: z,
      // queryFn: cc,
      queryFn: y<ExecuteRequestBody, ExecuteResponseBody>({
          url: '/execute',
          method: 'POST',
      }, seleOnl),
    }),

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

    macroExpansion: builder.mutation<MacroExpansionResponseBody, MacroExpansionRequestBody>({
      query: (body) => ({
        url: '/macro-expansion',
        method: 'POST',
        body,
      }),
    }),

    crates: builder.query<Crate[], void>({
      query: () => '/meta/crates',
      transformResponse: (response: { crates: Crate[] }) => sortBy(response.crates, c => c.name),
    }),

    versions: builder.query({
      queryFn: async (_arg, _queryApi, _extraOptions, baseQuery) => {
        const requests = Promise.all([
          baseQuery('/meta/version/stable'),
          baseQuery('/meta/version/beta'),
          baseQuery('/meta/version/nightly'),
          baseQuery('/meta/version/rustfmt'),
          baseQuery('/meta/version/clippy'),
          baseQuery('/meta/version/miri'),
        ]);

        const responses = await requests;
        const successes = [];

        for (let i = 0; i < responses.length; i++) {
          const { data, error } = responses[i];

          if (error) {
            return { error };
          }
          successes.push(data as Version);
        }

        const [stable, beta, nightly, rustfmt, clippy, miri] = successes;
        return { data: { stable, beta, nightly, rustfmt, clippy, miri } };
      },
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

const selectExecuteRequest = createSelector(
  selectCode,
  (state: RootState) => {
    const { channel, mode, edition } = state.configuration;
    return { channel, mode, edition };
  },
  selectBacktraceEnabled,
  (_state: RootState, crateType: string, tests: boolean) => ({ crateType, tests }),
  (code, base, backtrace, { crateType, tests }) => ({ ...base, code, backtrace, crateType, tests }),
);

const seleOnl = (state: RootState) => selectExecuteRequest(state, 'bin', false);

// export const {
//   select: selectExecute,
//   selectCompat: selectExecuteCompat,
//   usePerform: usePerformExecute,
// } = createSingletonMutation('execute', api.endpoints.execute, x);

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

const selectMacroExpansionRequest = createSelector(
  selectCode,
  selectEdition,
  (code, edition) => ({ code, edition }),
);

export const {
  select: selectMacroExpansion,
  selectCompat: selectMacroExpansionCompat,
  usePerform: usePerformMacroExpansion,
} = createSingletonMutation('macro expansion', api.endpoints.macroExpansion, selectMacroExpansionRequest);

// ----------

export const { useCratesQuery, useVersionsQuery } = api;

export default api;


// const cc = y<ExecuteRequestBody, ExecuteResponseBody>({
//   url: '/execute',
//   method: 'POST',
// }, seleOnl);

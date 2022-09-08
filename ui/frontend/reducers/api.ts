import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { sortBy } from 'lodash';

import { Crate } from '../types';

const api = createApi({
  reducerPath: 'playgroundApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    crates: builder.query<Crate[], void>({
      query: () => '/meta/crates',
      transformResponse: (response: { crates: Crate[] }) => sortBy(response.crates, c => c.name),
    }),
  }),
});

export const { useCratesQuery } = api;

export default api;

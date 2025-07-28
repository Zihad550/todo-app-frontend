import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type DefinitionType,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { TagTypes } from '../tag.types';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_BACKEND_API_URL,
  // credentials: "include",
  // prepareHeaders: (headers, { getState }) => {
  // const token = (getState() as RootState).auth.token;

  // if (token) {
  //   headers.set("authorization", `${token}`);
  // }

  // return headers;
  // },
});

const testBaseQuery: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions) => {
  const results = await baseQuery(args, api, extraOptions);

  // if (Array.isArray(results.data?.data)) {
  //   const data = results?.data?.data;
  //   const formatted = data?.map((item: unknown) => ({
  //     ...item,
  //     createdAt: new Date(item.createdAt),
  //     updatedAt: new Date(item.updatedAt),
  //   }));

  //   const res = {
  //     ...results,
  //     data: {
  //       ...results?.data,
  //       data: formatted,
  //     },
  //   };
  //   return res;
  // }
  return results;
};

// const baseQueryWithRefreshToken: BaseQueryFn<
//   FetchArgs,
//   BaseQueryApi,
//   DefinitionType
// > = async (args, api, extraOptions): Promise<any> => {
//   let result = await baseQuery(args, api, extraOptions);

//   if (result?.error?.status === 404)
//     toast.error((result?.error?.data as any)?.message || "Not found");

//   if (result?.error?.status === 403)
//     toast.error(
//       (result?.error?.data as any)?.message || "Something went wrong!",
//     );

//   if (result?.error?.status === 401) {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh-token`,
//       {
//         method: "POST",
//         credentials: "include",
//       },
//     );

//     const data = await res.json();

//     if (data?.data?.accessToken) {
//       const user = (api.getState() as RootState).auth.user;

//       api.dispatch(
//         setUser({
//           user,
//           token: data.data.accessToken,
//         }),
//       );

//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       api.dispatch(logout());
//     }
//   }

//   return result;
// };

export const baseApi = createApi({
  reducerPath: 'baseApi',
  // baseQuery: baseQueryWithRefreshToken,
  baseQuery: testBaseQuery,
  tagTypes: Object.values(TagTypes),
  endpoints: () => ({}),
});

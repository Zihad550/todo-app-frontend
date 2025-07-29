import type { IResponseRedux } from "@/types/apiResponse.types";
import type { ITag } from "@/types/tag";
import { baseApi } from "../api/baseApi";
import { TagTypes } from "../tag.types";

const tagApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTag: build.mutation({
      query: (data) => ({
        url: "/tags",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.Tag],
    }),
    updateTag: build.mutation({
      query: (data) => ({
        url: "/tags",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.Tag],
    }),
    deleteTag: build.mutation({
      query: (data) => ({
        url: "/tags",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [TagTypes.Tag],
    }),
    getAllTags: build.query<IResponseRedux<ITag[]>, undefined>({
      query: () => ({
        url: "/tags",
        method: "GET",
      }),
      providesTags: [TagTypes.Tag],
    }),
  }),
});

export const {
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useGetAllTagsQuery,
} = tagApi;

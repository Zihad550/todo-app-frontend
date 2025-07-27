import { baseApi } from "../api/baseApi";
import { TagTypes } from "../tag.types";

const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTask: build.mutation({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.Task],
    }),
    updateTask: build.mutation({
      query: (data) => ({
        url: `/tasks/${data.id}`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: [TagTypes.Task],
    }),
    deleteTask: build.mutation({
      query: (data) => ({
        url: "/tasks",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [TagTypes.Task],
    }),
    getAllTasks: build.query({
      query: () => {
        return {
          url: "/tasks",
          method: "GET",
        };
      },
      providesTags: [TagTypes.Task],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
} = taskApi;

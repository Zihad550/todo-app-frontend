import type { CreateTaskInput, Task, UpdateTaskInput } from "@/types/task";
import { baseApi } from "../api/baseApi";
import { TagTypes } from "../tag.types";

interface UpdateTaskPayload {
  id: string;
  data: UpdateTaskInput;
}

interface DeleteTaskPayload {
  id: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTask: build.mutation<ApiResponse<Task>, CreateTaskInput>({
      query: (data) => ({
        url: "/task-kanban/tasks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.Task],
    }),
    updateTask: build.mutation<ApiResponse<Task>, UpdateTaskPayload>({
      query: ({ id, data }) => ({
        url: `/task-kanban/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.Task],
    }),
    deleteTask: build.mutation<ApiResponse<{ id: string }>, DeleteTaskPayload>({
      query: ({ id }) => ({
        url: `/task-kanban/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.Task],
    }),
    getAllTasks: build.query<ApiResponse<Task[]>, void>({
      query: () => ({
        url: "/task-kanban/kanban",
        method: "GET",
      }),
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

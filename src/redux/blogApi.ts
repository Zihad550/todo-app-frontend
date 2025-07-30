import { baseApi } from '@/redux/api/baseApi';
import { TagTypes } from '@/redux/tag.types';
import type { Blog, CreateBlogInput, UpdateBlogInput } from '@/types/blog';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<Blog[], void>({
      query: () => '/blogs',
      providesTags: [TagTypes.Blog],
    }),
    getBlog: builder.query<Blog, string>({
      query: (id) => `/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: TagTypes.Blog, id }],
    }),
    createBlog: builder.mutation<Blog, CreateBlogInput>({
      query: (blog) => ({
        url: '/blogs',
        method: 'POST',
        body: blog,
      }),
      invalidatesTags: [TagTypes.Blog],
    }),
    updateBlog: builder.mutation<
      Blog,
      { id: string; updates: UpdateBlogInput }
    >({
      query: ({ id, updates }) => ({
        url: `/blogs/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TagTypes.Blog, id }],
    }),
    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TagTypes.Blog],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;

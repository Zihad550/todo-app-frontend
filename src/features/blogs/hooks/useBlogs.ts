import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '@/redux/blogApi';
import { BlogSortBy } from '@/types/blog';
import type { Blog, CreateBlogInput, UpdateBlogInput } from '@/types/blog';

export function useBlogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<BlogSortBy>(BlogSortBy.UPDATED_DESC);

  const { data: blogsData = [], isLoading } = useGetBlogsQuery();
  const [createBlogMutation] = useCreateBlogMutation();
  const [updateBlogMutation] = useUpdateBlogMutation();
  const [deleteBlogMutation] = useDeleteBlogMutation();

  // Filter and sort blogs
  const blogs = useMemo(() => {
    const filtered = blogsData.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => blog.tags.includes(tag));
      return matchesSearch && matchesTags;
    });

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case BlogSortBy.CREATED_DESC:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case BlogSortBy.CREATED_ASC:
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case BlogSortBy.UPDATED_DESC:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case BlogSortBy.UPDATED_ASC:
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case BlogSortBy.TITLE_ASC:
          return a.title.localeCompare(b.title);
        case BlogSortBy.TITLE_DESC:
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [blogsData, searchQuery, selectedTags, sortBy]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogsData.forEach((blog) => {
      blog.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [blogsData]);

  const createBlog = async (input: CreateBlogInput) => {
    try {
      await createBlogMutation({
        ...input,
      }).unwrap();
      toast.success('Blog created successfully');
    } catch (error) {
      toast.error('Failed to create blog');
      throw error;
    }
  };

  const updateBlog = async (id: string, updates: UpdateBlogInput) => {
    try {
      await updateBlogMutation({ id, updates }).unwrap();
      toast.success('Blog updated successfully');
    } catch (error) {
      toast.error('Failed to update blog');
      throw error;
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      await deleteBlogMutation(id).unwrap();
      toast.success('Blog deleted successfully');
    } catch (error) {
      toast.error('Failed to delete blog');
      throw error;
    }
  };

  return {
    blogs,
    allTags,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    createBlog,
    updateBlog,
    deleteBlog,
  };
}

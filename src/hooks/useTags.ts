import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetAllTagsQuery,
  useUpdateTagMutation,
} from '@/redux/features/tagApi';
import type { Tag, Task } from '@/types/task';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface TagWithMetadata extends Tag {
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

const defaultColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#84cc16', // lime
];

// Default tags that match the sample data
const defaultTags: TagWithMetadata[] = [
  {
    id: 'tag-welcome',
    name: 'welcome',
    color: '#ef4444',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tag-sample',
    name: 'sample',
    color: '#f97316',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tag-tutorial',
    name: 'tutorial',
    color: '#eab308',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tag-features',
    name: 'features',
    color: '#22c55e',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tag-development',
    name: 'development',
    color: '#06b6d4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tag-feature',
    name: 'feature',
    color: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tag-test',
    name: 'test',
    color: '#8b5cf6',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useTags = (tasks: Task[]) => {
  const [tags, setTags] = useState<TagWithMetadata[]>(defaultTags);

  // Redux API hooks
  const { data: apiTags, isLoading, error } = useGetAllTagsQuery({});
  const [createTagMutation] = useCreateTagMutation();
  const [updateTagMutation] = useUpdateTagMutation();
  const [deleteTagMutation] = useDeleteTagMutation();

  // Sync API data with local state
  useEffect(() => {
    if (apiTags?.data) {
      setTags(apiTags.data);
    }
  }, [apiTags]);

  const createTag = useCallback(
    async (input: CreateTagInput) => {
      // Check if tag already exists
      const existingTag = tags.find(
        (tag) => tag.name.toLowerCase() === input.name.toLowerCase()
      );

      if (existingTag) {
        toast.error('Tag already exists');
        throw new Error('Tag already exists');
      }

      const tempId = crypto.randomUUID();

      try {
        // Optimistic update
        const newTag: TagWithMetadata = {
          id: tempId,
          name: input.name.trim(),
          color: input.color,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setTags((prev) => [...prev, newTag]);

        // API call
        const result = await createTagMutation(input).unwrap();

        // Update with server response
        if (result?.data) {
          setTags((prev) =>
            prev.map((tag) => (tag.id === tempId ? result.data : tag))
          );
        }

        toast.success('Tag created successfully');
        return result?.data || newTag;
      } catch (error) {
        // Revert optimistic update on error
        setTags((prev) => prev.filter((tag) => tag.id !== tempId));
        toast.error('Failed to create tag');
        throw error;
      }
    },
    [tags, createTagMutation]
  );

  const updateTag = useCallback(
    async (id: string, updates: UpdateTagInput) => {
      // Store original tag for rollback
      const originalTag = tags.find((tag) => tag.id === id);
      if (!originalTag) return;

      // Check if new name conflicts with existing tags
      if (updates.name && updates.name !== originalTag.name) {
        const existingTag = tags.find(
          (t) =>
            t.id !== id && t.name.toLowerCase() === updates.name!.toLowerCase()
        );
        if (existingTag) {
          toast.error('Tag name already exists');
          throw new Error('Tag name already exists');
        }
      }

      try {
        // Optimistic update
        setTags((prev) =>
          prev.map((tag) => {
            if (tag.id === id) {
              return {
                ...tag,
                ...updates,
                name: updates.name?.trim() || tag.name,
                updatedAt: new Date(),
              };
            }
            return tag;
          })
        );

        // API call
        await updateTagMutation({ id, ...updates }).unwrap();

        toast.success('Tag updated successfully');
      } catch (error) {
        // Revert optimistic update on error
        setTags((prev) =>
          prev.map((tag) => (tag.id === id ? originalTag : tag))
        );
        toast.error('Failed to update tag');
        throw error;
      }
    },
    [tags, updateTagMutation]
  );

  const deleteTag = useCallback(
    async (id: string) => {
      // Store original tag for rollback
      const originalTag = tags.find((tag) => tag.id === id);
      if (!originalTag) return;

      try {
        // Optimistic update
        setTags((prev) => prev.filter((tag) => tag.id !== id));

        // API call
        await deleteTagMutation({ id }).unwrap();

        toast.success('Tag deleted successfully');
      } catch (error) {
        // Revert optimistic update on error
        setTags((prev) => [...prev, originalTag]);
        toast.error('Failed to delete tag');
        throw error;
      }
    },
    [tags, deleteTagMutation]
  );

  const getTagUsageCount = useCallback(
    (tagName: string) => {
      const tag = tags.find((t) => t.name === tagName);
      if (!tag) return 0;
      return tasks.filter((task) => task.tags.includes(tag.id)).length;
    },
    [tasks, tags]
  );

  const getTagByName = useCallback(
    (name: string) => {
      return tags.find((tag) => tag.name === name);
    },
    [tags]
  );

  const getUnusedTags = useCallback(() => {
    return tags.filter((tag) => getTagUsageCount(tag.name) === 0);
  }, [tags, getTagUsageCount]);

  const getMostUsedTags = useCallback(
    (limit = 10) => {
      return tags
        .map((tag) => ({
          ...tag,
          usageCount: getTagUsageCount(tag.name),
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    },
    [tags, getTagUsageCount]
  );

  const getTagById = useCallback(
    (id: string) => {
      return tags.find((tag) => tag.id === id);
    },
    [tags]
  );

  const getTagsByIds = useCallback(
    (ids: string[]) => {
      return ids
        .map((id) => tags.find((tag) => tag.id === id))
        .filter(Boolean) as TagWithMetadata[];
    },
    [tags]
  );

  return {
    createTag,
    updateTag,
    deleteTag,
    getTagUsageCount,
    getTagByName,
    getTagById,
    getTagsByIds,
    getUnusedTags,
    getMostUsedTags,
    defaultColors,
    isLoading,
    tags,
    error,
  };
};

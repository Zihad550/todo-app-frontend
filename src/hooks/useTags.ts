import { useState, useCallback, useMemo } from 'react';
import type { Task, Tag } from '@/types/task';

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

  const createTag = useCallback(
    (input: CreateTagInput) => {
      // Check if tag already exists
      const existingTag = tags.find(
        (tag) => tag.name.toLowerCase() === input.name.toLowerCase()
      );

      if (existingTag) {
        throw new Error('Tag already exists');
      }

      const newTag: TagWithMetadata = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        color: input.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTags((prev) => [...prev, newTag]);
      return newTag;
    },
    [tags]
  );

  const updateTag = useCallback((id: string, updates: UpdateTagInput) => {
    setTags((prev) =>
      prev.map((tag) => {
        if (tag.id === id) {
          // Check if new name conflicts with existing tags
          if (updates.name && updates.name !== tag.name) {
            const existingTag = prev.find(
              (t) =>
                t.id !== id &&
                t.name.toLowerCase() === updates.name!.toLowerCase()
            );
            if (existingTag) {
              throw new Error('Tag name already exists');
            }
          }

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
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  }, []);

  const getTagUsageCount = useCallback(
    (tagName: string) => {
      const tag = tags.find((t) => t.name === tagName);
      if (!tag) return 0;
      return tasks.filter((task) => task.tagIds.includes(tag.id)).length;
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
    tags,
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
  };
};

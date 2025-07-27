import { useState, useCallback, useMemo } from 'react';
import type { Task } from '@/types/task';

export interface Tag {
  id: string;
  name: string;
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

export const useTags = (tasks: Task[]) => {
  // Initialize tags from existing task tags
  const initialTags = useMemo(() => {
    const tagNames = new Set<string>();
    tasks.forEach((task) => {
      task.tags.forEach((tag) => tagNames.add(tag));
    });

    return Array.from(tagNames).map((name, index) => ({
      id: crypto.randomUUID(),
      name,
      color: defaultColors[index % defaultColors.length],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }, []);

  const [tags, setTags] = useState<Tag[]>(initialTags);

  const createTag = useCallback(
    (input: CreateTagInput) => {
      // Check if tag already exists
      const existingTag = tags.find(
        (tag) => tag.name.toLowerCase() === input.name.toLowerCase()
      );

      if (existingTag) {
        throw new Error('Tag already exists');
      }

      const newTag: Tag = {
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
      return tasks.filter((task) => task.tags.includes(tagName)).length;
    },
    [tasks]
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

  return {
    tags,
    createTag,
    updateTag,
    deleteTag,
    getTagUsageCount,
    getTagByName,
    getUnusedTags,
    getMostUsedTags,
    defaultColors,
  };
};

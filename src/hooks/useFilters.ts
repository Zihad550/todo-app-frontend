import type {
  FilterType,
  SortType,
} from '@/features/tasks/components/TaskFilters';
import type { TagWithMetadata } from '@/features/tags';
import type { Task } from '@/types/task';
import { useMemo, useState } from 'react';

interface UseFiltersOptions {
  initialFilter?: FilterType;
  initialSort?: SortType;
  initialSearchTerm?: string;
  initialSelectedTags?: string[];
}

export const useFilters = (
  tasks: Task[],
  tags: TagWithMetadata[],
  options: UseFiltersOptions = {}
) => {
  const {
    initialFilter = 'all',
    initialSort = 'newest',
    initialSearchTerm = '',
    initialSelectedTags = [],
  } = options;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [sort, setSort] = useState<SortType>(initialSort);
  const [selectedTags, setSelectedTags] =
    useState<string[]>(initialSelectedTags);

  const availableTags = useMemo(() => {
    const usedTagIds = new Set<string>();
    tasks.forEach((task) => {
      task.tags.forEach((tagId) => usedTagIds.add(tagId));
    });
    return tags
      .filter((tag) => usedTagIds.has(tag.id))
      .map((tag) => tag.name)
      .sort();
  }, [tasks, tags]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.tags.some((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag?.name.toLowerCase().includes(searchTerm.toLowerCase());
          })
      );
    }

    // Filter by status
    if (filter === 'active') {
      filtered = filtered.filter((task) => !task.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter((task) => task.completed);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((task) =>
        selectedTags.some((selectedTagName) => {
          const selectedTag = tags.find((t) => t.name === selectedTagName);
          return selectedTag && task.tags.includes(selectedTag.id);
        })
      );
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, searchTerm, filter, sort, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setSort('newest');
    setSelectedTags([]);
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filter !== 'all' ||
    selectedTags.length > 0 ||
    sort !== 'newest';

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    sort,
    setSort,
    selectedTags,
    setSelectedTags,
    toggleTag,

    // Computed values
    availableTags,
    filteredAndSortedTasks,
    hasActiveFilters,

    // Actions
    clearAllFilters,
  };
};

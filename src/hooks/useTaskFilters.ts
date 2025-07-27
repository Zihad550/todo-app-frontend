import { useFilters } from './useFilters';
import { useTags } from './useTags';
import type { Task } from '@/types/task';

export const useTaskFilters = (tasks: Task[]) => {
  const { tags } = useTags(tasks);
  return useFilters(tasks, tags);
};

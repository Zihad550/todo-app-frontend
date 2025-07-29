import { useFilters } from '@/hooks/useFilters';
import { useTags } from '@/features/tags';
import type { Task } from '@/types/task';

export const useTaskFilters = (tasks: Task[]) => {
  const { tags } = useTags(tasks);
  return useFilters(tasks, tags);
};

import { useFilters } from './useFilters';
import type { Task } from '@/types/task';

export const useTaskFilters = (tasks: Task[]) => {
  return useFilters(tasks);
};

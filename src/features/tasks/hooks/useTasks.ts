import { getSubtaskId } from '@/lib/utils';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
} from '@/redux/features/taskApi';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Default sample tasks for development/demo purposes
export const useTasks = (initialTasks?: Task[]) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [columnLoadingStates, setColumnLoadingStates] = useState<
    Record<TaskStatus, boolean>
  >({
    [TaskStatus.BACKLOG]: false,
    [TaskStatus.SCHEDULED]: false,
    [TaskStatus.PROGRESS]: false,
    [TaskStatus.COMPLETED]: false,
  });
  const [columnErrors, setColumnErrors] = useState<
    Record<TaskStatus, string | null>
  >({
    [TaskStatus.BACKLOG]: null,
    [TaskStatus.SCHEDULED]: null,
    [TaskStatus.PROGRESS]: null,
    [TaskStatus.COMPLETED]: null,
  });

  const { data: apiTasks, isLoading, error } = useGetAllTasksQuery();
  // Redux API hooks
  const [createTaskMutation] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  useEffect(() => {
    if (apiTasks?.data) {
      const lTasks = [...apiTasks.data];
      const sorted = lTasks.sort((a, b) => a.position - b.position);

      console.log(sorted);
      setTasks(sorted);
    } else if (error && !initialTasks) {
      // If API fails and no initial tasks provided, keep using default tasks
      console.warn('API not available, using default tasks:', error);
    }
  }, [apiTasks, error, initialTasks]);

  const updateTask = useCallback(
    async (id: string, updates: UpdateTaskInput) => {
      // Store original task for rollback
      const originalTask = tasks.find((task) => task.id === id);
      if (!originalTask) {
        toast.error('Task not found');
        return;
      }

      try {
        const updatedTask = {
          ...updates,
          updatedAt: new Date(),
        };
        // Sync completed status with task status
        if (updates.status === TaskStatus.COMPLETED) {
          updatedTask.completed = true;
        } else if (
          updates.status &&
          [
            TaskStatus.BACKLOG,
            TaskStatus.SCHEDULED,
            TaskStatus.PROGRESS,
          ].includes(updates.status) &&
          updates.completed === undefined
        ) {
          updatedTask.completed = false;
        }
        // Sync status with completed flag
        if (updates.completed === true && !updates.status) {
          updatedTask.status = TaskStatus.COMPLETED;
        } else if (updates.completed === false) {
          updatedTask.status = TaskStatus.BACKLOG;
        }

        // Optimistic update
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          )
        );

        await updateTaskMutation({ id, data: updates }).unwrap();
      } catch (error) {
        // Revert optimistic update on error
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? originalTask : task))
        );

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update task';
        toast.error(errorMessage);
        throw error;
      }
    },
    [updateTaskMutation, tasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      // Store original task for rollback
      const originalTask = tasks.find((task) => task.id === id);
      if (!originalTask) return;

      try {
        // Optimistic update
        setTasks((prev) => prev.filter((task) => task.id !== id));

        // API call with correct payload format
        await deleteTaskMutation({ id }).unwrap();

        toast.success('Task deleted successfully');
      } catch (error) {
        // Revert optimistic update on error
        setTasks((prev) => [...prev, originalTask]);
        toast.error('Failed to delete task');
        throw error;
      }
    },
    [tasks, deleteTaskMutation]
  );

  const toggleTask = useCallback(
    (id: string) => {
      updateTask(id, { completed: !tasks.find((t) => t.id === id)?.completed });
    },
    [tasks, updateTask]
  );

  const moveTask = useCallback(
    (id: string, newStatus: TaskStatus) => {
      updateTask(id, { status: newStatus });
    },
    [updateTask]
  );

  const createTask = useCallback(
    async (data: CreateTaskInput) => {
      const targetStatus = data.status || TaskStatus.BACKLOG;

      try {
        // Set loading state for the specific column
        setIsCreatingTask(true);
        setColumnLoadingStates((prev) => ({ ...prev, [targetStatus]: true }));
        setColumnErrors((prev) => ({ ...prev, [targetStatus]: null }));

        // Calculate position if not provided
        const taskData = { ...data };

        if (taskData.position === undefined) {
          // Find all tasks with the same status and get the highest position
          const tasksInStatus = tasks.filter(
            (task) => task.status === targetStatus
          );
          const maxPosition =
            tasksInStatus.length > 0
              ? Math.max(...tasksInStatus.map((task) => task.position))
              : -1;

          // Set position to be at the end of the column
          taskData.position = maxPosition + 1;
        }

        // Ensure status is set (default to BACKLOG for backward compatibility)
        if (!taskData.status) {
          taskData.status = TaskStatus.BACKLOG;
        }

        // Sync completed status with task status
        if (taskData.status === TaskStatus.COMPLETED) {
          taskData.completed = true;
        } else if (taskData.completed === undefined) {
          taskData.completed = false;
        }

        await createTaskMutation(taskData).unwrap();

        // Success toast is handled by the InlineTaskForm component
        // to provide more specific feedback about which column the task was created in
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create task';

        // Set error state for the specific column
        setColumnErrors((prev) => ({ ...prev, [targetStatus]: errorMessage }));

        // Don't show toast here - let the form component handle it for better UX
        throw error;
      } finally {
        // Clear loading states
        setIsCreatingTask(false);
        setColumnLoadingStates((prev) => ({ ...prev, [targetStatus]: false }));
      }
    },
    [createTaskMutation, tasks]
  );

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  // Subtask management functions using updateTask API
  const addSubtask = useCallback(
    async (taskId: string, subtaskTitle: string, tag?: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        toast.error('Task not found');
        return;
      }

      const newSubtask = {
        title: subtaskTitle,
        tag,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSubtasks = [...task.subtasks, newSubtask];

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success('Subtask added successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add subtask';
        toast.error(errorMessage);
        throw error;
      }
    },
    [tasks, updateTask]
  );

  const updateSubtask = useCallback(
    async (
      taskId: string,
      subtaskId: string,
      updates: { title?: string; tag?: string; completed?: boolean }
    ) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        toast.error('Task not found');
        return;
      }

      const updatedSubtasks = task.subtasks.map((subtask) =>
        getSubtaskId(subtask) === subtaskId
          ? { ...subtask, ...updates, updatedAt: new Date() }
          : subtask
      );

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success('Subtask updated successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update subtask';
        toast.error(errorMessage);
        throw error;
      }
    },
    [tasks, updateTask]
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        toast.error('Task not found');
        return;
      }

      const updatedSubtasks = task.subtasks.filter(
        (subtask) => getSubtaskId(subtask) !== subtaskId
      );

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success('Subtask deleted successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete subtask';
        toast.error(errorMessage);
        throw error;
      }
    },
    [tasks, updateTask]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        toast.error('Task not found');
        return;
      }

      const subtask = task.subtasks.find((s) => getSubtaskId(s) === subtaskId);
      if (!subtask) {
        toast.error('Subtask not found');
        return;
      }

      await updateSubtask(taskId, subtaskId, { completed: !subtask.completed });
    },
    [tasks, updateSubtask]
  );

  const clearColumnError = useCallback((columnId: TaskStatus) => {
    setColumnErrors((prev) => ({ ...prev, [columnId]: null }));
  }, []);

  return {
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    reorderTasks,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    clearColumnError,
    isLoading,
    isCreatingTask,
    columnLoadingStates,
    columnErrors,
    tasks,
  };
};

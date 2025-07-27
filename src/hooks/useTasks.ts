import {
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
} from "@/redux/features/taskApi";
import type { Task, UpdateTaskInput } from "@/types/task";
import { TaskStatus } from "@/types/task";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data: apiTasks, isLoading } = useGetAllTasksQuery({});
  // Redux API hooks
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  useEffect(() => {
    if (apiTasks?.data) setTasks(apiTasks.data);
  }, [apiTasks]);

  const updateTask = useCallback(
    async (id: string, updates: UpdateTaskInput) => {
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

        await updateTaskMutation({ id, data: updates });
      } catch (error) {
        toast.error("Failed to update task");
        throw error;
      }
    },
    [],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      // Store original task for rollback
      const originalTask = tasks.find((task) => task.id === id);
      if (!originalTask) return;

      try {
        // Optimistic update
        setTasks((prev) => prev.filter((task) => task.id !== id));

        // API call
        await deleteTaskMutation({ id }).unwrap();

        toast.success("Task deleted successfully");
      } catch (error) {
        // Revert optimistic update on error
        setTasks((prev) => [...prev, originalTask]);
        toast.error("Failed to delete task");
        throw error;
      }
    },
    [tasks, deleteTaskMutation],
  );

  const toggleTask = useCallback(
    (id: string) => {
      updateTask(id, { completed: !tasks.find((t) => t.id === id)?.completed });
    },
    [tasks, updateTask],
  );

  const moveTask = useCallback(
    (id: string, newStatus: TaskStatus) => {
      updateTask(id, { status: newStatus });
    },
    [updateTask],
  );

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  return {
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    reorderTasks,
    isLoading,
    tasks,
  };
};

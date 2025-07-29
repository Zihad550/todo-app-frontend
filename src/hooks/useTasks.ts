import { getSubtaskId } from "@/lib/utils";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
} from "@/redux/features/taskApi";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/types/task";
import { TaskStatus } from "@/types/task";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Default sample tasks for development/demo purposes
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
    } else if (error) {
      // If API fails, keep using default tasks
      console.warn("API not available, using default tasks:", error);
    }
  }, [apiTasks, error]);

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
    [updateTaskMutation],
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

  const createTask = useCallback(
    async (data: CreateTaskInput) => {
      try {
        await createTaskMutation(data).unwrap();
        toast.success("Task created successfully");
      } catch (error) {
        toast.error("Failed to create task");
        throw error;
      }
    },
    [createTaskMutation],
  );

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  // Subtask management functions using updateTask API
  const addSubtask = useCallback(
    async (taskId: string, subtaskTitle: string, tag?: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

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
        toast.success("Subtask added successfully");
      } catch (error) {
        toast.error("Failed to add subtask");
        throw error;
      }
    },
    [tasks, updateTask],
  );

  const updateSubtask = useCallback(
    async (
      taskId: string,
      subtaskId: string,
      updates: { title?: string; tag?: string; completed?: boolean },
    ) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.map((subtask) =>
        getSubtaskId(subtask) === subtaskId
          ? { ...subtask, ...updates, updatedAt: new Date() }
          : subtask,
      );

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success("Subtask updated successfully");
      } catch (error) {
        toast.error("Failed to update subtask");
        throw error;
      }
    },
    [tasks, updateTask],
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.filter(
        (subtask) => getSubtaskId(subtask) !== subtaskId,
      );

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success("Subtask deleted successfully");
      } catch (error) {
        toast.error("Failed to delete subtask");
        throw error;
      }
    },
    [tasks, updateTask],
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const subtask = task.subtasks.find((s) => getSubtaskId(s) === subtaskId);
      if (!subtask) return;

      await updateSubtask(taskId, subtaskId, { completed: !subtask.completed });
    },
    [tasks, updateSubtask],
  );

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
    isLoading,
    tasks,
  };
};

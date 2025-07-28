import {
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useCreateTaskMutation,
} from '@/redux/features/taskApi';
import type { Task, UpdateTaskInput, CreateTaskInput } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSubtaskId } from '@/lib/utils';

// Default sample tasks for development/demo purposes
const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Welcome to your task manager',
    description:
      'This is a sample task to get you started. You can edit, delete, or mark it as complete.',
    status: TaskStatus.BACKLOG,
    tags: ['tag-welcome', 'tag-sample'],
    completed: false,
    subtasks: [],
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'task-2',
    title: 'Try the kanban board',
    description:
      'Switch to the kanban view to see your tasks organized by status. You can drag and drop tasks between columns.',
    status: TaskStatus.SCHEDULED,
    tags: ['tag-tutorial', 'tag-features'],
    completed: false,
    subtasks: [
      {
        title: 'Open kanban view',
        completed: true,
        createdAt: new Date('2024-01-16T09:00:00Z'),
        updatedAt: new Date('2024-01-16T09:30:00Z'),
      },
      {
        title: 'Drag a task between columns',
        completed: false,
        createdAt: new Date('2024-01-16T09:00:00Z'),
        updatedAt: new Date('2024-01-16T09:00:00Z'),
      },
    ],
    createdAt: new Date('2024-01-16T09:00:00Z'),
    updatedAt: new Date('2024-01-16T09:30:00Z'),
  },
  {
    id: 'task-3',
    title: 'Create your first task',
    description:
      'Click the "Add Task" button to create a new task. You can add a title, description, and tags.',
    status: TaskStatus.PROGRESS,
    tags: ['tag-tutorial'],
    completed: false,
    subtasks: [],
    createdAt: new Date('2024-01-17T14:00:00Z'),
    updatedAt: new Date('2024-01-18T10:00:00Z'),
  },
  {
    id: 'task-4',
    title: 'Explore the statistics page',
    description:
      'Check out the statistics page to see insights about your task completion and productivity.',
    status: TaskStatus.COMPLETED,
    tags: ['tag-features', 'tag-development'],
    completed: true,
    subtasks: [
      {
        title: 'Navigate to statistics',
        completed: true,
        createdAt: new Date('2024-01-18T11:00:00Z'),
        updatedAt: new Date('2024-01-18T11:15:00Z'),
      },
      {
        title: 'Review completion rates',
        completed: true,
        createdAt: new Date('2024-01-18T11:00:00Z'),
        updatedAt: new Date('2024-01-18T11:20:00Z'),
      },
    ],
    createdAt: new Date('2024-01-18T11:00:00Z'),
    updatedAt: new Date('2024-01-18T11:20:00Z'),
  },
  {
    id: 'task-5',
    title: 'Set up development environment',
    description:
      'Configure your local development environment for the project.',
    status: TaskStatus.COMPLETED,
    tags: ['tag-development', 'tag-feature'],
    completed: true,
    subtasks: [],
    createdAt: new Date('2024-01-10T08:00:00Z'),
    updatedAt: new Date('2024-01-12T16:00:00Z'),
  },
  {
    id: 'task-6',
    title: 'Write unit tests',
    description:
      'Add comprehensive unit tests for the task management functionality.',
    status: TaskStatus.BACKLOG,
    tags: ['tag-test', 'tag-development'],
    completed: false,
    subtasks: [
      {
        title: 'Test task creation',
        completed: false,
        createdAt: new Date('2024-01-19T09:00:00Z'),
        updatedAt: new Date('2024-01-19T09:00:00Z'),
      },
      {
        title: 'Test task updates',
        completed: false,
        createdAt: new Date('2024-01-19T09:00:00Z'),
        updatedAt: new Date('2024-01-19T09:00:00Z'),
      },
    ],
    createdAt: new Date('2024-01-19T09:00:00Z'),
    updatedAt: new Date('2024-01-19T09:00:00Z'),
  },
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const { data: apiTasks, isLoading, error } = useGetAllTasksQuery({});
  // Redux API hooks
  const [createTaskMutation] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  useEffect(() => {
    if (apiTasks?.data) {
      // Ensure all tasks have subtasks array and proper date objects
      const tasksWithSubtasks = apiTasks.data.map((task: Task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        subtasks: (task.subtasks || []).map((subtask) => ({
          ...subtask,
          createdAt: new Date(subtask.createdAt),
          updatedAt: new Date(subtask.updatedAt),
        })),
      }));
      setTasks(tasksWithSubtasks);
    } else if (error) {
      // If API fails, keep using default tasks
      console.warn('API not available, using default tasks:', error);
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
        toast.error('Failed to update task');
        throw error;
      }
    },
    [updateTaskMutation]
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
      try {
        await createTaskMutation(data).unwrap();
        toast.success('Task created successfully');
      } catch (error) {
        toast.error('Failed to create task');
        throw error;
      }
    },
    [createTaskMutation]
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
        toast.success('Subtask added successfully');
      } catch (error) {
        toast.error('Failed to add subtask');
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
      if (!task) return;

      const updatedSubtasks = task.subtasks.map((subtask) =>
        getSubtaskId(subtask) === subtaskId
          ? { ...subtask, ...updates, updatedAt: new Date() }
          : subtask
      );

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success('Subtask updated successfully');
      } catch (error) {
        toast.error('Failed to update subtask');
        throw error;
      }
    },
    [tasks, updateTask]
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.filter(
        (subtask) => getSubtaskId(subtask) !== subtaskId
      );

      try {
        await updateTask(taskId, { subtasks: updatedSubtasks });
        toast.success('Subtask deleted successfully');
      } catch (error) {
        toast.error('Failed to delete subtask');
        throw error;
      }
    },
    [tasks, updateTask]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const subtask = task.subtasks.find((s) => getSubtaskId(s) === subtaskId);
      if (!subtask) return;

      await updateSubtask(taskId, subtaskId, { completed: !subtask.completed });
    },
    [tasks, updateSubtask]
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

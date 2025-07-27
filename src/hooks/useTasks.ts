import { useState, useCallback } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { TaskStatus } from '@/types/task';

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Welcome to your Todo App!',
    description:
      'This is a sample task to get you started. You can edit, complete, or delete it.',
    tags: ['welcome', 'sample'],
    completed: false,
    status: TaskStatus.BACKLOG,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    title: 'Try creating a new task',
    description: 'Click the "Add New Task" button to create your first task.',
    tags: ['tutorial'],
    completed: false,
    status: TaskStatus.SCHEDULED,
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
    updatedAt: new Date(Date.now() - 43200000),
  },
  {
    id: '3',
    title: 'Explore the features',
    description:
      'Try using filters, tags, and the search functionality to organize your tasks.',
    tags: ['features', 'tutorial'],
    completed: true,
    status: TaskStatus.COMPLETED,
    createdAt: new Date(Date.now() - 21600000), // 6 hours ago
    updatedAt: new Date(Date.now() - 10800000), // 3 hours ago
  },
  {
    id: '4',
    title: 'Implement drag and drop',
    description: 'Add drag and drop functionality to the Kanban board.',
    tags: ['development', 'feature'],
    completed: false,
    status: TaskStatus.PROGRESS,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: '5',
    title: 'First backlog task',
    description: 'This is the first task in backlog for testing reordering.',
    tags: ['test'],
    completed: false,
    status: TaskStatus.BACKLOG,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: '6',
    title: 'Second backlog task',
    description: 'This is the second task in backlog for testing reordering.',
    tags: ['test'],
    completed: false,
    status: TaskStatus.BACKLOG,
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: '7',
    title: 'Third backlog task',
    description: 'This is the third task in backlog for testing reordering.',
    tags: ['test'],
    completed: false,
    status: TaskStatus.BACKLOG,
    createdAt: new Date(Date.now() - 900000), // 15 minutes ago
    updatedAt: new Date(Date.now() - 900000),
  },
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);

  const createTask = useCallback((input: CreateTaskInput) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      tags: input.tags,
      completed: false,
      status: TaskStatus.BACKLOG,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: UpdateTaskInput) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updates, updatedAt: new Date() };
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
          } else if (
            updates.completed === false &&
            task.status === TaskStatus.COMPLETED
          ) {
            updatedTask.status = TaskStatus.BACKLOG;
          }
          return updatedTask;
        }
        return task;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

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

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    reorderTasks,
  };
};

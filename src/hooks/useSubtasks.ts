import { toast } from 'sonner';
import { useUpdateTaskMutation } from '@/redux/features/taskApi';
import { useTasks } from '@/hooks/useTasks';
import { getSubtaskId } from '@/lib/utils';
import type {
  CreateSubtaskInput,
  UpdateSubtaskInput,
  Subtask,
} from '@/types/task';

export function useSubtasks(taskId: string) {
  const { tasks } = useTasks();
  const [updateTaskMutation] = useUpdateTaskMutation();

  const task = tasks.find((t) => t.id === taskId);
  const subtasks = task?.subtasks || [];

  const createSubtask = async (input: CreateSubtaskInput) => {
    if (!task) {
      toast.error('Task not found');
      return;
    }

    const newSubtask: Subtask = {
      title: input.title,
      tag: input.tag,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedSubtasks = [...subtasks, newSubtask];

    try {
      await updateTaskMutation({
        id: taskId,
        data: { subtasks: updatedSubtasks },
      }).unwrap();
      toast.success('Subtask created');
    } catch (error) {
      toast.error('Failed to create subtask');
      throw error;
    }
  };

  const updateSubtask = async (
    subtaskId: string,
    updates: UpdateSubtaskInput
  ) => {
    if (!task) {
      toast.error('Task not found');
      return;
    }

    const updatedSubtasks = subtasks.map((subtask) =>
      getSubtaskId(subtask) === subtaskId
        ? {
            ...subtask,
            ...updates,
            updatedAt: new Date(),
          }
        : subtask
    );

    try {
      await updateTaskMutation({
        id: taskId,
        data: { subtasks: updatedSubtasks },
      }).unwrap();
      toast.success('Subtask updated');
    } catch (error) {
      toast.error('Failed to update subtask');
      throw error;
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!task) {
      toast.error('Task not found');
      return;
    }

    const updatedSubtasks = subtasks.filter(
      (subtask) => getSubtaskId(subtask) !== subtaskId
    );

    try {
      await updateTaskMutation({
        id: taskId,
        data: { subtasks: updatedSubtasks },
      }).unwrap();
      toast.success('Subtask deleted');
    } catch (error) {
      toast.error('Failed to delete subtask');
      throw error;
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find((s) => getSubtaskId(s) === subtaskId);
    if (!subtask) {
      toast.error('Subtask not found');
      return;
    }

    await updateSubtask(subtaskId, { completed: !subtask.completed });
  };

  return {
    subtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
  };
}

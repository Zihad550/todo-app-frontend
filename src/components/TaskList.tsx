import type { Task, UpdateTaskInput } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const TaskList = ({
  tasks,
  onUpdate,
  onDelete,
  onToggle,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No tasks yet</p>
        <p className="text-sm">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

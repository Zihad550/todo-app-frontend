import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskFilters } from '@/components/TaskFilters';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Filter, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
} from '@/types/task';

type ViewMode = 'list' | 'kanban';

function TasksPage() {
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    reorderTasks,
  } = useTasks();
  const {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    sort,
    setSort,
    selectedTags,
    toggleTag,
    availableTags,
    filteredAndSortedTasks,
  } = useTaskFilters(tasks);

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleCreateTask = (taskInput: CreateTaskInput) => {
    createTask(taskInput);
    setShowForm(false);
    toast.success('Task created successfully!');
  };

  const handleUpdateTask = (id: string, updates: UpdateTaskInput) => {
    updateTask(id, updates);
    toast.success('Task updated successfully!');
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success('Task deleted successfully!');
  };

  const handleToggleTask = (id: string) => {
    toggleTask(id);
    const task = tasks.find((t) => t.id === id);
    toast.success(
      task?.completed ? 'Task marked as incomplete!' : 'Task completed!'
    );
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    moveTask(taskId, newStatus);
    const statusLabels: Record<TaskStatus, string> = {
      backlog: 'Backlog',
      scheduled: 'Scheduled',
      progress: 'In Progress',
      completed: 'Completed',
    };
    const statusLabel = statusLabels[newStatus] || 'Unknown Status';
    toast.success(`Task moved to ${statusLabel}!`);
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const displayedCount = filteredAndSortedTasks.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Todo App</h1>
              <p className="text-muted-foreground">
                {totalCount === 0
                  ? 'No tasks yet'
                  : `${completedCount} of ${totalCount} tasks completed`}
                {displayedCount !== totalCount && viewMode === 'list' && (
                  <span> • Showing {displayedCount} tasks</span>
                )}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          )}

          {tasks.length > 0 && (
            <>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  onClick={() => setViewMode('kanban')}
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
              availableTags={availableTags}
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && tasks.length > 0 && viewMode === 'list' && (
          <div className="mb-6">
            <TaskFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              availableTags={availableTags}
            />
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <TaskList
            tasks={filteredAndSortedTasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onToggle={handleToggleTask}
            availableTags={availableTags}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            onMoveTask={handleMoveTask}
            onReorderTasks={reorderTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            availableTags={availableTags}
          />
        )}
      </div>
    </div>
  );
}

export default TasksPage;

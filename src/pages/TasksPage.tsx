import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  KanbanBoard,
  TaskFilters,
  TaskForm,
  TaskList,
  useTasks,
  useTaskFilters,
} from '@/features/tasks';
import { useTags } from '@/features/tags';

import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { CheckSquare, Filter, LayoutGrid, List, Plus } from 'lucide-react';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { toast } from 'sonner';

type ViewMode = 'list' | 'kanban';

export function TasksPage() {
  const loaderData = useLoaderData() as { tasks: Task[]; filters: unknown };
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    reorderTasks,
    addSubtask,
    toggleSubtask,
    clearColumnError,
    isLoading: isTasksLoading,
    isCreatingTask,
    columnLoadingStates,
    columnErrors,
  } = useTasks(loaderData.tasks);

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
    hasActiveFilters,
    clearAllFilters,
  } = useTaskFilters(tasks);
  const { tags, createTag, defaultColors } = useTags(tasks);

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeTab, setActiveTab] = useState<'incomplete' | 'completed'>(
    'incomplete'
  );

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      await createTask(input);
      setShowForm(false);
      toast.success('Task created successfully');
    } catch (error) {
      // Error handling is done in the hook and components
      // Keep form open so user can retry
    }
  };

  const handleCreateTag = async (name: string) => {
    // Select a random color from the default colors
    const randomColor =
      defaultColors[Math.floor(Math.random() * defaultColors.length)];
    return await createTag({ name, color: randomColor });
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
      [TaskStatus.BACKLOG]: 'Backlog',
      [TaskStatus.SCHEDULED]: 'Scheduled',
      [TaskStatus.PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed',
    };
    const statusLabel = statusLabels[newStatus] || 'Unknown Status';
    toast.success(`Task moved to ${statusLabel}!`);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    // For now, disable reordering when filters are active to avoid complexity
    if (hasActiveFilters) {
      toast.error('Please clear all filters before reordering tasks');
      return;
    }

    reorderTasks(reorderedTasks);
    toast.success('Tasks reordered successfully!');
  };

  if (isTasksLoading) return 'Loading tasks...';

  const completedCount = tasks?.filter((task) => task.completed).length;
  const incompleteCount = tasks.length - completedCount;
  const totalCount = tasks.length;

  // Filter tasks based on active tab for list view
  const getTabFilteredTasks = (baseTasks: Task[]) => {
    if (viewMode !== 'list') return baseTasks;
    return baseTasks.filter((task) =>
      activeTab === 'completed' ? task.completed : !task.completed
    );
  };

  const tabFilteredTasks = getTabFilteredTasks(filteredAndSortedTasks);
  const displayedCount =
    viewMode === 'list'
      ? tabFilteredTasks.length
      : filteredAndSortedTasks.length;

  return (
    <div className="min-h-screen bg-background">
      <div
        className={`mx-auto py-4 sm:py-6 lg:py-8 ${
          viewMode === 'kanban'
            ? 'px-3 sm:px-4 lg:px-6 max-w-screen-2xl'
            : 'container px-4 max-w-7xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Tasks
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {totalCount === 0
                  ? 'No tasks yet'
                  : viewMode === 'list'
                  ? `${
                      activeTab === 'completed'
                        ? completedCount
                        : incompleteCount
                    } ${activeTab} tasks`
                  : `${completedCount} of ${totalCount} tasks completed`}
                {viewMode === 'list' &&
                  displayedCount !==
                    (activeTab === 'completed'
                      ? completedCount
                      : incompleteCount) && (
                    <span> • Showing {displayedCount} tasks</span>
                  )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          <Button
            onClick={() => setShowForm(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>

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
                  className="rounded-r-none text-xs sm:text-sm"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">List</span>
                </Button>
                <Button
                  onClick={() => setViewMode('kanban')}
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none text-xs sm:text-sm"
                >
                  <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Kanban</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Task Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
              availableTags={tags}
              onCreateTag={handleCreateTag}
              variant="modal"
            />
          </DialogContent>
        </Dialog>

        {/* Filters */}
        {showFilters && tasks.length > 0 && (
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
              variant={viewMode === 'kanban' ? 'compact' : 'default'}
              showStatusFilter={viewMode === 'list'}
              showSortOptions={true}
              showTagFilter={true}
              onClearAll={clearAllFilters}
            />
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'incomplete' | 'completed')
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="incomplete">
                Incomplete ({incompleteCount})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incomplete">
              <TaskList
                tasks={getTabFilteredTasks(
                  // Only allow reordering when no filters are active
                  !hasActiveFilters ? tasks : filteredAndSortedTasks
                )}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                onReorder={
                  // Only provide reorder function when no filters are active and on incomplete tab
                  !hasActiveFilters && activeTab === 'incomplete'
                    ? (reorderedTasks: Task[]) => {
                        // When reordering incomplete tasks, we need to merge with completed tasks
                        const completedTasks = tasks.filter(
                          (task) => task.completed
                        );
                        const allTasks = [...reorderedTasks, ...completedTasks];
                        handleReorderTasks(allTasks);
                      }
                    : undefined
                }
                availableTags={tags}
                onCreateTag={handleCreateTag}
              />
            </TabsContent>

            <TabsContent value="completed">
              <TaskList
                tasks={getTabFilteredTasks(
                  // Only allow reordering when no filters are active
                  !hasActiveFilters ? tasks : filteredAndSortedTasks
                )}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                onReorder={
                  // Only provide reorder function when no filters are active and on completed tab
                  !hasActiveFilters && activeTab === 'completed'
                    ? (reorderedTasks: Task[]) => {
                        // When reordering completed tasks, we need to merge with incomplete tasks
                        const incompleteTasks = tasks.filter(
                          (task) => !task.completed
                        );
                        const allTasks = [
                          ...incompleteTasks,
                          ...reorderedTasks,
                        ];
                        handleReorderTasks(allTasks);
                      }
                    : undefined
                }
                availableTags={tags}
                onCreateTag={handleCreateTag}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <KanbanBoard
            tasks={hasActiveFilters ? filteredAndSortedTasks : tasks}
            onMoveTask={handleMoveTask}
            onReorderTasks={reorderTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onCreateTask={handleCreateTask}
            isCreatingTask={isCreatingTask}
            availableTags={tags}
            onCreateTag={handleCreateTag}
            columnLoadingStates={columnLoadingStates}
            columnErrors={columnErrors}
            onClearColumnError={clearColumnError}
          />
        )}
      </div>
    </div>
  );
}

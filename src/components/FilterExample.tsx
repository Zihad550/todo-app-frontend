import { useEffect } from 'react';
import { TaskFilters } from '@/components/TaskFilters';
import { useFilters } from '@/hooks/useFilters';
import type { Task } from '@/types/task';

interface FilterExampleProps {
  tasks: Task[];
  onFilteredTasksChange?: (filteredTasks: Task[]) => void;
}

/**
 * Example component demonstrating how to use the reusable TaskFilters component
 * This can be used as a reference for implementing filters in other parts of the app
 */
export function FilterExample({
  tasks,
  onFilteredTasksChange,
}: FilterExampleProps) {
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
  } = useFilters(tasks);

  // Notify parent component when filtered tasks change
  useEffect(() => {
    onFilteredTasksChange?.(filteredAndSortedTasks);
  }, [filteredAndSortedTasks, onFilteredTasksChange]);

  return (
    <div className="space-y-4">
      {/* Compact variant - good for inline filtering */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Compact Filter (Inline)</h3>
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
          variant="compact"
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Default variant - good for dedicated filter sections */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Default Filter (Card)</h3>
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
          variant="default"
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Customized variant - showing selective features */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Custom Filter (Search + Tags Only)
        </h3>
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
          variant="compact"
          showStatusFilter={false}
          showSortOptions={false}
          showTagFilter={true}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Results summary */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          {hasActiveFilters && (
            <span className="ml-2 text-primary">(filters active)</span>
          )}
        </p>
      </div>
    </div>
  );
}

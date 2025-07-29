import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'newest' | 'oldest' | 'title';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  className?: string;
  variant?: 'default' | 'compact';
  showStatusFilter?: boolean;
  showSortOptions?: boolean;
  showTagFilter?: boolean;
  onClearAll?: () => void;
}

export const TaskFilters = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  selectedTags,
  onTagToggle,
  availableTags,
  className,
  variant = 'default',
  showStatusFilter = true,
  showSortOptions = true,
  showTagFilter = true,
  onClearAll,
}: TaskFiltersProps) => {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filter !== 'all' ||
    selectedTags.length > 0 ||
    sort !== 'newest';

  const handleClearAll = () => {
    onSearchChange('');
    onFilterChange('all');
    onSortChange('newest');
    selectedTags.forEach((tag) => onTagToggle(tag));
    onClearAll?.();
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick filters in a row */}
        <div className="flex flex-wrap gap-2 items-center">
          {showStatusFilter && (
            <>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('completed')}
              >
                Completed
              </Button>
            </>
          )}

          {showSortOptions && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                variant={sort === 'newest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSortChange('newest')}
              >
                Newest
              </Button>
              <Button
                variant={sort === 'oldest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSortChange('oldest')}
              >
                Oldest
              </Button>
              <Button
                variant={sort === 'title' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSortChange('title')}
              >
                Title
              </Button>
            </>
          )}

          {hasActiveFilters && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Tag Filter */}
        {showTagFilter && availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 p-4 border rounded-lg bg-card', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      {showStatusFilter && (
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('completed')}
            >
              Completed
            </Button>
          </div>
        </div>
      )}

      {/* Sort */}
      {showSortOptions && (
        <div>
          <label className="text-sm font-medium mb-2 block">Sort by</label>
          <div className="flex gap-2">
            <Button
              variant={sort === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('newest')}
            >
              Newest
            </Button>
            <Button
              variant={sort === 'oldest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('oldest')}
            >
              Oldest
            </Button>
            <Button
              variant={sort === 'title' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('title')}
            >
              Title
            </Button>
          </div>
        </div>
      )}

      {/* Tag Filter */}
      {showTagFilter && availableTags.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

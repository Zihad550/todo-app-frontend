import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { BlogSortBy } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  sortBy: BlogSortBy;
  onSortChange: (sort: BlogSortBy) => void;
  className?: string;
}

export function BlogFilters({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  availableTags,
  sortBy,
  onSortChange,
  className,
}: BlogFiltersProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onTagsChange([]);
    onSortChange(BlogSortBy.UPDATED_DESC);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tag Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              <Filter className="h-4 w-4 mr-2" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Filter by tags</h4>
              {availableTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tags available
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label
                        htmlFor={tag}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as BlogSortBy)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BlogSortBy.UPDATED_DESC}>
              Recently Updated
            </SelectItem>
            <SelectItem value={BlogSortBy.UPDATED_ASC}>
              Oldest Updated
            </SelectItem>
            <SelectItem value={BlogSortBy.CREATED_DESC}>
              Recently Created
            </SelectItem>
            <SelectItem value={BlogSortBy.CREATED_ASC}>
              Oldest Created
            </SelectItem>
            <SelectItem value={BlogSortBy.TITLE_ASC}>Title A-Z</SelectItem>
            <SelectItem value={BlogSortBy.TITLE_DESC}>Title Z-A</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer">
              {tag}
              <X
                className="h-3 w-3 ml-1"
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExpenseFilters } from '@/types/expense';
import { ExpenseCategory } from '@/types/expense';
import { cn } from '@/lib/utils';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  className?: string;
}

const categoryOptions = [
  { value: ExpenseCategory.FOOD, label: 'Food & Dining' },
  { value: ExpenseCategory.TRANSPORT, label: 'Transportation' },
  { value: ExpenseCategory.ENTERTAINMENT, label: 'Entertainment' },
  { value: ExpenseCategory.UTILITIES, label: 'Utilities' },
  { value: ExpenseCategory.HEALTHCARE, label: 'Healthcare' },
  { value: ExpenseCategory.SHOPPING, label: 'Shopping' },
  { value: ExpenseCategory.EDUCATION, label: 'Education' },
  { value: ExpenseCategory.OTHER, label: 'Other' },
];

export function ExpenseFiltersComponent({
  filters,
  onFiltersChange,
  className,
}: ExpenseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const formatDateForInput = (date?: Date) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === 'all' ? undefined : (value as ExpenseCategory),
    });
  };

  const handleDateFromChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dateFrom: value ? new Date(value) : undefined,
    });
  };

  const handleDateToChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dateTo: value ? new Date(value) : undefined,
    });
  };

  const handleMinAmountChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minAmount: value ? parseFloat(value) : undefined,
    });
  };

  const handleMaxAmountChange = (value: string) => {
    onFiltersChange({
      ...filters,
      maxAmount: value ? parseFloat(value) : undefined,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !filters.tags?.includes(tagInput.trim())) {
      onFiltersChange({
        ...filters,
        tags: [...(filters.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card className={cn('', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={formatDateForInput(filters.dateFrom)}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={formatDateForInput(filters.dateTo)}
                  onChange={(e) => handleDateToChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleMinAmountChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleMaxAmountChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Filter by tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

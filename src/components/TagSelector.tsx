import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronDown, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagSelector = ({
  selectedTags,
  availableTags,
  onTagsChange,
  placeholder = 'Select or create tags...',
}: TagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.includes(tag)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSelectTag = (tag: string) => {
    addTag(tag);
    setInputValue('');
  };

  const handleCreateTag = () => {
    if (inputValue.trim()) {
      addTag(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${
                  selectedTags.length > 1 ? 's' : ''
                } selected`
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create tags..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              {unselectedTags.length > 0 && (
                <CommandGroup heading="Available Tags">
                  {unselectedTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => handleSelectTag(tag)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedTags.includes(tag)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {inputValue.trim() &&
                !availableTags.includes(inputValue.trim()) && (
                  <CommandGroup heading="Create New">
                    <CommandItem value={inputValue} onSelect={handleCreateTag}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create "{inputValue.trim()}"
                    </CommandItem>
                  </CommandGroup>
                )}

              {unselectedTags.length === 0 && !inputValue.trim() && (
                <CommandEmpty>
                  No tags available. Start typing to create a new tag.
                </CommandEmpty>
              )}

              {unselectedTags.length === 0 &&
                inputValue.trim() &&
                availableTags.includes(inputValue.trim()) && (
                  <CommandEmpty>Tag already selected or exists.</CommandEmpty>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

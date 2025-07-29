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

import type { TagWithMetadata } from '../hooks/useTags';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: TagWithMetadata[];
  onTagsChange: (tags: string[]) => void;
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  placeholder?: string;
}

export const TagSelector = ({
  selectedTags,
  availableTags,
  onTagsChange,
  onCreateTag,
  placeholder = 'Select or create tags...',
}: TagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const selectedTagObjects = availableTags.filter((tag) =>
    selectedTags.includes(tag.id)
  );
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.includes(tag.id)
  );

  const addTagById = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const addTagByName = async (tagName: string) => {
    const trimmedTagName = tagName.trim();
    if (!trimmedTagName) return;

    // Check if tag already exists
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === trimmedTagName.toLowerCase()
    );
    if (existingTag) {
      addTagById(existingTag.id);
      return;
    }

    // Create new tag if onCreateTag is provided
    if (onCreateTag) {
      try {
        const newTag = await onCreateTag(trimmedTagName);
        addTagById(newTag.id);
      } catch (error) {
        // Error handling is done in the createTag function (toast notifications)
        console.error('Failed to create tag:', error);
      }
    } else {
      // Fallback: create temporary ID if no onCreateTag provided
      const newTagId = crypto.randomUUID();
      onTagsChange([...selectedTags, newTagId]);
    }
  };

  const removeTagById = (tagId: string) => {
    onTagsChange(selectedTags.filter((id) => id !== tagId));
  };

  const handleSelectTag = (tag: TagWithMetadata) => {
    addTagById(tag.id);
    setInputValue('');
  };

  const handleCreateTag = async () => {
    if (inputValue.trim()) {
      await addTagByName(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      await handleCreateTag();
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
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelectTag(tag)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedTags.includes(tag.id)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {inputValue.trim() &&
                !availableTags.some(
                  (tag) =>
                    tag.name.toLowerCase() === inputValue.trim().toLowerCase()
                ) && (
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
                availableTags.some(
                  (tag) =>
                    tag.name.toLowerCase() === inputValue.trim().toLowerCase()
                ) && (
                  <CommandEmpty>Tag already selected or exists.</CommandEmpty>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTagById(tag.id)}
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

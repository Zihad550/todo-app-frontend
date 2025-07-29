import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useTasks } from '@/features/tasks';
import { useTags, type CreateTagInput } from '@/features/tags';
import { cn } from '@/lib/utils';
import {
  Edit2,
  Hash,
  Palette,
  Plus,
  Tag as TagIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TagFormProps {
  onSubmit: (input: CreateTagInput) => void;
  onCancel: () => void;
  initialData?: { name: string; color: string };
  defaultColors: string[];
}

function TagForm({
  onSubmit,
  onCancel,
  initialData,
  defaultColors,
}: TagFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || defaultColors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tag name is required');
      return;
    }
    onSubmit({ name: name.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Tag Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter tag name"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <div className="grid grid-cols-5 gap-2">
          {defaultColors.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                color === colorOption
                  ? 'border-foreground scale-110'
                  : 'border-border hover:scale-105'
              )}
              style={{ backgroundColor: colorOption }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-8 p-0 border-0"
          />
          <span className="text-sm text-muted-foreground">Custom color</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? 'Update Tag' : 'Create Tag'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function TagsPage() {
  const { tasks } = useTasks();
  const {
    tags,
    createTag,
    updateTag,
    deleteTag,
    getTagUsageCount,
    getUnusedTags,
    getMostUsedTags,
    defaultColors,
  } = useTags(tasks);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'unused' | 'popular'>('all');

  const handleCreateTag = (input: CreateTagInput) => {
    try {
      createTag(input);
      setShowCreateForm(false);
      toast.success('Tag created successfully!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create tag'
      );
    }
  };

  const handleUpdateTag = (input: CreateTagInput) => {
    if (!editingTag) return;

    try {
      updateTag(editingTag.id, input);
      setEditingTag(null);
      toast.success('Tag updated successfully!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update tag'
      );
    }
  };

  const handleDeleteTag = (id: string, name: string) => {
    const usageCount = getTagUsageCount(name);
    if (usageCount > 0) {
      toast.error(
        `Cannot delete tag "${name}" - it's used by ${usageCount} task(s)`
      );
      return;
    }

    deleteTag(id);
    toast.success('Tag deleted successfully!');
  };

  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    switch (viewMode) {
      case 'unused':
        return matchesSearch && getTagUsageCount(tag.name) === 0;
      case 'popular':
        return matchesSearch && getTagUsageCount(tag.name) > 0;
      default:
        return matchesSearch;
    }
  });

  const unusedTags = getUnusedTags();
  const mostUsedTags = getMostUsedTags(5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TagIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Tag Management</h1>
              <p className="text-muted-foreground">
                Manage your task tags and organize your workflow
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-primary" />
              <span className="font-medium">Total Tags</span>
            </div>
            <p className="text-2xl font-bold">{tags.length}</p>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium">Used Tags</span>
            </div>
            <p className="text-2xl font-bold">
              {tags.length - unusedTags.length}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Unused Tags</span>
            </div>
            <p className="text-2xl font-bold">{unusedTags.length}</p>
          </div>
        </div>

        {/* Most Used Tags */}
        {mostUsedTags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Most Used Tags</h2>
            <div className="flex flex-wrap gap-2">
              {mostUsedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name} ({tag.usageCount})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>

          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          <div className="flex border rounded-lg">
            <Button
              onClick={() => setViewMode('all')}
              variant={viewMode === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
            >
              All ({tags.length})
            </Button>
            <Button
              onClick={() => setViewMode('popular')}
              variant={viewMode === 'popular' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
            >
              Used ({tags.length - unusedTags.length})
            </Button>
            <Button
              onClick={() => setViewMode('unused')}
              variant={viewMode === 'unused' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
            >
              Unused ({unusedTags.length})
            </Button>
          </div>
        </div>

        {/* Tags List */}
        <div className="space-y-2">
          {filteredTags.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'No tags match your search' : 'No tags found'}
            </div>
          ) : (
            filteredTags.map((tag) => {
              const usageCount = getTagUsageCount(tag.name);
              return (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 bg-card border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <span className="font-medium">{tag.name}</span>
                      <p className="text-sm text-muted-foreground">
                        Used in {usageCount} task{usageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingTag({
                          id: tag.id,
                          name: tag.name,
                          color: tag.color,
                        })
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      disabled={usageCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create Tag Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <TagForm
              onSubmit={handleCreateTag}
              onCancel={() => setShowCreateForm(false)}
              defaultColors={defaultColors}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Tag Modal */}
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            {editingTag && (
              <TagForm
                onSubmit={handleUpdateTag}
                onCancel={() => setEditingTag(null)}
                initialData={{ name: editingTag.name, color: editingTag.color }}
                defaultColors={defaultColors}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

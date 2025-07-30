import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { DraftList, useDrafts } from '@/features/drafts';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import type { Draft } from '@/types/draft';
import { cn } from '@/lib/utils';

export function DraftsPage() {
  const initialDrafts = useLoaderData() as Draft[];
  const navigate = useNavigate();
  const { drafts, createDraft, deleteDraft } = useDrafts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Use drafts from hook if available, otherwise use loader data
  const allDrafts = drafts.length > 0 ? drafts : initialDrafts;

  // Get all unique tags
  const allTags = Array.from(
    new Set(allDrafts.flatMap((draft) => draft.tags))
  ).sort();

  // Filter drafts based on search and selected tag
  const displayDrafts = allDrafts.filter((draft) => {
    const matchesSearch =
      searchQuery === '' ||
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTag = selectedTag === null || draft.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const handleCreateNew = async () => {
    const title = `Draft ${new Date().toLocaleDateString()}`;
    const newDraft = await createDraft({ title });

    if (newDraft) {
      navigate(`/drafts/${newDraft.id}`);
    }
  };

  const handleDraftDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      await deleteDraft(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drafts by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter by tag:</span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center space-x-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Clear filter</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedTag === tag
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            {displayDrafts.length === allDrafts.length
              ? `${allDrafts.length} draft${allDrafts.length !== 1 ? 's' : ''}`
              : `${displayDrafts.length} of ${allDrafts.length} draft${
                  allDrafts.length !== 1 ? 's' : ''
                }`}
          </div>
        </div>

        <DraftList
          drafts={displayDrafts}
          onDraftDelete={handleDraftDelete}
          onCreateNew={handleCreateNew}
        />
      </div>
    </div>
  );
}

import { Link } from 'react-router';
import { FileText, Plus, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Draft } from '@/types/draft';
import { cn } from '@/lib/utils';

interface DraftListProps {
  drafts: Draft[];
  onDraftDelete: (id: string) => void;
  onCreateNew: () => void;
  className?: string;
}

export function DraftList({
  drafts,
  onDraftDelete,
  onCreateNew,
  className,
}: DraftListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Drafts</h1>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Draft</span>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No drafts yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Create your first markdown draft to get started
            </p>
            <Button
              onClick={onCreateNew}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Draft</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {draft.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDraftDelete(draft.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {draft.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {draft.content.substring(0, 150)}
                      {draft.content.length > 150 && '...'}
                    </p>
                  )}

                  {draft.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {draft.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {draft.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{draft.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(draft.updatedAt)}</span>
                    </div>
                    <Link to={`/drafts/${draft.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

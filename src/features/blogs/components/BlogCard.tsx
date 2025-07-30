import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Blog } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  onView: (blog: Blog) => void;
  className?: string;
}

export function BlogCard({
  blog,
  onEdit,
  onDelete,
  onView,
  className,
}: BlogCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(blog.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    // Remove markdown formatting for preview
    const plainText = content.replace(/[#*`_~]/g, '').replace(/\n/g, ' ');
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onView(blog)}>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {blog.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(blog.createdAt)}</span>
              </div>
              {blog.updatedAt !== blog.createdAt && (
                <div className="flex items-center gap-1">
                  <span>Updated {formatDate(blog.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(blog)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent onClick={() => onView(blog)}>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {getPreview(blog.content)}
        </p>
        {blog.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

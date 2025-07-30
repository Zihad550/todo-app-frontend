import { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Eye,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Blog } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogViewerProps {
  blog: Blog;
  onBack: () => void;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function BlogViewer({
  blog,
  onBack,
  onEdit,
  onDelete,
  className,
}: BlogViewerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(blog.id);
      onBack();
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Simple markdown to HTML conversion for preview
  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-semibold mb-3">$1</h2>'
      )
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>'
      )
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gim, '<p class="mb-4">$1</p>');
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(blog)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Blog Content */}
      <Card>
        <CardHeader className="pb-4">
          <h1 className="text-3xl font-bold">{blog.title}</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(blog.createdAt)}</span>
            </div>
            {blog.updatedAt !== blog.createdAt && (
              <div className="flex items-center gap-2">
                <span>Updated {formatDate(blog.updatedAt)}</span>
              </div>
            )}
          </div>
          {blog.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="markdown" className="gap-2">
                <Code className="h-4 w-4" />
                Markdown
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-6">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(blog.content),
                }}
              />
            </TabsContent>
            <TabsContent value="markdown" className="mt-6">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                {blog.content}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{blog.title}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

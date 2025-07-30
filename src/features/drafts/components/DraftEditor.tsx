import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Save, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagInput } from './TagInput';
import type { Draft, UpdateDraftInput } from '@/types/draft';
import { cn } from '@/lib/utils';

interface DraftEditorProps {
  draft?: Draft | null;
  onDraftUpdate: (id: string, updates: UpdateDraftInput) => void;
  className?: string;
}

export function DraftEditor({
  draft,
  onDraftUpdate,
  className,
}: DraftEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(draft?.title || '');
  const [content, setContent] = useState(draft?.content || '');
  const [tags, setTags] = useState<string[]>(draft?.tags || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setTags(draft.tags);
      setHasChanges(false);
    }
  }, [draft]);

  useEffect(() => {
    if (draft) {
      const titleChanged = title !== draft.title;
      const contentChanged = content !== draft.content;
      const tagsChanged =
        JSON.stringify(tags.sort()) !== JSON.stringify(draft.tags.sort());
      setHasChanges(titleChanged || contentChanged || tagsChanged);
    }
  }, [title, content, tags, draft]);

  const handleSave = () => {
    if (draft && hasChanges) {
      onDraftUpdate(draft.id, { title, content, tags });
      setHasChanges(false);
    }
  };

  const handleBack = () => {
    navigate('/drafts');
  };

  // Simple markdown preview renderer
  const renderMarkdown = (markdown: string) => {
    return markdown.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold mb-4">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-semibold mb-3">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-medium mb-2">
            {line.substring(4)}
          </h3>
        );
      }

      // Bold and italic (simple implementation)
      const processedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(
          /`(.*?)`/g,
          '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
        );

      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Regular paragraphs
      return (
        <p
          key={index}
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  if (!draft) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-muted-foreground">Draft not found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Drafts</span>
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Edit Draft</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium mb-2 block">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter draft title..."
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Add tags (press Enter or comma to add)..."
              />
            </div>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="edit"
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                <div>
                  <label
                    htmlFor="content"
                    className="text-sm font-medium mb-2 block"
                  >
                    Content (Markdown)
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your markdown content here..."
                    className="min-h-[400px] font-mono"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-md p-4 min-h-[400px] bg-card">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {content ? (
                      renderMarkdown(content)
                    ) : (
                      <p className="text-muted-foreground italic">
                        No content to preview. Switch to Edit tab to add
                        content.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

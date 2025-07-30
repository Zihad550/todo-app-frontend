import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BlogList,
  BlogFilters,
  CreateBlogModal,
  EditBlogModal,
  BlogViewer,
  useBlogs,
} from '@/features/blogs';
import type { Blog } from '@/types/blog';

export function BlogsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  const {
    blogs,
    allTags,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    createBlog,
    updateBlog,
    deleteBlog,
  } = useBlogs();

  const handleCreateBlog = async (input: any) => {
    await createBlog(input);
    setShowCreateModal(false);
  };

  const handleEditBlog = async (id: string, updates: unknown) => {
    await updateBlog(id, updates);
    setEditingBlog(null);
  };

  const handleDeleteBlog = async (id: string) => {
    await deleteBlog(id);
  };

  const handleBlogView = (blog: Blog) => {
    setViewingBlog(blog);
  };

  const handleBackToList = () => {
    setViewingBlog(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewingBlog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BlogViewer
          blog={viewingBlog}
          onBack={handleBackToList}
          onEdit={setEditingBlog}
          onDelete={handleDeleteBlog}
        />
        <EditBlogModal
          blog={editingBlog}
          isOpen={!!editingBlog}
          onClose={() => setEditingBlog(null)}
          onSubmit={handleEditBlog}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-muted-foreground mt-1">
            Write and manage your blog posts in markdown
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Blog
        </Button>
      </div>

      {/* Filters */}
      <BlogFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        availableTags={allTags}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Blog List */}
      <BlogList
        blogs={blogs}
        onBlogEdit={setEditingBlog}
        onBlogDelete={handleDeleteBlog}
        onBlogView={handleBlogView}
      />

      {/* Modals */}
      <CreateBlogModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBlog}
      />

      <EditBlogModal
        blog={editingBlog}
        isOpen={!!editingBlog}
        onClose={() => setEditingBlog(null)}
        onSubmit={handleEditBlog}
      />
    </div>
  );
}

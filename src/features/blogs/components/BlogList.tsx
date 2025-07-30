import type { Blog } from '@/types/blog';
import { BlogCard } from './BlogCard';
import { cn } from '@/lib/utils';

interface BlogListProps {
  blogs: Blog[];
  onBlogEdit: (blog: Blog) => void;
  onBlogDelete: (id: string) => void;
  onBlogView: (blog: Blog) => void;
  className?: string;
}

export function BlogList({
  blogs,
  onBlogEdit,
  onBlogDelete,
  onBlogView,
  className,
}: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No blogs found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first blog to get started
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          onEdit={onBlogEdit}
          onDelete={onBlogDelete}
          onView={onBlogView}
        />
      ))}
    </div>
  );
}

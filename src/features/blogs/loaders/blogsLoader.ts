import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { blogApi } from '@/redux/blogApi';

export async function blogsLoader({ request }: LoaderFunctionArgs) {
  try {
    const result = await blogApi.endpoints.getBlogs.initiate();
    return result.data || [];
  } catch (error) {
    console.error('Failed to load blogs:', error);
    return [];
  }
}

export async function blogLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error('Blog ID is required');
  }

  try {
    const result = await blogApi.endpoints.getBlog.initiate(id);
    return result.data;
  } catch (error) {
    console.error('Failed to load blog:', error);
    throw new Response('Blog not found', { status: 404 });
  }
}

export async function blogAction({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  switch (intent) {
    case 'create': {
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const tags = JSON.parse((formData.get('tags') as string) || '[]');

      try {
        const result = await blogApi.endpoints.createBlog.initiate({
          title,
          content,
          tags,
        });
        return result.data;
      } catch (error) {
        throw new Response('Failed to create blog', { status: 500 });
      }
    }

    case 'update': {
      const { id } = params;
      if (!id) {
        throw new Error('Blog ID is required');
      }

      const updates: any = {};
      const title = formData.get('title');
      const content = formData.get('content');
      const tags = formData.get('tags');

      if (title) updates.title = title;
      if (content) updates.content = content;
      if (tags) updates.tags = JSON.parse(tags as string);

      try {
        const result = await blogApi.endpoints.updateBlog.initiate({
          id,
          updates,
        });
        return result.data;
      } catch (error) {
        throw new Response('Failed to update blog', { status: 500 });
      }
    }

    case 'delete': {
      const { id } = params;
      if (!id) {
        throw new Error('Blog ID is required');
      }

      try {
        await blogApi.endpoints.deleteBlog.initiate(id);
        return { success: true };
      } catch (error) {
        throw new Response('Failed to delete blog', { status: 500 });
      }
    }

    default:
      throw new Error('Invalid action intent');
  }
}

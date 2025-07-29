import type { LoaderFunctionArgs } from 'react-router';

export async function tasksLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const tag = url.searchParams.get('tag');

  // For now, return empty array - this will be integrated with your RTK Query
  // when you have the API endpoints set up
  return {
    tasks: [],
    filters: {
      status,
      tag,
    },
  };
}

import type { LoaderFunctionArgs } from 'react-router';

export async function tagsLoader(_args: LoaderFunctionArgs) {
  // For now, return empty array - this will be integrated with your RTK Query
  // when you have the API endpoints set up
  return {
    tags: [],
  };
}

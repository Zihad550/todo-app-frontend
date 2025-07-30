import type { LoaderFunctionArgs } from 'react-router';

export async function habitsLoader({ request }: LoaderFunctionArgs) {
  // In a real app, this would fetch habits from an API
  // For now, we'll return null and let the hook handle the data
  return null;
}

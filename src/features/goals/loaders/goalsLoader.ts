import { type LoaderFunctionArgs } from 'react-router';

export async function goalsLoader({ request }: LoaderFunctionArgs) {
  // In a real app, this would fetch from an API
  // For now, we'll return empty data since the hook manages mock data
  return {
    goals: [],
    timestamp: new Date().toISOString(),
  };
}

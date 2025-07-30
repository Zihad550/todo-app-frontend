import type { LoaderFunctionArgs } from 'react-router';

export async function routinesLoader() {
  // In a real app, this would fetch from an API
  // For now, we'll return empty data since the hook handles the data
  return { routines: [] };
}

export async function routineLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  // In a real app, this would fetch a specific routine from an API
  return { routineId: id };
}

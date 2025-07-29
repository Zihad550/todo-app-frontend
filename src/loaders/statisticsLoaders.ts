import type { LoaderFunctionArgs } from 'react-router';

export async function statisticsLoader(_args: LoaderFunctionArgs) {
  // For now, return empty stats - this will be integrated with your RTK Query
  // when you have the API endpoints set up
  return {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    backlogTasks: 0,
    scheduledTasks: 0,
    tagStats: [],
  };
}

import { createBrowserRouter } from 'react-router';
import { TasksPage } from '@/components/TasksPage';
import { TagsPage } from '@/components/TagsPage';
import { StatisticsPage } from '@/components/StatisticsPage';
import { RootLayout } from '@/components/RootLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { tasksLoader } from '@/loaders/taskLoaders';
import { tagsLoader } from '@/loaders/tagLoaders';
import { statisticsLoader } from '@/loaders/statisticsLoaders';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <TasksPage />,
        loader: tasksLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
        loader: tasksLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'tags',
        element: <TagsPage />,
        loader: tagsLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'statistics',
        element: <StatisticsPage />,
        loader: statisticsLoader,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
]);

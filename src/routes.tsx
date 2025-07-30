import { createBrowserRouter } from 'react-router';
import { TasksPage } from '@/pages/TasksPage';
import { TagsPage } from '@/pages/TagsPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { DraftsPage } from '@/pages/DraftsPage';
import { DraftEditPage } from '@/pages/DraftEditPage';
import { RootLayout } from '@/components/RootLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { tasksLoader } from '@/features/tasks';
import { tagsLoader } from '@/features/tags';
import { statisticsLoader } from '@/features/statistics';
import { draftsLoader, draftLoader } from '@/features/drafts';

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
      {
        path: 'drafts',
        element: <DraftsPage />,
        loader: draftsLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'drafts/:id',
        element: <DraftEditPage />,
        loader: draftLoader,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
]);

import { createBrowserRouter } from 'react-router';
import { TasksPage } from '@/pages/TasksPage';
import { TagsPage } from '@/pages/TagsPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { DraftsPage } from '@/pages/DraftsPage';
import { DraftEditPage } from '@/pages/DraftEditPage';
import { RoutinesPage } from '@/pages/RoutinesPage';
import { HabitsPage } from '@/pages/HabitsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { BlogsPage } from '@/pages/BlogsPage';
import { RootLayout } from '@/components/RootLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { tasksLoader } from '@/features/tasks';
import { tagsLoader } from '@/features/tags';
import { statisticsLoader } from '@/features/statistics';
import { draftsLoader, draftLoader } from '@/features/drafts';
import { routinesLoader } from '@/features/routines';
import { expensesLoader } from '@/features/expenses';
import { habitsLoader } from '@/features/habits';
import { goalsLoader } from '@/features/goals';
import { blogsLoader } from '@/features/blogs';

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
      {
        path: 'routines',
        element: <RoutinesPage />,
        loader: routinesLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
        loader: expensesLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'habits',
        element: <HabitsPage />,
        loader: habitsLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'goals',
        element: <GoalsPage />,
        loader: goalsLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'blogs',
        element: <BlogsPage />,
        loader: blogsLoader,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
]);

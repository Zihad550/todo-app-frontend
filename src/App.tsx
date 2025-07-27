import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TasksPage from '@/components/TasksPage';
import TagsPage from '@/components/TagsPage';
import { StatisticsPage } from '@/components/StatisticsPage';

type Page = 'tasks' | 'tags' | 'statistics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('tasks');
  const tasksData = useTasks();

  const navigateToTasks = () => setCurrentPage('tasks');
  const navigateToTags = () => setCurrentPage('tags');
  const navigateToStatistics = () => setCurrentPage('statistics');

  return (
    <>
      {currentPage === 'tasks' && (
        <TasksPage
          tasksData={tasksData}
          onNavigateToTags={navigateToTags}
          onNavigateToStatistics={navigateToStatistics}
        />
      )}
      {currentPage === 'tags' && <TagsPage onBack={navigateToTasks} />}
      {currentPage === 'statistics' && (
        <StatisticsPage tasks={tasksData.tasks} onBack={navigateToTasks} />
      )}
    </>
  );
}

export default App;

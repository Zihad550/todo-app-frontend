import { useState } from 'react';
import TasksPage from '@/components/TasksPage';
import TagsPage from '@/components/TagsPage';

type Page = 'tasks' | 'tags';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('tasks');

  const navigateToTasks = () => setCurrentPage('tasks');
  const navigateToTags = () => setCurrentPage('tags');

  return (
    <>
      {currentPage === 'tasks' && (
        <TasksPage onNavigateToTags={navigateToTags} />
      )}
      {currentPage === 'tags' && <TagsPage onBack={navigateToTasks} />}
    </>
  );
}

export default App;

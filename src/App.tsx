// import { StatisticsPage } from "@/components/StatisticsPage";
// import TagsPage from "@/components/TagsPage";
import TasksPage from "@/components/TasksPage";
import { useState } from "react";

type Page = "tasks" | "tags" | "statistics";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("tasks");

  const navigateToTasks = () => setCurrentPage("tasks");
  const navigateToTags = () => setCurrentPage("tags");
  const navigateToStatistics = () => setCurrentPage("statistics");

  return (
    <>
      {currentPage === "tasks" && (
        <TasksPage
          onNavigateToTags={navigateToTags}
          onNavigateToStatistics={navigateToStatistics}
        />
      )}
      {/* {currentPage === "tags" && <TagsPage onBack={navigateToTasks} />}
      {currentPage === "statistics" && (
        <StatisticsPage onBack={navigateToTasks} />
      )} */}
    </>
  );
}

export default App;

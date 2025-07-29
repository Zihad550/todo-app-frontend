import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTasks } from '@/features/tasks';
import { useTags } from '@/features/tags';
import { TaskStatus } from '@/types/task';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Tag,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

interface StatusStats {
  backlog: number;
  scheduled: number;
  progress: number;
  completed: number;
}

interface TagStats {
  name: string;
  count: number;
  completedCount: number;
  completionRate: number;
}

interface TimeStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  older: number;
}

export function StatisticsPage() {
  const { tasks } = useTasks();
  const { tags } = useTags(tasks);
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Status distribution
    const statusStats: StatusStats = tasks.reduce(
      (acc, task) => {
        acc[task.status]++;
        return acc;
      },
      { backlog: 0, scheduled: 0, progress: 0, completed: 0 }
    );

    // Tag statistics
    const tagMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach((task) => {
      task.tags.forEach((tagId) => {
        const tag = tags.find((t) => t.id === tagId);
        if (tag) {
          const current = tagMap.get(tag.name) || { total: 0, completed: 0 };
          tagMap.set(tag.name, {
            total: current.total + 1,
            completed: current.completed + (task.completed ? 1 : 0),
          });
        }
      });
    });

    const tagStats: TagStats[] = Array.from(tagMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.total,
        completedCount: stats.completed,
        completionRate:
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Time-based statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const timeStats: TimeStats = tasks.reduce(
      (acc, task) => {
        const createdDate = new Date(task.createdAt);
        if (createdDate >= today) {
          acc.today++;
        } else if (createdDate >= weekAgo) {
          acc.thisWeek++;
        } else if (createdDate >= monthAgo) {
          acc.thisMonth++;
        } else {
          acc.older++;
        }
        return acc;
      },
      { today: 0, thisWeek: 0, thisMonth: 0, older: 0 }
    );

    // Recent activity (tasks updated in last 7 days)
    const recentActivity = tasks.filter(
      (task) => new Date(task.updatedAt) >= weekAgo
    ).length;

    // Average completion time (for completed tasks)
    const completedTasksWithTime = tasks.filter(
      (task) =>
        task.completed &&
        new Date(task.updatedAt).getTime() !==
          new Date(task.createdAt).getTime()
    );
    const avgCompletionTime =
      completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((acc, task) => {
            const completionTime =
              new Date(task.updatedAt).getTime() -
              new Date(task.createdAt).getTime();
            return acc + completionTime;
          }, 0) / completedTasksWithTime.length
        : 0;

    const avgCompletionDays =
      avgCompletionTime > 0
        ? Math.round(avgCompletionTime / (1000 * 60 * 60 * 24))
        : 0;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      statusStats,
      tagStats,
      timeStats,
      recentActivity,
      avgCompletionDays,
    };
  }, [tasks]);

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.BACKLOG:
        return 'bg-gray-500';
      case TaskStatus.SCHEDULED:
        return 'bg-blue-500';
      case TaskStatus.PROGRESS:
        return 'bg-yellow-500';
      case TaskStatus.COMPLETED:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.BACKLOG:
        return 'Backlog';
      case TaskStatus.SCHEDULED:
        return 'Scheduled';
      case TaskStatus.PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  Statistics
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Overview of your task management
                </p>
              </div>
            </div>
          </div>
        </div>

        {stats.totalTasks === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground text-center">
                Create some tasks to see your statistics here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    All time tasks created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.completedTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completionRate.toFixed(1)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recent Activity
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.recentActivity}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tasks updated this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Completion
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.avgCompletionDays > 0
                      ? `${stats.avgCompletionDays}d`
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average days to complete
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span>{stats.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.completedTasks} of {stats.totalTasks} tasks completed
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.statusStats).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getStatusColor(
                                status as TaskStatus
                              )}`}
                            />
                            <span className="text-sm font-medium">
                              {getStatusLabel(status as TaskStatus)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{count}</span>
                            <span className="text-xs text-muted-foreground">
                              (
                              {stats.totalTasks > 0
                                ? ((count / stats.totalTasks) * 100).toFixed(1)
                                : 0}
                              %)
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Creation Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Creation Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Today</span>
                      <span className="text-sm font-bold">
                        {stats.timeStats.today}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">This Week</span>
                      <span className="text-sm font-bold">
                        {stats.timeStats.thisWeek}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-sm font-bold">
                        {stats.timeStats.thisMonth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Older</span>
                      <span className="text-sm font-bold">
                        {stats.timeStats.older}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tag Statistics */}
            {stats.tagStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tag Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.tagStats.slice(0, 12).map((tag) => (
                      <div
                        key={tag.name}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{tag.name}</Badge>
                          <span className="text-sm font-medium">
                            {tag.count}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {tag.completionRate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tag.completedCount}/{tag.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {stats.tagStats.length > 12 && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Showing top 12 tags. Total: {stats.tagStats.length} tags
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

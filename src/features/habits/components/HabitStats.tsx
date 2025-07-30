import { TrendingUp, Target, Flame, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HabitStats as HabitStatsType } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitStatsProps {
  stats: HabitStatsType;
  className?: string;
}

export function HabitStats({ stats, className }: HabitStatsProps) {
  const statCards = [
    {
      title: 'Active Habits',
      value: stats.activeHabits,
      subtitle: `of ${stats.totalHabits} total`,
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      subtitle: 'Overall success rate',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Longest Streak',
      value: stats.longestStreak,
      subtitle: `Avg: ${stats.averageStreak} days`,
      icon: Flame,
      color: 'text-orange-600',
    },
    {
      title: 'This Month',
      value: stats.completionsThisMonth,
      subtitle: `${stats.completionsThisWeek} this week`,
      icon: Calendar,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={cn('h-4 w-4', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

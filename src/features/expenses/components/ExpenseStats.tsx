import { TrendingUp, DollarSign, Receipt, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExpenseStats } from '@/types/expense';
import { cn } from '@/lib/utils';

interface ExpenseStatsProps {
  stats: ExpenseStats;
  className?: string;
}

export function ExpenseStatsComponent({ stats, className }: ExpenseStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return category.toLowerCase().replace('_', ' ');
  };

  const topCategories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {/* Total Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {stats.totalExpenses} expenses
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalExpenses}</div>
          <p className="text-xs text-muted-foreground">Recorded transactions</p>
        </CardContent>
      </Card>

      {/* Average Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.averageAmount)}
          </div>
          <p className="text-xs text-muted-foreground">Per transaction</p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {topCategories[0] ? getCategoryLabel(topCategories[0][0]) : 'None'}
          </div>
          <p className="text-xs text-muted-foreground">
            {topCategories[0]
              ? formatCurrency(topCategories[0][1])
              : 'No expenses'}
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, amount]) => {
                const percentage = (amount / stats.totalAmount) * 100;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {getCategoryLabel(category)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trend */}
      {stats.monthlyTrend.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthlyTrend.slice(-3).map((month) => (
                <div
                  key={month.month}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(month.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {month.count} expense{month.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

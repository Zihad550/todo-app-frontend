import type { Expense } from '@/types/expense';
import { ExpenseCard } from './ExpenseCard';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseEdit: (expense: Expense) => void;
  onExpenseDelete: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ExpenseList({
  expenses,
  onExpenseEdit,
  onExpenseDelete,
  isLoading = false,
  className,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No expenses found</p>
          <p className="text-sm mt-1">
            Create your first expense to get started
          </p>
        </div>
      </div>
    );
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={cn('space-y-4', className)}>
      {sortedExpenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onExpenseEdit}
          onDelete={onExpenseDelete}
        />
      ))}
    </div>
  );
}

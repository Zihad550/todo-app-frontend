import { useMemo } from 'react';
import type { Expense, ExpenseStats, ExpenseCategory } from '@/types/expense';

export function useExpenseStats(expenses: Expense[]): ExpenseStats {
  return useMemo(() => {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        );
      });

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        amount: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: monthExpenses.length,
      });
    }

    return {
      totalExpenses,
      totalAmount,
      averageAmount,
      categoryBreakdown,
      monthlyTrend,
    };
  }, [expenses]);
}

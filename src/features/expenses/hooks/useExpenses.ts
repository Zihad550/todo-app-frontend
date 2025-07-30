import { useState } from 'react';
import { toast } from 'sonner';
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from '@/types/expense';
import { ExpenseCategory } from '@/types/expense';

// Mock data for development
const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Grocery Shopping',
    description: 'Weekly groceries at supermarket',
    amount: 85.5,
    category: ExpenseCategory.FOOD,
    date: new Date('2025-01-25'),
    tags: ['groceries', 'weekly'],
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: '2',
    title: 'Gas Station',
    description: 'Fuel for car',
    amount: 45.0,
    category: ExpenseCategory.TRANSPORT,
    date: new Date('2025-01-24'),
    tags: ['fuel', 'car'],
    createdAt: new Date('2025-01-24'),
    updatedAt: new Date('2025-01-24'),
  },
  {
    id: '3',
    title: 'Movie Tickets',
    description: 'Cinema tickets for weekend',
    amount: 28.0,
    category: ExpenseCategory.ENTERTAINMENT,
    date: new Date('2025-01-23'),
    tags: ['cinema', 'weekend'],
    createdAt: new Date('2025-01-23'),
    updatedAt: new Date('2025-01-23'),
  },
];

export function useExpenses(filters?: ExpenseFilters) {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters
  const filteredExpenses = expenses.filter((expense) => {
    if (filters?.category && expense.category !== filters.category) {
      return false;
    }
    if (filters?.dateFrom && expense.date < filters.dateFrom) {
      return false;
    }
    if (filters?.dateTo && expense.date > filters.dateTo) {
      return false;
    }
    if (filters?.minAmount && expense.amount < filters.minAmount) {
      return false;
    }
    if (filters?.maxAmount && expense.amount > filters.maxAmount) {
      return false;
    }
    if (filters?.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        expense.tags.some((expenseTag) =>
          expenseTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    return true;
  });

  const createExpense = async (input: CreateExpenseInput): Promise<void> => {
    setIsLoading(true);
    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        title: input.title,
        description: input.description || '',
        amount: input.amount,
        category: input.category,
        date: input.date,
        tags: input.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistic update
      setExpenses((prev) => [newExpense, ...prev]);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success('Expense created successfully');
    } catch (error) {
      // Revert optimistic update
      setExpenses((prev) => prev.filter((e) => e.id !== Date.now().toString()));
      toast.error('Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (
    id: string,
    updates: UpdateExpenseInput
  ): Promise<void> => {
    setIsLoading(true);
    const previousExpenses = [...expenses];

    try {
      // Optimistic update
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === id
            ? { ...expense, ...updates, updatedAt: new Date() }
            : expense
        )
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success('Expense updated successfully');
    } catch (error) {
      // Revert optimistic update
      setExpenses(previousExpenses);
      toast.error('Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setIsLoading(true);
    const previousExpenses = [...expenses];

    try {
      // Optimistic update
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success('Expense deleted successfully');
    } catch (error) {
      // Revert optimistic update
      setExpenses(previousExpenses);
      toast.error('Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    expenses: filteredExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    isLoading,
  };
}

import type { Expense } from '@/types/expense';
import { ExpenseCategory } from '@/types/expense';

// Mock data for initial load
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

export async function expensesLoader(): Promise<Expense[]> {
  // In a real app, this would fetch from an API
  // For now, return mock data
  return mockExpenses;
}

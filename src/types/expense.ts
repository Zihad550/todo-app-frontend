export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  UTILITIES = 'UTILITIES',
  HEALTHCARE = 'HEALTHCARE',
  SHOPPING = 'SHOPPING',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  tags?: string[];
}

export interface UpdateExpenseInput {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: Date;
  tags?: string[];
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

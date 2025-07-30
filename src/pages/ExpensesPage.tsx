import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { DollarSign } from 'lucide-react';
import {
  ExpenseList,
  CreateExpenseModal,
  EditExpenseModal,
  ExpenseFilters,
  ExpenseStats,
  useExpenses,
  useExpenseStats,
} from '@/features/expenses';
import type {
  Expense,
  ExpenseFilters as ExpenseFiltersType,
} from '@/types/expense';

export function ExpensesPage() {
  useLoaderData() as Expense[]; // Initial data loaded by router
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { expenses, createExpense, updateExpense, deleteExpense, isLoading } =
    useExpenses(filters);
  const stats = useExpenseStats(expenses);

  const handleExpenseEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleExpenseUpdate = (id: string, updates: unknown) => {
    updateExpense(id, updates);
    setEditingExpense(null);
  };

  const handleCloseEditModal = () => {
    setEditingExpense(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your expenses
            </p>
          </div>
        </div>
        <CreateExpenseModal
          onExpenseCreate={createExpense}
          isLoading={isLoading}
        />
      </div>

      {/* Statistics */}
      <ExpenseStats stats={stats} />

      {/* Filters */}
      <ExpenseFilters filters={filters} onFiltersChange={setFilters} />

      {/* Expense List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Recent Expenses ({expenses.length})
          </h2>
        </div>
        <ExpenseList
          expenses={expenses}
          onExpenseEdit={handleExpenseEdit}
          onExpenseDelete={deleteExpense}
          isLoading={isLoading}
        />
      </div>

      {/* Edit Modal */}
      <EditExpenseModal
        expense={editingExpense}
        isOpen={!!editingExpense}
        onClose={handleCloseEditModal}
        onExpenseUpdate={handleExpenseUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Expense, ExpenseCategory } from '@/types/expense';
import { cn } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const categoryColors: Record<ExpenseCategory, string> = {
  FOOD: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  TRANSPORT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ENTERTAINMENT:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  UTILITIES:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  HEALTHCARE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  SHOPPING: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  EDUCATION:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  className,
}: ExpenseCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{expense.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={categoryColors[expense.category]}>
              {expense.category.toLowerCase()}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(expense.date)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(expense.amount)}
          </span>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(expense)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(expense.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {(expense.description || expense.tags.length > 0) && (
        <CardContent className="pt-0">
          {expense.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {expense.description}
            </p>
          )}
          {expense.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {expense.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

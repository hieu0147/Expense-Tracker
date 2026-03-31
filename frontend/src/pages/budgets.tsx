import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBudgets } from '@/hooks/use-budgets';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency } from '@/lib/utils';

export default function BudgetsPage() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStart = format(new Date(currentMonth + '-01'), 'yyyy-MM-dd');

  const { data: budgets = [] } = useBudgets(currentMonth);
  const { data: transactions = [] } = useTransactions({
    startDate: monthStart,
  });

  const budgetWithSpending = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter(
          (t) => t.type === 'expense' && t.category_id === budget.category_id
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const percentage = (spent / Number(budget.amount_limit)) * 100;
      const cat = budget.categories as any;

      return {
        ...budget,
        categoryName: cat.name,
        categoryColor: cat.color,
        spent,
        percentage: Math.min(percentage, 100),
        isOverBudget: percentage > 100,
      };
    });
  }, [budgets, transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ngân sách</h1>
        <p className="text-muted-foreground">
          Theo dõi và quản lý ngân sách tháng {format(new Date(), 'MM/yyyy')}
        </p>
      </div>

      {budgetWithSpending.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Chưa có ngân sách nào được thiết lập
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgetWithSpending.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{budget.categoryName}</span>
                  <span
                    className={`text-lg ${
                      budget.isOverBudget ? 'text-expense' : 'text-foreground'
                    }`}
                  >
                    {budget.percentage.toFixed(0)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress
                  value={budget.percentage}
                  className={budget.isOverBudget ? '[&>div]:bg-expense' : ''}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Đã chi: {formatCurrency(budget.spent)}
                  </span>
                  <span className="text-muted-foreground">
                    Hạn mức: {formatCurrency(Number(budget.amount_limit))}
                  </span>
                </div>
                {budget.isOverBudget && (
                  <p className="text-sm text-expense font-medium">
                    Đã vượt ngân sách!
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/use-transactions';
import { useBudgets } from '@/hooks/use-budgets';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function DashboardPage() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: txData, isLoading } = useTransactions({
    startDate: monthStart,
    endDate: monthEnd,
  });
  const transactions = txData?.items ?? [];

  const { data: budgets = [] } = useBudgets(currentMonth);

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expense;

    return { income, expense, balance };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.categories as any;
        const existing = categoryMap.get(cat.id) || {
          name: cat.name,
          value: 0,
          color: cat.color,
        };
        categoryMap.set(cat.id, {
          ...existing,
          value: existing.value + Number(t.amount),
        });
      });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const budgetAlerts = useMemo(() => {
    return budgets
      .map((budget) => {
        const spent = Number(budget.spent_amount ?? 0);
        const limit = Number(budget.amount_limit);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        const cat = budget.categories as any;

        return {
          id: budget.id,
          categoryName: cat?.name ?? 'Hạng mục',
          spent,
          limit,
          percentage,
        };
      })
      .filter((b) => b.percentage >= 80)
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground">
          Tháng {format(new Date(), 'MM/yyyy', { locale: vi })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thu nhập</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrency(stats.income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chi tiêu</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(stats.expense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Số dư</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.balance >= 0 ? 'text-income' : 'text-expense'
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ chi tiêu theo hạng mục</CardTitle>
            <CardDescription>Chi tiêu tháng này</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Chưa có dữ liệu chi tiêu
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>5 giao dịch mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const cat = transaction.categories as any;
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <span style={{ color: cat.color }}>
                            {cat.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.type === 'income'
                            ? 'text-income'
                            : 'text-expense'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Chưa có giao dịch nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {budgetAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Cảnh báo ngân sách
            </CardTitle>
            <CardDescription>
              Các hạng mục sắp vượt hoặc đã vượt ngân sách
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAlerts.map((alert) => (
                <div key={alert.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{alert.categoryName}</span>
                    <span
                      className={
                        alert.percentage >= 100
                          ? 'text-expense font-semibold'
                          : 'text-amber-600 font-semibold'
                      }
                    >
                      {alert.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {formatCurrency(alert.spent)} / {formatCurrency(alert.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        alert.percentage >= 100
                          ? 'bg-expense'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                    />
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

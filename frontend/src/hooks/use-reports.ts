import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type DashboardSummaryBackend = {
  success: true;
  data: {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    recentTransactions: any[];
  };
};

export type ExpenseByCategoryBackend = {
  success: true;
  data: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    totalAmount: number;
  }>;
};

export type IncomeVsExpenseBackend = {
  success: true;
  data: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const res: any = await api.get('/reports/dashboard');
      return (res?.data ?? res) as DashboardSummaryBackend['data'];
    },
  });
}

export function useExpenseByCategory(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['reports', 'expense-by-category', params],
    queryFn: async () => {
      const res: any = await api.get('/reports/expense-by-category', { params });
      return (res?.data ?? res) as ExpenseByCategoryBackend['data'];
    },
  });
}

export function useIncomeVsExpense(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'month';
}) {
  return useQuery({
    queryKey: ['reports', 'income-vs-expense', params],
    queryFn: async () => {
      const res: any = await api.get('/reports/income-vs-expense', { params });
      return (res?.data ?? res) as IncomeVsExpenseBackend['data'];
    },
  });
}


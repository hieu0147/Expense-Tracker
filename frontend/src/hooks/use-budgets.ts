import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Budget, BudgetInsert, BudgetUpdate, Category } from '@/types';
import { api } from '@/lib/api';
import { startOfMonth, endOfMonth } from 'date-fns';
import { toIsoDateForApi } from './use-transactions';

type BackendPopulatedCategory = {
  _id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault?: boolean;
  userId?: string | null;
};

type BackendBudget = {
  _id: string;
  userId: string;
  categoryId: string | BackendPopulatedCategory;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  warningSent: boolean;
  spentAmount?: number;
};

function mapBackendCategoryToFE(c: BackendPopulatedCategory): Category {
  return {
    id: c._id,
    user_id: c.userId ?? undefined,
    name: c.name,
    type: c.type === 'INCOME' ? 'income' : 'expense',
    icon: c.icon,
    color: c.color,
    is_default: !!c.isDefault,
    created_at: undefined,
    updated_at: undefined,
  };
}

function toYyyyMm(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function isoDateToYyyyMmDd(dateIso: string): string {
  const d = new Date(dateIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mapBackendBudgetToFE(b: BackendBudget): Budget {
  const populatedCategory =
    typeof b.categoryId === 'object' && b.categoryId !== null && '_id' in b.categoryId
      ? (b.categoryId as BackendPopulatedCategory)
      : null;

  const category_id = populatedCategory ? populatedCategory._id : (b.categoryId as string);
  const startDateYmd = isoDateToYyyyMmDd(b.startDate);
  const endDateYmd = isoDateToYyyyMmDd(b.endDate);
  const month = toYyyyMm(new Date(b.startDate));

  return {
    id: b._id,
    user_id: b.userId,
    category_id,
    month,
    period: b.period,
    start_date: startDateYmd,
    end_date: endDateYmd,
    amount_limit: b.amount,
    spent_amount: b.spentAmount ?? 0,
    warning_sent: b.warningSent,
    categories: populatedCategory ? mapBackendCategoryToFE(populatedCategory) : undefined,
  };
}

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: async (): Promise<Budget[]> => {
      // FE page currently focuses on MONTHLY budgets
      const res: any = await api.get('/budgets', { params: { period: 'MONTHLY' } });
      const backendBudgets = (res?.data ?? res) as BackendBudget[];

      const mapped = backendBudgets.map(mapBackendBudgetToFE);

      // Optional month filtering on the FE side
      if (!month) return mapped;

      const monthStart = startOfMonth(new Date(`${month}-01T00:00:00.000Z`));
      const monthEnd = endOfMonth(new Date(`${month}-01T00:00:00.000Z`));

      return mapped.filter((b) => {
        const start = new Date(`${b.start_date}T00:00:00.000Z`);
        const end = new Date(`${b.end_date}T23:59:59.999Z`);
        // overlap check
        return start <= monthEnd && end >= monthStart;
      });
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert): Promise<Budget> => {
      const body = {
        categoryId: budget.category_id,
        amount: Number(budget.amount_limit),
        period: budget.period,
        startDate: toIsoDateForApi(budget.start_date),
        endDate: toIsoDateForApi(budget.end_date),
      };

      const res: any = await api.post('/budgets', body);
      const created = (res?.data ?? res) as BackendBudget;
      return mapBackendBudgetToFE(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Thành công',
        description: 'Ngân sách đã được thêm',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể thêm ngân sách',
      });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: BudgetUpdate;
    }): Promise<Budget> => {
      const payload: Record<string, unknown> = {};

      if (updates.category_id !== undefined) payload.categoryId = updates.category_id;
      if (updates.amount_limit !== undefined) payload.amount = Number(updates.amount_limit);
      if (updates.period !== undefined) payload.period = updates.period;
      if (updates.start_date !== undefined) payload.startDate = toIsoDateForApi(updates.start_date);
      if (updates.end_date !== undefined) payload.endDate = toIsoDateForApi(updates.end_date);

      const res: any = await api.put(`/budgets/${id}`, payload);
      const updated = (res?.data ?? res) as BackendBudget;
      return mapBackendBudgetToFE(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Thành công',
        description: 'Ngân sách đã được cập nhật',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật ngân sách',
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: 'Thành công',
        description: 'Ngân sách đã được xóa',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể xóa ngân sách',
      });
    },
  });
}

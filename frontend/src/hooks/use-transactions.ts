import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Transaction, TransactionInsert, TransactionUpdate } from '@/types';
import type { Category } from '@/types';

function getErrorMessage(error: unknown): string {
  const e = error as { message?: string; error?: string };
  return e?.message || e?.error || 'Có lỗi xảy ra';
}

type BackendTransaction = {
  _id: string;
  userId: string;
  categoryId:
    | string
    | {
        _id: string;
        name: string;
        icon: string;
        color: string;
        type: 'INCOME' | 'EXPENSE';
        isDefault?: boolean;
        userId?: string | null;
      };
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string | Date;
  note?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
};

function mapPopulatedCategory(c: Exclude<BackendTransaction['categoryId'], string>): Category {
  return {
    id: c._id,
    user_id: c.userId ?? undefined,
    name: c.name,
    type: c.type === 'INCOME' ? 'income' : 'expense',
    icon: c.icon,
    color: c.color,
    is_default: !!c.isDefault,
  };
}

export function mapBackendTransaction(t: BackendTransaction): Transaction {
  const cid = t.categoryId;
  const populated = typeof cid === 'object' && cid !== null && '_id' in cid;
  const category_id = populated ? (cid as { _id: string })._id : (cid as string);
  const dateStr =
    typeof t.date === 'string' ? t.date : new Date(t.date).toISOString();

  return {
    id: t._id,
    user_id: t.userId,
    category_id,
    amount: t.amount,
    type: t.type === 'INCOME' ? 'income' : 'expense',
    date: dateStr,
    note: t.note ?? '',
    image_url: t.image ?? '',
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    categories: populated ? mapPopulatedCategory(cid as any) : undefined,
  };
}

function feTypeToBe(type: 'income' | 'expense'): 'INCOME' | 'EXPENSE' {
  return type === 'income' ? 'INCOME' : 'EXPENSE';
}

/** Backend zod expects ISO datetime; date input yyyy-MM-dd → ISO */
export function toIsoDateForApi(dateInput: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return new Date(`${dateInput}T12:00:00.000Z`).toISOString();
  }
  return new Date(dateInput).toISOString();
}

function buildListQueryParams(filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  page?: number;
  limit?: number;
}) {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 500,
  };

  if (filters?.startDate) {
    const s = filters.startDate;
    params.startDate = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00.000Z` : s;
  }
  if (filters?.endDate) {
    const e = filters.endDate;
    params.endDate = /^\d{4}-\d{2}-\d{2}$/.test(e) ? `${e}T23:59:59.999Z` : e;
  }
  if (filters?.categoryId) params.categoryId = filters.categoryId;
  if (filters?.type) params.type = feTypeToBe(filters.type);

  return params;
}

export type TransactionsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TransactionsQueryData = {
  items: Transaction[];
  pagination: TransactionsPagination;
};

export function useTransactions(filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async (): Promise<TransactionsQueryData> => {
      const res: any = await api.get('/transactions', {
        params: buildListQueryParams(filters),
      });
      const rows = (res?.data ?? []) as BackendTransaction[];
      const pagination = (res?.pagination ?? {
        total: 0,
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 500,
        totalPages: 0,
      }) as TransactionsPagination;
      return {
        items: rows.map(mapBackendTransaction),
        pagination,
      };
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionInsert): Promise<Transaction> => {
      const body = {
        categoryId: transaction.category_id,
        amount: Number(transaction.amount),
        type: feTypeToBe(transaction.type),
        date: toIsoDateForApi(String(transaction.date)),
        note: transaction.note ?? '',
        image: transaction.image_url?.trim() || '',
      };
      const res: any = await api.post('/transactions', body);
      return mapBackendTransaction(res.data as BackendTransaction);
    },
    onSuccess: () => {
      // Transactions page phản ánh từ GET /transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false });
      // Budgets GET computes `spentAmount` from transactions, so must refetch budgets too.
      queryClient.invalidateQueries({ queryKey: ['budgets'], exact: false });
      // Dashboard & Reports lấy dữ liệu từ /reports/* (aggregate từ transactions)
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stats'], exact: false });
      toast({
        title: 'Thành công',
        description: 'Giao dịch đã được thêm',
      });
    },
    onError: (error: unknown) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TransactionUpdate;
    }): Promise<Transaction> => {
      const body: Record<string, unknown> = {};
      if (updates.category_id !== undefined) body.categoryId = updates.category_id;
      if (updates.amount !== undefined) body.amount = Number(updates.amount);
      if (updates.type !== undefined) body.type = feTypeToBe(updates.type);
      if (updates.date !== undefined) body.date = toIsoDateForApi(String(updates.date));
      if (updates.note !== undefined) body.note = updates.note ?? '';
      if (updates.image_url !== undefined) body.image = updates.image_url?.trim() || '';

      const res: any = await api.put(`/transactions/${id}`, body);
      return mapBackendTransaction(res.data as BackendTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false });
      // Budgets GET computes `spentAmount` from transactions, so must refetch budgets too.
      queryClient.invalidateQueries({ queryKey: ['budgets'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stats'], exact: false });
      toast({
        title: 'Thành công',
        description: 'Giao dịch đã được cập nhật',
      });
    },
    onError: (error: unknown) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false });
      // Budgets GET computes `spentAmount` from transactions, so must refetch budgets too.
      queryClient.invalidateQueries({ queryKey: ['budgets'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stats'], exact: false });
      toast({
        title: 'Thành công',
        description: 'Giao dịch đã được xóa',
      });
    },
    onError: (error: unknown) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: getErrorMessage(error),
      });
    },
  });
}

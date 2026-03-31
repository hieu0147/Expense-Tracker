import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Budget, BudgetInsert, BudgetUpdate } from '@/types';

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: async (): Promise<Budget[]> => {
      // TODO: Call backend API to fetch budgets
      return [];
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert): Promise<Budget> => {
      // TODO: Call backend API to create a budget
      return { id: Math.random().toString(), ...budget } as Budget;
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
      // TODO: Call backend API to update a budget
      return { id, ...updates } as Budget;
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
      // TODO: Call backend API to delete a budget
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

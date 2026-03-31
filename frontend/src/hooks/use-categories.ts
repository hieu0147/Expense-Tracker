import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Category, CategoryInsert, CategoryUpdate } from '@/types';

export function useCategories(type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async (): Promise<Category[]> => {
      // TODO: Call backend API to fetch categories
      return [
        { id: '1', name: 'Lương', type: 'income', icon: 'banknote', color: '#10b981', is_default: true },
        { id: '2', name: 'Ăn uống', type: 'expense', icon: 'utensils', color: '#ef4444', is_default: true },
        { id: '3', name: 'Đi lại', type: 'expense', icon: 'car', color: '#dc2626', is_default: true }
      ].filter(c => !type || c.type === type) as Category[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert): Promise<Category> => {
      // TODO: Call backend API to create a category
      return { id: Math.random().toString(), ...category } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Thành công',
        description: 'Hạng mục đã được thêm',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể thêm hạng mục',
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: CategoryUpdate;
    }): Promise<Category> => {
      // TODO: Call backend API to update a category
      return { id, ...updates } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Thành công',
        description: 'Hạng mục đã được cập nhật',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật hạng mục',
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Call backend API to delete a category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Thành công',
        description: 'Hạng mục đã được xóa',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể xóa hạng mục',
      });
    },
  });
}

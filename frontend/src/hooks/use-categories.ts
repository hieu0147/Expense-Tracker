import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Category, CategoryInsert, CategoryUpdate } from '@/types';
import { api } from '@/lib/api';

type BackendCategory = {
  _id: string;
  userId?: string | null;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function mapBackendCategory(c: BackendCategory): Category {
  return {
    id: c._id,
    user_id: c.userId || undefined,
    name: c.name,
    type: c.type === 'INCOME' ? 'income' : 'expense',
    icon: c.icon,
    color: c.color,
    is_default: c.isDefault,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function toBackendType(type: CategoryInsert['type']): BackendCategory['type'] {
  return type === 'income' ? 'INCOME' : 'EXPENSE';
}

export function useCategories(type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async (): Promise<Category[]> => {
      const res: any = await api.get('/categories');
      const items = (res?.data || res) as BackendCategory[];
      const mapped = (items || []).map(mapBackendCategory);
      return type ? mapped.filter((c) => c.type === type) : mapped;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert): Promise<Category> => {
      const res: any = await api.post('/categories', {
        name: category.name,
        type: toBackendType(category.type),
        icon: category.icon,
        color: category.color,
      });
      const created = (res?.data || res) as BackendCategory;
      return mapBackendCategory(created);
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
      const payload: any = { ...updates };
      if (payload.type) payload.type = toBackendType(payload.type);
      const res: any = await api.put(`/categories/${id}`, payload);
      const updated = (res?.data || res) as BackendCategory;
      return mapBackendCategory(updated);
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
      await api.delete(`/categories/${id}`);
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

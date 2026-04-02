import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Navigate } from 'react-router-dom';
import type { User, Category } from '@/types';
type BackendUser = {
  _id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'BANNED';
  avatar?: string;
};
type BackendCategory = {
  _id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
};
function mapUser(u: BackendUser): User {
  return {
    id: u._id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    avatar: u.avatar,
  };
}
function mapCategory(c: BackendCategory): Category {
  return {
    id: c._id,
    name: c.name,
    type: c.type === 'INCOME' ? 'income' : 'expense',
    icon: c.icon,
    color: c.color,
    is_default: c.isDefault,
  };
}
export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3b82f6');
  const canAccess = user?.role === 'ADMIN';
  if (!canAccess) return <Navigate to="/" replace />;
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res: any = await api.get('/users/admin');
      const rows = (res?.data ?? []) as BackendUser[];
      return rows.map(mapUser);
    },
  });
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res: any = await api.get('/categories/admin');
      const rows = (res?.data ?? []) as BackendCategory[];
      return rows.map(mapCategory);
    },
  });
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'PENDING' | 'ACTIVE' | 'BANNED' }) => {
      await api.put(`/users/admin/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'Thành công', description: 'Đã cập nhật trạng thái người dùng' });
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Lỗi', description: err?.message || 'Không thể cập nhật trạng thái' });
    },
  });
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/admin/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'Thành công', description: 'Đã xóa người dùng' });
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Lỗi', description: err?.message || 'Không thể xóa người dùng' });
    },
  });
  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      await api.post('/categories/admin', {
        name: categoryName.trim(),
        type: categoryType,
        icon: categoryIcon.trim(),
        color: categoryColor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Thành công', description: 'Đã thêm category hệ thống' });
      setCategoryName('');
      setCategoryIcon('');
      setCategoryColor('#3b82f6');
      setCategoryType('EXPENSE');
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Lỗi', description: err?.message || 'Không thể tạo category' });
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(`/categories/admin/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast({ title: 'Thành công', description: 'Đã xóa category hệ thống' });
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Lỗi', description: err?.message || 'Không thể xóa category' });
    },
  });
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Quản lý người dùng và categories hệ thống</p>
      </div>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="categories">Categories hệ thống</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-3">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground">Role: {u.role} - Status: {u.status}</p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={u.status ?? 'PENDING'}
                    onValueChange={(value: 'PENDING' | 'ACTIVE' | 'BANNED') =>
                      updateUserStatusMutation.mutate({ userId: u.id, status: value })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="BANNED">BANNED</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    onClick={() => deleteUserMutation.mutate(u.id)}
                    disabled={u.role === 'ADMIN'}
                  >
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thêm category hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tên</Label>
                  <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ví dụ: Ăn uống" />
                </div>
                <div className="space-y-2">
                  <Label>Loại</Label>
                  <Select value={categoryType} onValueChange={(v: 'INCOME' | 'EXPENSE') => setCategoryType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">INCOME</SelectItem>
                      <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Input value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)} placeholder="🍜" />
                </div>
                <div className="space-y-2">
                  <Label>Màu</Label>
                  <Input type="color" value={categoryColor} onChange={(e) => setCategoryColor(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => createCategoryMutation.mutate()}
                disabled={!categoryName.trim() || !categoryIcon.trim() || createCategoryMutation.isPending}
              >
                Thêm category
              </Button>
            </CardContent>
          </Card>
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${c.color}20` }}
                  >
                    <span style={{ color: c.color }}>{c.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.type.toUpperCase()}</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => deleteCategoryMutation.mutate(c.id)}>
                  Xóa
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
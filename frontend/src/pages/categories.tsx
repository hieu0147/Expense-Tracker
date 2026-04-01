import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/use-categories';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { data: incomeCategories = [] } = useCategories('income');
  const { data: expenseCategories = [] } = useCategories('expense');
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const resetForm = () => {
    setName('');
    setIcon('');
    setColor('#3b82f6');
    setEditing(null);
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateCategory.mutateAsync({
        id: editing.id,
        updates: {
          name: name.trim(),
          icon: icon.trim(),
          color,
        },
      });
      setOpen(false);
      resetForm();
      return;
    }

    await createCategory.mutateAsync({
      name: name.trim(),
      icon: icon.trim(),
      color,
      type: activeTab,
      is_default: false,
    } as any);
    setOpen(false);
    resetForm();
  };

  const openEdit = (category: Category) => {
    if (category.is_default) return;
    setEditing(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
    setOpen(true);
  };

  const openDelete = (category: Category) => {
    if (category.is_default) return;
    setDeleteTarget(category);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hạng mục</h1>
          <p className="text-muted-foreground">
            Quản lý hạng mục thu nhập và chi tiêu
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm hạng mục
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Sửa hạng mục' : 'Thêm hạng mục'}</DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Cập nhật thông tin hạng mục.'
                  : `Tạo hạng mục ${activeTab === 'expense' ? 'chi tiêu' : 'thu nhập'} mới.`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Tên hạng mục</Label>
                <Input
                  id="catName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={activeTab === 'expense' ? 'Ví dụ: Ăn uống' : 'Ví dụ: Lương'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catIcon">Icon</Label>
                <Input
                  id="catIcon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Ví dụ: 🍜"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catColor">Màu</Label>
                <Input
                  id="catColor"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 p-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  createCategory.isPending ||
                  updateCategory.isPending ||
                  !name.trim() ||
                  !icon.trim()
                }
              >
                {editing
                  ? updateCategory.isPending
                    ? 'Đang cập nhật...'
                    : 'Cập nhật'
                  : createCategory.isPending
                    ? 'Đang thêm...'
                    : 'Thêm'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa hạng mục</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa hạng mục{' '}
                <span className="font-semibold text-foreground">
                  {deleteTarget?.name}
                </span>
                ? Thao tác này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteCategory.isPending}
                onClick={onConfirmDelete}
              >
                {deleteCategory.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="expense"
        className="space-y-4"
        onValueChange={(v) => setActiveTab(v as 'expense' | 'income')}
      >
        <TabsList>
          <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
          <TabsTrigger value="income">Thu nhập</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <span style={{ color: category.color }}>
                        {category.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.is_default ? 'Mặc định' : 'Tùy chỉnh'}
                      </p>
                    </div>
                    </div>

                    {!category.is_default && (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(category)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(category)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <span style={{ color: category.color }}>
                        {category.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.is_default ? 'Mặc định' : 'Tùy chỉnh'}
                      </p>
                    </div>
                    </div>

                    {!category.is_default && (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(category)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(category)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

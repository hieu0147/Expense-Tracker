import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBudgets } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';
import { useCreateBudget, useDeleteBudget, useUpdateBudget } from '@/hooks/use-budgets';
import { formatCurrency } from '@/lib/utils';
import type { Budget } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function BudgetsPage() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStartDate = startOfMonth(new Date(`${currentMonth}-01T00:00:00.000Z`));
  const monthEndDate = endOfMonth(monthStartDate);
  const monthStart = format(monthStartDate, 'yyyy-MM-dd');
  const monthEnd = format(monthEndDate, 'yyyy-MM-dd');

  const { data: budgets = [] } = useBudgets(currentMonth);
  const { data: expenseCategories = [] } = useCategories('expense');

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const [categoryId, setCategoryId] = useState('');
  const [amountLimit, setAmountLimit] = useState<string>('');
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(monthEnd);

  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

  useEffect(() => {
    if (!dialogOpen) return;

    if (editing) {
      setCategoryId(editing.category_id);
      setAmountLimit(String(editing.amount_limit ?? ''));
      setStartDate(editing.start_date);
      setEndDate(editing.end_date);
      return;
    }

    setCategoryId('');
    setAmountLimit('');
    setStartDate(monthStart);
    setEndDate(monthEnd);
  }, [dialogOpen, editing, monthStart]);

  const budgetWithSpending = useMemo(() => {
    return budgets.map((budget) => {
      const spent = Number(budget.spent_amount ?? 0);
      const limit = Number(budget.amount_limit);
      const rawPercentage = limit > 0 ? (spent / limit) * 100 : 0;
      const percentage = Math.min(rawPercentage, 100);
      const cat = budget.categories as any;

      return {
        ...budget,
        categoryName: cat?.name ?? 'Hạng mục',
        categoryColor: cat?.color ?? '#888',
        spent,
        limit,
        percentage,
        rawPercentage,
        isOverBudget: rawPercentage > 100,
      };
    });
  }, [budgets]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    setDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    const amount = Number(amountLimit);
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (!startDate || !endDate) return;

    const payload = {
      category_id: categoryId,
      period: 'MONTHLY' as const,
      amount_limit: amount,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      if (editing) {
        await updateBudget.mutateAsync({
          id: editing.id,
          updates: payload,
        });
      } else {
        await createBudget.mutateAsync(payload as any);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      // handled by mutation onError toast
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteBudget.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ngân sách</h1>
            <p className="text-muted-foreground">
              Theo dõi và quản lý ngân sách tháng {format(new Date(), 'MM/yyyy')}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm ngân sách
          </Button>
        </div>
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
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="truncate">{budget.categoryName}</span>
                  <span
                    className={`text-lg ${
                      budget.isOverBudget ? 'text-expense' : 'text-foreground'
                    }`}
                  >
                    {budget.rawPercentage.toFixed(0)}%
                  </span>
                </CardTitle>

                <div className="flex gap-1 mt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(budget)}
                    aria-label="Sửa ngân sách"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(budget)}
                    aria-label="Xóa ngân sách"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
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
                    Hạn mức: {formatCurrency(budget.limit)}
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

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa ngân sách' : 'Thêm ngân sách'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Cập nhật hạn mức và khoảng thời gian cho ngân sách của bạn.'
                : 'Thiết lập ngân sách cho danh mục chi tiêu.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Danh mục (chi tiêu)</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountLimit">Hạn mức</Label>
              <Input
                id="amountLimit"
                type="number"
                step="0.01"
                min={0}
                placeholder="Ví dụ: 5000000"
                value={amountLimit}
                onChange={(e) => setAmountLimit(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  createBudget.isPending ||
                  updateBudget.isPending ||
                  !categoryId ||
                  Number(amountLimit) <= 0 ||
                  !startDate ||
                  !endDate
                }
              >
                {editing ? 'Lưu thay đổi' : 'Tạo ngân sách'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa ngân sách</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa ngân sách cho danh mục{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.categories?.name ?? deleteTarget?.category_id}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBudget.isPending}
              onClick={onConfirmDelete}
            >
              {deleteBudget.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { format, endOfMonth } from 'date-fns';
import { Plus, Search, Filter, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { useTransactions, useDeleteTransaction } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TransactionDialog } from '@/components/transaction-dialog';
import type { Transaction } from '@/types';

const PAGE_SIZE = 5;

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStart = format(new Date(currentMonth + '-01'), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date(currentMonth + '-01')), 'yyyy-MM-dd');

  const hasSearch = search.trim().length > 0;

  const { data, isLoading } = useTransactions({
    startDate: monthStart,
    endDate: monthEnd,
    page: hasSearch ? 1 : page,
    limit: hasSearch ? 500 : PAGE_SIZE,
    type: typeFilter === 'all' ? undefined : typeFilter,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
  });

  const transactions = data?.items ?? [];
  const pagination = data?.pagination;

  const { data: categories = [] } = useCategories();
  const deleteTransaction = useDeleteTransaction();

  useEffect(() => {
    setPage(1);
  }, [monthStart, monthEnd, typeFilter, categoryFilter, search]);

  const filteredTransactions = useMemo(() => {
    if (!hasSearch) return transactions;
    const q = search.toLowerCase().trim();
    return transactions.filter((transaction) => {
      const cat = transaction.categories as { name?: string } | undefined;
      return (
        (cat?.name || '').toLowerCase().includes(q) ||
        transaction.note?.toLowerCase().includes(q)
      );
    });
  }, [transactions, hasSearch, search]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const openDelete = (transaction: Transaction) => {
    setDeleteTarget(transaction);
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTransaction.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  const showPagination = !hasSearch && pagination && pagination.totalPages > 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giao dịch</h1>
          <p className="text-muted-foreground">
            Quản lý thu nhập và chi tiêu của bạn
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm giao dịch
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value: 'all' | 'income' | 'expense') => setTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="income">Thu nhập</SelectItem>
                <SelectItem value="expense">Chi tiêu</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Hạng mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hạng mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa giao dịch</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa giao dịch
              {deleteTarget && (
                <>
                  {' '}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(Number(deleteTarget.amount))}
                  </span>{' '}
                  — {formatDate(deleteTarget.date)}
                </>
              )}
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
              disabled={deleteTransaction.isPending}
              onClick={onConfirmDelete}
            >
              {deleteTransaction.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Không tìm thấy giao dịch nào
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const cat = transaction.categories as { name?: string; icon?: string; color?: string } | undefined;
              return (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${cat?.color ?? '#888'}20` }}
                        >
                          <span style={{ color: cat?.color ?? '#888' }}>{cat?.icon ?? '—'}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{cat?.name ?? 'Hạng mục'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </p>
                          {transaction.note && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`text-xl font-bold ${
                            transaction.type === 'income'
                              ? 'text-income'
                              : 'text-expense'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(transaction.amount))}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {showPagination && pagination && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages} — Tổng {pagination.total} giao dịch
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TransactionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        transaction={editingTransaction}
      />
    </div>
  );
}

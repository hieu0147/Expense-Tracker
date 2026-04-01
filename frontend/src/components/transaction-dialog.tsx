import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCategories } from '@/hooks/use-categories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useAuth } from '@/contexts/auth-context';

const transactionSchema = z.object({
  amount: z.string().min(1, 'Vui lòng nhập số tiền'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().min(1, 'Vui lòng chọn hạng mục'),
  date: z.string(),
  note: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transaction?: any;
}

export function TransactionDialog({
  open,
  onClose,
  transaction,
}: TransactionDialogProps) {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const selectedType = watch('type');

  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType
  );

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      const dateInput = transaction.date
        ? format(new Date(transaction.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd');
      reset({
        amount: transaction.amount.toString(),
        type: transaction.type,
        category_id: transaction.category_id,
        date: dateInput,
        note: transaction.note || '',
      });
    } else {
      reset({
        type: 'expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        category_id: '',
        note: '',
      });
    }
  }, [open, transaction?.id, reset]);

  const onSubmit = async (data: TransactionForm) => {
    if (!user) return;

    try {
      if (transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          updates: {
            amount: parseFloat(data.amount),
            type: data.type,
            category_id: data.category_id,
            date: data.date,
            note: data.note ?? '',
          },
        });
      } else {
        await createTransaction.mutateAsync({
          user_id: user.id,
          amount: parseFloat(data.amount),
          type: data.type,
          category_id: data.category_id,
          date: data.date,
          note: data.note || '',
        });
      }
      onClose();
    } catch (error) {
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Cập nhật thông tin giao dịch'
              : 'Nhập thông tin giao dịch của bạn'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Loại giao dịch</Label>
            <Select
              value={watch('type')}
              onValueChange={(value: 'income' | 'expense') => {
                setValue('type', value);
                setValue('category_id', '');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Thu nhập</SelectItem>
                <SelectItem value="expense">Chi tiêu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Hạng mục</Label>
            <Select
              value={watch('category_id')}
              onValueChange={(value) => setValue('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hạng mục" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Ngày</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Input
              id="note"
              placeholder="Thêm ghi chú..."
              {...register('note')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                createTransaction.isPending || updateTransaction.isPending
              }
            >
              {transaction ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

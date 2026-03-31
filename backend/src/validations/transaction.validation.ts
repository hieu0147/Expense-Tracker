import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category ID là bắt buộc'),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    type: z.enum(['INCOME', 'EXPENSE'], { message: 'Loại giao dịch phải là INCOME hoặc EXPENSE' }),
    date: z.string().datetime({ message: 'Ngày tháng không hợp lệ (cần chuẩn ISO 8601)' }).or(z.date()),
    note: z.string().optional(),
    image: z.string().url('Đường dẫn ảnh không hợp lệ').optional().or(z.literal('')),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category ID không được để trống').optional(),
    amount: z.number().positive('Số tiền phải lớn hơn 0').optional(),
    type: z.enum(['INCOME', 'EXPENSE'], { message: 'Loại giao dịch phải là INCOME hoặc EXPENSE' }).optional(),
    date: z.string().datetime({ message: 'Ngày tháng không hợp lệ' }).or(z.date()).optional(),
    note: z.string().optional(),
    image: z.string().url('Đường dẫn ảnh không hợp lệ').optional().or(z.literal('')),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'Cần ít nhất một trường để cập nhật',
  }),
});

import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category ID là bắt buộc'),
    amount: z.number().positive('Số tiền ngân sách phải lớn hơn 0'),
    period: z.enum(['MONTHLY', 'YEARLY'], { message: 'Chu kỳ phải là MONTHLY hoặc YEARLY' }),
    startDate: z.string().datetime({ message: 'Ngày bắt đầu không hợp lệ' }),
    endDate: z.string().datetime({ message: 'Ngày kết thúc không hợp lệ' })
  }).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
    path: ['endDate']
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().optional(),
    amount: z.number().positive('Số tiền ngân sách phải lớn hơn 0').optional(),
    period: z.enum(['MONTHLY', 'YEARLY']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
    path: ['endDate']
  }),
});

import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên danh mục không được để trống'),
    type: z.enum(['INCOME', 'EXPENSE'], { message: 'Loại danh mục phải là INCOME hoặc EXPENSE' }),
    icon: z.string().min(1, 'Vui lòng chọn icon'),
    color: z.string().min(1, 'Vui lòng chọn màu'),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên danh mục không được để trống').optional(),
    type: z.enum(['INCOME', 'EXPENSE'], { message: 'Loại danh mục phải là INCOME hoặc EXPENSE' }).optional(),
    icon: z.string().min(1, 'Vui lòng chọn icon').optional(),
    color: z.string().min(1, 'Vui lòng chọn màu').optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'Cần ít nhất một trường để cập nhật',
  }),
});

import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const adminUpdateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'BANNED']),
  }),
});

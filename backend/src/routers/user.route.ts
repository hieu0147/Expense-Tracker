import { Router } from 'express';
import { getMe, updateMe, changePassword, getUsersForAdmin, updateUserStatusForAdmin, deleteUserForAdmin } from '../controllers/user.controller';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema, changePasswordSchema, adminUpdateUserStatusSchema } from '../validations/user.validation';

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

router.get('/me', getMe);
router.put('/me', validate(updateProfileSchema), updateMe);
router.put('/password', validate(changePasswordSchema), changePassword);

// Admin routes
router.get('/admin', authorizeAdmin, getUsersForAdmin);
router.put('/admin/:id/status', authorizeAdmin, validate(adminUpdateUserStatusSchema), updateUserStatusForAdmin);
router.delete('/admin/:id', authorizeAdmin, deleteUserForAdmin);

export default router;

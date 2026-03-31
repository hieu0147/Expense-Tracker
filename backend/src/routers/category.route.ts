import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../controllers/category.controller';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

// Admin Routes (for system-default categories where userId is null)
router.post('/admin', authorizeAdmin, validate(createCategorySchema), createAdminCategory);
router.put('/admin/:id', authorizeAdmin, validate(updateCategorySchema), updateAdminCategory);
router.delete('/admin/:id', authorizeAdmin, deleteAdminCategory);

export default router;

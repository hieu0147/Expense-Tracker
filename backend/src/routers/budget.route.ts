import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budget.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createBudgetSchema, updateBudgetSchema } from '../validations/budget.validation';

const router = Router();
router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', validate(createBudgetSchema), createBudget);
router.put('/:id', validate(updateBudgetSchema), updateBudget);
router.delete('/:id', deleteBudget);

export default router;

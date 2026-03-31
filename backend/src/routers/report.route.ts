import { Router } from 'express';
import { getDashboardSummary, getExpenseByCategory, getIncomeVsExpense } from '../controllers/report.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/dashboard', getDashboardSummary);
router.get('/expense-by-category', getExpenseByCategory);
router.get('/income-vs-expense', getIncomeVsExpense);

export default router;

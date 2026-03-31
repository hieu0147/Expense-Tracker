import mongoose from 'mongoose';
import { Budget } from '../models/budget.model';
import { Transaction } from '../models/transaction.model';
import { User } from '../models/user.model';
import { sendBudgetWarningMail } from './mailer.util';

export const triggerBudgetCheck = async (userId: string | mongoose.Types.ObjectId, categoryId: string | mongoose.Types.ObjectId, transactionDate: Date) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId.toString());
    const categoryObjId = new mongoose.Types.ObjectId(categoryId.toString());

    // Tìm các ngân sách khả dụng của category này bao trùm ngày giao dịch
    const budgets = await Budget.find({
      userId: userObjId,
      categoryId: categoryObjId,
      startDate: { $lte: transactionDate },
      endDate: { $gte: transactionDate }
    }).populate('categoryId', 'name');

    for (const budget of budgets) {
      const spentAgg = await Transaction.aggregate([
        { 
          $match: { 
            userId: userObjId, 
            categoryId: categoryObjId,
            type: 'EXPENSE',
            date: { $gte: budget.startDate, $lte: budget.endDate }
          }
        },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
      ]);

      const spentAmount = spentAgg.length > 0 ? spentAgg[0].totalSpent : 0;

      // Cảnh báo nếu vượt quá
      if (spentAmount > budget.amount && !budget.warningSent) {
        const user = await User.findById(userId);
        if (user && user.email) {
          await sendBudgetWarningMail(user.email, user.name, (budget.categoryId as any).name, spentAmount, budget.amount).catch(console.error);
        }
        // Đánh dấu là đã báo
        budget.warningSent = true;
        await budget.save();
      } else if (spentAmount <= budget.amount && budget.warningSent) {
        // Reset lại nếu quay về dưới ngân sách
        budget.warningSent = false;
        await budget.save();
      }
    }
  } catch (error) {
    console.error('Lỗi khi check budget alert:', error);
  }
};

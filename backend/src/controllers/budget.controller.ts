import { Response, NextFunction } from 'express';
import { Budget } from '../models/budget.model';
import { Category } from '../models/category.model';
import { Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import { triggerBudgetCheck } from '../utils/budget.util';

export const getBudgets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { period } = req.query;

    const query: any = { userId };
    if (period) {
      query.period = period;
    }

    const budgets = await Budget.find(query).populate('categoryId', 'name icon color type').lean();

    // Tính toán tiến độ chi tiêu cho mỗi ngân sách
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const categoryId = (budget.categoryId as any)._id; // lean returns plain object, populated categoryId is an object
        
        const spentAgg = await Transaction.aggregate([
          { 
            $match: { 
              userId: new mongoose.Types.ObjectId(userId!), 
              categoryId: new mongoose.Types.ObjectId(categoryId),
              type: 'EXPENSE',
              date: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) }
            }
          },
          { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
        ]);

        const spentAmount = spentAgg.length > 0 ? spentAgg[0].totalSpent : 0;

        return {
          ...budget,
          spentAmount
        };
      })
    );

    res.status(200).json({ success: true, data: budgetsWithSpent });
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { categoryId, amount, period, startDate, endDate } = req.body;

    // Verify category exists and matches
    const category = await Category.findById(categoryId);
    if (!category || (!category.isDefault && category.userId?.toString() !== userId)) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }
    
    // Check if category is expense
    if (category.type !== 'EXPENSE') {
      return res.status(400).json({ success: false, message: 'Ngân sách chỉ có thể áp dụng cho danh mục loại chi tiêu (EXPENSE)' });
    }

    // Avoid duplicate current budget for same category and time overlap
    const existingBudget = await Budget.findOne({
      userId,
      categoryId,
      period,
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    });

    if (existingBudget) {
      return res.status(400).json({ success: false, message: 'Đã có ngân sách cho danh mục này bị lồng chéo trong khoảng thời gian trên.' });
    }

    const newBudget = await Budget.create({
      userId, categoryId, amount, period, startDate, endDate
    });

    res.status(201).json({ success: true, message: 'Tạo ngân sách thành công', data: newBudget });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    const budget = await Budget.findById(id);
    if (!budget || budget.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngân sách' });
    }

    if (updates.categoryId) {
      const category = await Category.findById(updates.categoryId);
      if (!category || (!category.isDefault && category.userId?.toString() !== userId)) {
        return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
      }
      if (category.type !== 'EXPENSE') {
        return res.status(400).json({ success: false, message: 'Ngân sách chỉ có thể áp dụng cho danh mục chi tiêu' });
      }
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Cập nhật ngân sách thành công', data: updatedBudget });

    triggerBudgetCheck(userId!, updatedBudget!.categoryId, updatedBudget!.startDate);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const budget = await Budget.findById(id);
    if (!budget || budget.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngân sách' });
    }

    await Budget.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Xóa ngân sách thành công' });
  } catch (error) {
    next(error);
  }
};

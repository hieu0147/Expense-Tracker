import { Response, NextFunction } from 'express';
import { Transaction } from '../models/transaction.model';
import { Category } from '../models/category.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, startDate, endDate, type, categoryId } = req.query;

    const query: any = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    if (type) {
      query.type = type;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('categoryId', 'name icon color type') // Include category info
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      },
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { categoryId, amount, type, date, note, image } = req.body;

    // Verify category exists and matches the transaction type
    const category = await Category.findById(categoryId);
    if (!category || (!category.isDefault && category.userId?.toString() !== userId)) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    if (category.type !== type) {
      return res.status(400).json({ success: false, message: `Danh mục này thuộc loại ${category.type}, không khớp với loại giao dịch ${type}` });
    }

    const newTransaction = await Transaction.create({
      userId, categoryId, amount, type, date, note, image
    });

    res.status(201).json({ success: true, message: 'Tạo giao dịch thành công', data: newTransaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    // If changing category or type, verify logic again
    if (updates.categoryId || updates.type) {
      const targetCategoryId = updates.categoryId || transaction.categoryId;
      const targetType = updates.type || transaction.type;

      const category = await Category.findById(targetCategoryId);
      if (!category || (!category.isDefault && category.userId?.toString() !== userId)) {
        return res.status(404).json({ success: false, message: 'Danh mục thay đổi không tồn tại hoặc không thuộc quyền truy cập của bạn' });
      }

      if (category.type !== targetType) {
        return res.status(400).json({ success: false, message: `Danh mục này thuộc loại ${category.type}, không khớp với loại giao dịch ${targetType}` });
      }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Cập nhật giao dịch thành công', data: updatedTransaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.userId.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Xóa giao dịch thành công' });
  } catch (error) {
    next(error);
  }
};

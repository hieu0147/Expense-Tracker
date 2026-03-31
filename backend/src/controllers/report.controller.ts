import { Response, NextFunction } from 'express';
import { Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

export const getDashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const now = new Date();
    
    let { startDate, endDate } = req.query;
    
    // Default to current month if not provided
    const start = startDate ? new Date(startDate as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Tính tổng thu/chi trong kỳ
    const periodStats = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    periodStats.forEach((stat) => {
      if (stat._id === 'INCOME') totalIncome = stat.total;
      if (stat._id === 'EXPENSE') totalExpense = stat.total;
    });

    // Tính số dư tổng (all time)
    const allTimeStats = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let allTimeIncome = 0;
    let allTimeExpense = 0;

    allTimeStats.forEach((stat) => {
      if (stat._id === 'INCOME') allTimeIncome = stat.total;
      if (stat._id === 'EXPENSE') allTimeExpense = stat.total;
    });

    const currentBalance = allTimeIncome - allTimeExpense;
    
    // Giao dịch 5 cái gần nhất
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate('categoryId', 'name icon color type');

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        currentBalance,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseByCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const now = new Date();
    
    let { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'EXPENSE',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          categoryColor: '$category.color',
          totalAmount: 1
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.status(200).json({ success: true, data: expensesByCategory });
  } catch (error) {
    next(error);
  }
};

export const getIncomeVsExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const now = new Date();
    
    let { startDate, endDate, groupBy = 'month' } = req.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      if (groupBy === 'day') {
        // default 30 days
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      } else {
        // default 6 months
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }
    }

    const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';

    const chartData = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$date' } },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          income: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'INCOME'] }, '$total', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$_id.type', 'EXPENSE'] }, '$total', 0] }
          }
        }
      },
      {
        $sort: { _id: 1 } 
      },
      {
        $project: {
          date: '$_id',
          income: 1,
          expense: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { Category } from '../models/category.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    // Get default categories (isDefault: true) OR user's custom categories
    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId }]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { name, type, icon, color } = req.body;

    // Check for duplicates
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type,
      $or: [{ isDefault: true }, { userId }]
    });

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Danh mục với tên và loại này đã tồn tại.' });
    }

    const newCategory = await Category.create({ userId, name, type, icon, color });

    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: newCategory });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    if (!category.userId || category.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền sửa danh mục này' });
    }

    // Check for duplicates if name or type is changed
    if (req.body.name || req.body.type) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${req.body.name || category.name}$`, 'i') },
        type: req.body.type || category.type,
        $or: [{ isDefault: true }, { userId }]
      });

      if (existingCategory && existingCategory._id.toString() !== id) {
        return res.status(400).json({ success: false, message: 'Tên danh mục và loại này đã tồn tại.' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    if (!category.userId || category.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa danh mục này (hoặc đây là danh mục mặc định)' });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    next(error);
  }
};

export const createAdminCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { name, type, icon, color } = req.body;

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type,
      isDefault: true
    });

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Danh mục hệ thống với tên này đã tồn tại.' });
    }

    const newCategory = await Category.create({ userId, name, type, icon, color, isDefault: true });
    res.status(201).json({ success: true, message: 'Tạo danh mục hệ thống thành công', data: newCategory });
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({ isDefault: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const updateAdminCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    if (!category.isDefault) {
      return res.status(400).json({ success: false, message: 'Danh mục này không phải là danh mục mặc định của hệ thống.' });
    }

    if (name || type) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name || category.name}$`, 'i') },
        type: type || category.type,
        isDefault: true
      });

      if (existingCategory && existingCategory._id.toString() !== id) {
        return res.status(400).json({ success: false, message: 'Danh mục hệ thống với tên này đã tồn tại.' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: { name, type, icon, color } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Cập nhật danh mục hệ thống thành công', data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    if (!category.isDefault) {
      return res.status(400).json({ success: false, message: 'Chỉ được xóa danh mục mặc định của hệ thống qua route này.' });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Xóa danh mục hệ thống thành công' });
  } catch (error) {
    next(error);
  }
};

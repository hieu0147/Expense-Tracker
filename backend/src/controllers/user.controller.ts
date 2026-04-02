import { Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.userId,
      { $set: { name, avatar } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersForAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}, '-password').sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusForAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'PENDING' | 'ACTIVE' | 'BANNED' };

    if (req.user?.userId === id) {
      return res.status(400).json({ success: false, message: 'Không thể thay đổi trạng thái chính tài khoản admin hiện tại.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái người dùng thành công',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserForAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ success: false, message: 'Không thể xóa chính tài khoản admin hiện tại.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    next(error);
  }
};

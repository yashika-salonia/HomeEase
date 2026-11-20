import type { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { WorkerProfile } from '../models/WorkerProfile';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export async function getUserProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const workerProfile =
      user.role === 'worker'
        ? await WorkerProfile.findOne({ userId: user._id })
        : null;

    res.status(200).json({
      success: true,
      user: {
        id: String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      workerProfile,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, phone, location, profileImage } = req.body || {};
    const errors: string[] = [];

    if (!name || String(name).trim().length < 2) {
      errors.push('Full name must be at least 2 characters.');
    }
    const phoneDigits = String(phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.push('Please provide a valid phone number (10–15 digits).');
    }
    if (!location || String(location).trim().length < 2) {
      errors.push('Location is required.');
    }

    if (errors.length > 0) {
      throw new AppError(errors[0], 400, errors);
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    user.name = String(name).trim();
    user.phone = String(phone).trim();
    user.location = String(location).trim();
    if (typeof profileImage === 'string') {
      user.profileImage = profileImage.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully.',
      user: {
        id: String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      throw new AppError('Both current password and new password are required.', 400);
    }

    if (String(newPassword).length < 6) {
      throw new AppError('New password must be at least 6 characters long.', 400);
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    const isMatch = await user.comparePassword(String(currentPassword));
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    user.password = String(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { WorkerProfile } from '../models/WorkerProfile.ts';
import { signToken } from '../utils/jwt.ts';
import { validateRegistrationInput } from '../utils/bookingRules.ts';
import { AppError } from '../middleware/errorHandler.ts';
import type { AuthRequest } from '../middleware/auth.ts';

function sanitizeUser(user: {
  _id: unknown;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  profileImage: string;
  createdAt: Date;
}) {
  return {
    id: String(user._id),
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  };
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, phone, password, location, role } = req.body || {};

    const errors = validateRegistrationInput({
      name,
      email,
      phone,
      password,
      location,
      role,
    });
    if (errors.length > 0) {
      throw new AppError(errors[0], 400, errors);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: String(password),
      location: String(location).trim(),
      role,
    });

    const token = signToken({ userId: String(user._id), role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: sanitizeUser(user),
      hasWorkerProfile: false,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new AppError('Email and password are required.', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const workerProfile =
      user.role === 'worker' ? await WorkerProfile.findOne({ userId: user._id }) : null;

    const token = signToken({ userId: String(user._id), role: user.role });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
      hasWorkerProfile: Boolean(workerProfile),
      workerProfile,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const workerProfile =
      req.user.role === 'worker'
        ? await WorkerProfile.findOne({ userId: req.user._id })
        : null;

    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
      hasWorkerProfile: Boolean(workerProfile),
      workerProfile,
    });
  } catch (err) {
    next(err);
  }
}

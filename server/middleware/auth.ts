import type { Request, Response, NextFunction } from 'express';
import { User, type IUser } from '../models/User.ts';
import { verifyToken } from '../utils/jwt.ts';
import { AppError } from './errorHandler.ts';
import type { UserRole } from '../utils/bookingRules.ts';

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Verifies JWT Bearer token and attaches the database User document to req.user.
 * Never trusts user IDs or roles supplied in request bodies.
 */
export async function protect(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please log in to continue.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token missing.', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User account no longer exists. Please register or log in again.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforces role-based authorization on backend API routes.
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. This action is restricted to ${roles.join(' or ')} accounts.`,
          403
        )
      );
      return;
    }
    next();
  };
}

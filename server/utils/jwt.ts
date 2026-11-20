import jwt from 'jsonwebtoken';
import type { UserRole } from './bookingRules';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'homeease_dev_secret_change_in_production_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

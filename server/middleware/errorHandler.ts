import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(message: string, statusCode = 400, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  const error = err as {
    name?: string;
    code?: number;
    message?: string;
    keyValue?: Record<string, unknown>;
    errors?: Record<string, { message: string }>;
  };

  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    const friendly =
      field === 'email'
        ? 'An account with this email address already exists.'
        : field === 'bookingId'
        ? 'A review for this booking has already been submitted.'
        : `Duplicate value for ${field}.`;
    res.status(409).json({ success: false, message: friendly });
    return;
  }

  if (error?.name === 'ValidationError' && error.errors) {
    const messages = Object.values(error.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: messages[0] || 'Validation error.',
      errors: messages,
    });
    return;
  }

  if (error?.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource identifier provided.',
    });
    return;
  }

  if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Your session has expired or is invalid. Please log in again.',
    });
    return;
  }

  console.error('[HomeEase Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again.',
  });
}

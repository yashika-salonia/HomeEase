import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { WorkerProfile } from '../models/WorkerProfile';
import { computeAverageRating } from '../utils/bookingRules';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export async function createReview(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookingId, rating, comment } = req.body || {};

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new AppError('Valid booking reference is required.', 400);
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new AppError('Rating must be a whole number between 1 and 5.', 400);
    }

    const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
    if (trimmedComment.length < 5) {
      throw new AppError('Please write a review comment of at least 5 characters.', 400);
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    if (String(booking.customerId) !== String(req.user!._id)) {
      throw new AppError('You can only review your own bookings.', 403);
    }

    if (booking.status !== 'Completed') {
      throw new AppError('Only completed bookings can be reviewed.', 400);
    }

    const existing = await Review.findOne({ bookingId: booking._id });
    if (existing) {
      throw new AppError('You have already submitted a review for this booking.', 409);
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: req.user!._id,
      workerId: booking.workerId,
      workerProfileId: booking.workerProfileId,
      rating: numericRating,
      comment: trimmedComment,
    });

    booking.reviewed = true;
    await booking.save();

    // Recalculate worker's average rating and total reviews
    const allWorkerReviews = await Review.find({
      workerProfileId: booking.workerProfileId,
    }).select('rating');

    const { averageRating, totalReviews } = computeAverageRating(
      allWorkerReviews.map((r) => r.rating)
    );

    await WorkerProfile.findByIdAndUpdate(booking.workerProfileId, {
      averageRating,
      totalReviews,
    });

    const populated = await Review.findById(review._id)
      .populate('customerId', 'name location profileImage')
      .populate('workerId', 'name location profileImage')
      .populate('bookingId', 'bookingId serviceCategory serviceDate');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: populated,
      workerStats: { averageRating, totalReviews },
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkerReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { workerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      throw new AppError('Invalid worker ID.', 400);
    }

    const reviews = await Review.find({
      $or: [{ workerProfileId: workerId }, { workerId }],
    })
      .populate('customerId', 'name location profileImage')
      .populate('bookingId', 'bookingId serviceCategory serviceDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyReviews(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter =
      req.user!.role === 'customer'
        ? { customerId: req.user!._id }
        : { workerId: req.user!._id };

    const reviews = await Review.find(filter)
      .populate('customerId', 'name location profileImage')
      .populate('workerId', 'name location profileImage')
      .populate('bookingId', 'bookingId serviceCategory serviceDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
}

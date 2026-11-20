import type { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { WorkerProfile } from '../models/WorkerProfile';
import {
  calculateQuotedPrice,
  canTransitionBookingStatus,
  generateBookingCode,
  validateBookingInput,
  type BookingStatus,
} from '../utils/bookingRules';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export async function createBooking(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { workerId, serviceCategory, serviceDate, preferredTime, address, instructions } =
      req.body || {};

    const errors = validateBookingInput({
      workerId,
      serviceCategory,
      serviceDate,
      preferredTime,
      address,
    });
    if (errors.length > 0) {
      throw new AppError(errors[0], 400, errors);
    }

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      throw new AppError('Invalid worker selected.', 400);
    }

    // Look up by WorkerProfile._id or by Worker User._id
    let workerProfile = await WorkerProfile.findById(workerId);
    if (!workerProfile) {
      workerProfile = await WorkerProfile.findOne({ userId: workerId });
    }

    if (!workerProfile) {
      throw new AppError('Selected worker profile does not exist.', 404);
    }

    if (!workerProfile.availability) {
      throw new AppError(
        'This worker is currently unavailable for new bookings. Please choose another provider.',
        400
      );
    }

    if (!workerProfile.serviceCategories.includes(serviceCategory)) {
      throw new AppError(
        `This worker does not offer "${serviceCategory}". Available services: ${workerProfile.serviceCategories.join(', ')}.`,
        400
      );
    }

    if (String(workerProfile.userId) === String(req.user!._id)) {
      throw new AppError('You cannot book your own service.', 400);
    }

    // Prevent duplicate booking submissions for same customer, worker, date & time slot
    const duplicate = await Booking.findOne({
      customerId: req.user!._id,
      workerId: workerProfile.userId,
      serviceDate: String(serviceDate).trim(),
      preferredTime: String(preferredTime).trim(),
      status: { $in: ['Pending', 'Accepted'] },
    });

    if (duplicate) {
      throw new AppError(
        `You already have an active booking (${duplicate.bookingId}) with this worker for ${serviceDate} at ${preferredTime}.`,
        409
      );
    }

    const quotedPrice = calculateQuotedPrice(
      workerProfile.price,
      workerProfile.pricingType
    );

    // Ensure unique bookingId
    let bookingCode = generateBookingCode();
    let attempts = 0;
    while ((await Booking.exists({ bookingId: bookingCode })) && attempts < 5) {
      bookingCode = generateBookingCode();
      attempts += 1;
    }

    const booking = await Booking.create({
      bookingId: bookingCode,
      customerId: req.user!._id,
      workerId: workerProfile.userId,
      workerProfileId: workerProfile._id,
      serviceCategory,
      serviceDate: String(serviceDate).trim(),
      preferredTime: String(preferredTime).trim(),
      address: String(address).trim(),
      instructions: typeof instructions === 'string' ? instructions.trim() : '',
      price: quotedPrice,
      pricingType: workerProfile.pricingType,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: 'Booking request submitted by customer.',
          updatedBy: req.user!._id,
        },
      ],
    });

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone location profileImage')
      .populate('workerId', 'name email phone location profileImage')
      .populate('workerProfileId', 'serviceCategories pricingType price verificationStatus averageRating');

    res.status(201).json({
      success: true,
      message: `Booking ${booking.bookingId} submitted successfully.`,
      booking: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookings(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, search } = req.query;

    const baseFilter: Record<string, unknown> =
      req.user!.role === 'customer'
        ? { customerId: req.user!._id }
        : { workerId: req.user!._id };

    const allUserBookings = await Booking.find(baseFilter)
      .populate('customerId', 'name email phone location profileImage')
      .populate('workerId', 'name email phone location profileImage')
      .populate('workerProfileId', 'serviceCategories pricingType price verificationStatus averageRating')
      .sort({ createdAt: -1 });

    const stats = {
      total: allUserBookings.length,
      pending: allUserBookings.filter((b) => b.status === 'Pending').length,
      accepted: allUserBookings.filter((b) => b.status === 'Accepted').length,
      completed: allUserBookings.filter((b) => b.status === 'Completed').length,
      rejected: allUserBookings.filter((b) => b.status === 'Rejected').length,
      cancelled: allUserBookings.filter((b) => b.status === 'Cancelled').length,
    };

    let filtered = allUserBookings;

    if (status && typeof status === 'string' && status !== 'All') {
      filtered = filtered.filter((b) => b.status === status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((b) => {
        const customer = b.customerId as unknown as { name?: string };
        const worker = b.workerId as unknown as { name?: string };
        return (
          b.bookingId.toLowerCase().includes(term) ||
          b.serviceCategory.toLowerCase().includes(term) ||
          b.address.toLowerCase().includes(term) ||
          (customer?.name || '').toLowerCase().includes(term) ||
          (worker?.name || '').toLowerCase().includes(term)
        );
      });
    }

    res.status(200).json({
      success: true,
      stats,
      count: filtered.length,
      bookings: filtered,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const booking = mongoose.Types.ObjectId.isValid(id)
      ? await Booking.findById(id)
          .populate('customerId', 'name email phone location profileImage')
          .populate('workerId', 'name email phone location profileImage')
          .populate('workerProfileId', 'serviceCategories pricingType price verificationStatus averageRating')
      : await Booking.findOne({ bookingId: id })
          .populate('customerId', 'name email phone location profileImage')
          .populate('workerId', 'name email phone location profileImage')
          .populate('workerProfileId', 'serviceCategories pricingType price verificationStatus averageRating');

    if (!booking) {
      throw new AppError('Booking record not found.', 404);
    }

    const customerObj = booking.customerId as unknown as { _id: mongoose.Types.ObjectId };
    const workerObj = booking.workerId as unknown as { _id: mongoose.Types.ObjectId };
    const userIdStr = String(req.user!._id);

    if (String(customerObj._id) !== userIdStr && String(workerObj._id) !== userIdStr) {
      throw new AppError('You do not have permission to view this booking.', 403);
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, note } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Booking not found.', 404);
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    const nextStatus = status as BookingStatus;
    const check = canTransitionBookingStatus({
      currentStatus: booking.status,
      nextStatus,
      actorRole: req.user!.role,
      isAssignedWorker: String(booking.workerId) === String(req.user!._id),
      isBookingCustomer: String(booking.customerId) === String(req.user!._id),
    });

    if (!check.allowed) {
      throw new AppError(check.reason || 'Booking status transition not permitted.', 403);
    }

    const defaultNotes: Record<string, string> = {
      Accepted: 'Booking request accepted by worker.',
      Rejected: 'Booking request declined by worker.',
      Completed: 'Service job marked as completed by worker.',
    };

    booking.status = nextStatus;
    booking.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note:
        typeof note === 'string' && note.trim()
          ? note.trim()
          : defaultNotes[nextStatus] || `Status updated to ${nextStatus}.`,
      updatedBy: req.user!._id,
    });

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone location profileImage')
      .populate('workerId', 'name email phone location profileImage')
      .populate('workerProfileId', 'serviceCategories pricingType price verificationStatus averageRating');

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingId} marked as ${nextStatus}.`,
      booking: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Booking not found.', 404);
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }

    const check = canTransitionBookingStatus({
      currentStatus: booking.status,
      nextStatus: 'Cancelled',
      actorRole: req.user!.role,
      isAssignedWorker: String(booking.workerId) === String(req.user!._id),
      isBookingCustomer: String(booking.customerId) === String(req.user!._id),
    });

    if (!check.allowed) {
      throw new AppError(check.reason || 'Booking cannot be cancelled.', 403);
    }

    booking.status = 'Cancelled';
    booking.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note:
        typeof reason === 'string' && reason.trim()
          ? `Cancelled by customer: ${reason.trim()}`
          : 'Booking cancelled by customer before worker acceptance.',
      updatedBy: req.user!._id,
    });

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone location profileImage')
      .populate('workerId', 'name email phone location profileImage')
      .populate('workerProfileId', 'serviceCategories pricingType price verificationStatus averageRating');

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingId} has been cancelled.`,
      booking: populated,
    });
  } catch (err) {
    next(err);
  }
}

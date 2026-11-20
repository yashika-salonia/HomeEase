import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { WorkerProfile } from '../models/WorkerProfile';
import { Review } from '../models/Review';
import { SERVICE_CATEGORIES } from '../utils/bookingRules';
import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  createdAt: Date;
}

function formatWorkerRecord(profile: {
  _id: mongoose.Types.ObjectId;
  userId: PopulatedUser | mongoose.Types.ObjectId;
  serviceCategories: string[];
  experience: number;
  description: string;
  pricingType: string;
  price: number;
  workingHours: string;
  availability: boolean;
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
}) {
  const user = profile.userId as PopulatedUser;
  return {
    id: String(profile._id),
    _id: String(profile._id),
    userId: String(user._id || profile.userId),
    name: user.name || 'Service Provider',
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    profileImage: user.profileImage || '',
    serviceCategories: profile.serviceCategories,
    experience: profile.experience,
    description: profile.description,
    pricingType: profile.pricingType,
    price: profile.price,
    workingHours: profile.workingHours,
    availability: profile.availability,
    verificationStatus: profile.verificationStatus,
    averageRating: profile.averageRating,
    totalReviews: profile.totalReviews,
    joinedAt: user.createdAt || profile.createdAt,
  };
}

async function queryWorkers(req: Request) {
  const {
    q,
    category,
    location,
    minPrice,
    maxPrice,
    minExperience,
    minRating,
    available,
    sort,
    limit,
  } = req.query;

  const filter: Record<string, unknown> = {};

  if (category && typeof category === 'string' && category !== 'All') {
    filter.serviceCategories = category;
  }

  if (minPrice || maxPrice) {
    const priceQuery: Record<string, number> = {};
    if (minPrice && !Number.isNaN(Number(minPrice))) {
      priceQuery.$gte = Number(minPrice);
    }
    if (maxPrice && !Number.isNaN(Number(maxPrice))) {
      priceQuery.$lte = Number(maxPrice);
    }
    if (Object.keys(priceQuery).length > 0) {
      filter.price = priceQuery;
    }
  }

  if (minExperience && !Number.isNaN(Number(minExperience)) && Number(minExperience) > 0) {
    filter.experience = { $gte: Number(minExperience) };
  }

  if (minRating && !Number.isNaN(Number(minRating)) && Number(minRating) > 0) {
    filter.averageRating = { $gte: Number(minRating) };
  }

  if (available === 'true') {
    filter.availability = true;
  } else if (available === 'false') {
    filter.availability = false;
  }

  let sortOption: Record<string, 1 | -1> = { averageRating: -1, totalReviews: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { averageRating: -1, totalReviews: -1 };
  else if (sort === 'experience') sortOption = { experience: -1, averageRating: -1 };

  const profiles = await WorkerProfile.find(filter)
    .populate('userId', 'name email phone location profileImage createdAt')
    .sort(sortOption);

  let results = profiles
    .filter((p) => p.userId && typeof p.userId === 'object')
    .map((p) => formatWorkerRecord(p as never));

  if (location && typeof location === 'string' && location.trim()) {
    const locLower = location.trim().toLowerCase();
    results = results.filter((w) => w.location.toLowerCase().includes(locLower));
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.location.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term) ||
        w.serviceCategories.some((c) => c.toLowerCase().includes(term))
    );
  }

  if (limit && !Number.isNaN(Number(limit)) && Number(limit) > 0) {
    results = results.slice(0, Number(limit));
  }

  return results;
}

export async function getWorkers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workers = await queryWorkers(req);
    res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (err) {
    next(err);
  }
}

export async function searchWorkers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workers = await queryWorkers(req);
    res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkerById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Worker not found.', 404);
    }

    let profile = await WorkerProfile.findById(id).populate(
      'userId',
      'name email phone location profileImage createdAt'
    );

    if (!profile) {
      profile = await WorkerProfile.findOne({ userId: id }).populate(
        'userId',
        'name email phone location profileImage createdAt'
      );
    }

    if (!profile || !profile.userId) {
      throw new AppError('Worker profile not found.', 404);
    }

    const reviews = await Review.find({ workerProfileId: profile._id })
      .populate('customerId', 'name location profileImage')
      .populate('bookingId', 'bookingId serviceCategory serviceDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      worker: formatWorkerRecord(profile as never),
      reviews,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyWorkerProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user!._id }).populate(
      'userId',
      'name email phone location profileImage createdAt'
    );

    res.status(200).json({
      success: true,
      workerProfile: profile ? formatWorkerRecord(profile as never) : null,
    });
  } catch (err) {
    next(err);
  }
}

function validateWorkerProfilePayload(body: Record<string, unknown>) {
  const errors: string[] = [];
  const categories = Array.isArray(body.serviceCategories)
    ? body.serviceCategories.filter((c): c is string => typeof c === 'string')
    : [];

  if (
    categories.length === 0 ||
    !categories.every((c) => (SERVICE_CATEGORIES as readonly string[]).includes(c))
  ) {
    errors.push('Select at least one valid service category.');
  }

  const experience = Number(body.experience);
  if (Number.isNaN(experience) || experience < 0 || experience > 60) {
    errors.push('Experience must be a number between 0 and 60 years.');
  }

  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (description.length < 15) {
    errors.push('Description must be at least 15 characters.');
  }

  const pricingType = body.pricingType === 'daily' ? 'daily' : 'hourly';
  const price = Number(body.price);
  if (Number.isNaN(price) || price < 50 || price > 50000) {
    errors.push('Price must be between ₹50 and ₹50,000.');
  }

  const workingHours =
    typeof body.workingHours === 'string' && body.workingHours.trim()
      ? body.workingHours.trim()
      : '8:00 AM – 7:00 PM (Mon – Sat)';

  const availability =
    typeof body.availability === 'boolean' ? body.availability : true;

  return {
    errors,
    data: {
      serviceCategories: categories,
      experience,
      description,
      pricingType,
      price,
      workingHours,
      availability,
    },
  };
}

export async function createWorkerProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await WorkerProfile.findOne({ userId: req.user!._id });
    if (existing) {
      throw new AppError(
        'Your worker profile already exists. Use update profile instead.',
        409
      );
    }

    const { errors, data } = validateWorkerProfilePayload(req.body || {});
    if (errors.length > 0) {
      throw new AppError(errors[0], 400, errors);
    }

    const profile = await WorkerProfile.create({
      userId: req.user!._id,
      ...data,
      verificationStatus: 'Demo Review Pending',
    });

    await profile.populate('userId', 'name email phone location profileImage createdAt');

    res.status(201).json({
      success: true,
      message: 'Worker profile created successfully.',
      workerProfile: formatWorkerRecord(profile as never),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateWorkerProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { errors, data } = validateWorkerProfilePayload(req.body || {});
    if (errors.length > 0) {
      throw new AppError(errors[0], 400, errors);
    }

    let profile = await WorkerProfile.findOne({ userId: req.user!._id });
    if (!profile) {
      profile = await WorkerProfile.create({
        userId: req.user!._id,
        ...data,
        verificationStatus: 'Demo Review Pending',
      });
    } else {
      profile.serviceCategories = data.serviceCategories;
      profile.experience = data.experience;
      profile.description = data.description;
      profile.pricingType = data.pricingType;
      profile.price = data.price;
      profile.workingHours = data.workingHours;
      profile.availability = data.availability;
      await profile.save();
    }

    await profile.populate('userId', 'name email phone location profileImage createdAt');

    res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully.',
      workerProfile: formatWorkerRecord(profile as never),
    });
  } catch (err) {
    next(err);
  }
}

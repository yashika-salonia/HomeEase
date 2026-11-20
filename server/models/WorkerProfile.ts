import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { SERVICE_CATEGORIES, type PricingType } from '../utils/bookingRules';

export type VerificationStatus = 'Demo Verified' | 'Demo Review Pending' | 'Unverified';

export interface IWorkerProfile extends Document {
  userId: Types.ObjectId;
  serviceCategories: string[];
  experience: number;
  description: string;
  pricingType: PricingType;
  price: number;
  workingHours: string;
  availability: boolean;
  verificationStatus: VerificationStatus;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const workerProfileSchema = new Schema<IWorkerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    serviceCategories: {
      type: [String],
      required: [true, 'Select at least one service category'],
      validate: {
        validator: (arr: string[]) =>
          Array.isArray(arr) &&
          arr.length > 0 &&
          arr.every((cat) => (SERVICE_CATEGORIES as readonly string[]).includes(cat)),
        message: 'Provide at least one valid service category',
      },
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience cannot exceed 60 years'],
    },
    description: {
      type: String,
      required: [true, 'Professional description is required'],
      trim: true,
      minlength: [15, 'Description should be at least 15 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    pricingType: {
      type: String,
      enum: ['hourly', 'daily'],
      default: 'hourly',
    },
    price: {
      type: Number,
      required: [true, 'Service rate is required'],
      min: [50, 'Rate must be at least ₹50'],
      max: [50000, 'Rate cannot exceed ₹50,000'],
    },
    workingHours: {
      type: String,
      default: '8:00 AM – 7:00 PM (Mon – Sat)',
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Demo Verified', 'Demo Review Pending', 'Unverified'],
      default: 'Demo Review Pending',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

workerProfileSchema.index({ serviceCategories: 1 });
workerProfileSchema.index({ price: 1 });
workerProfileSchema.index({ averageRating: -1 });
workerProfileSchema.index({ experience: -1 });
workerProfileSchema.index({ availability: 1 });

export const WorkerProfile =
  mongoose.models.WorkerProfile ||
  mongoose.model<IWorkerProfile>('WorkerProfile', workerProfileSchema);

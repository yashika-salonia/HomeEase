import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  BOOKING_STATUSES,
  SERVICE_CATEGORIES,
  type BookingStatus,
  type PricingType,
} from '../utils/bookingRules';

export interface IStatusHistoryEntry {
  status: BookingStatus;
  timestamp: Date;
  note: string;
  updatedBy: Types.ObjectId;
}

export interface IBooking extends Document {
  bookingId: string;
  customerId: Types.ObjectId;
  workerId: Types.ObjectId;
  workerProfileId: Types.ObjectId;
  serviceCategory: string;
  serviceDate: string;
  preferredTime: string;
  address: string;
  instructions: string;
  price: number;
  pricingType: PricingType;
  status: BookingStatus;
  statusHistory: IStatusHistoryEntry[];
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workerProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: true,
    },
    serviceCategory: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: [true, 'Service category is required'],
    },
    serviceDate: {
      type: String,
      required: [true, 'Service date is required'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time slot is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Service address is required'],
      trim: true,
      minlength: [8, 'Address must be at least 8 characters'],
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
      maxlength: [600, 'Instructions cannot exceed 600 characters'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    pricingType: {
      type: String,
      enum: ['hourly', 'daily'],
      default: 'hourly',
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'Pending',
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ workerId: 1, createdAt: -1 });

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

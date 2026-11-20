export type UserRole = 'customer' | 'worker';
export type PricingType = 'hourly' | 'daily';
export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';

export const SERVICE_CATEGORIES = [
  'Cook',
  'Cleaner',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Construction Labour / Majdoor',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  profileImage: string;
  createdAt?: string;
}

export interface Worker {
  id: string;
  _id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  location: string;
  profileImage: string;
  serviceCategories: string[];
  experience: number;
  description: string;
  pricingType: PricingType;
  price: number;
  workingHours: string;
  availability: boolean;
  verificationStatus: 'Demo Verified' | 'Demo Review Pending' | 'Unverified';
  averageRating: number;
  totalReviews: number;
  joinedAt?: string;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface BookingParty {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
}

export interface Booking {
  _id: string;
  bookingId: string;
  customerId: BookingParty;
  workerId: BookingParty;
  workerProfileId?: {
    _id: string;
    serviceCategories?: string[];
    pricingType?: PricingType;
    price?: number;
    verificationStatus?: string;
    averageRating?: number;
  };
  serviceCategory: string;
  serviceDate: string;
  preferredTime: string;
  address: string;
  instructions: string;
  price: number;
  pricingType: PricingType;
  status: BookingStatus;
  statusHistory: StatusHistoryEntry[];
  reviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  rejected: number;
  cancelled: number;
}

export interface Review {
  _id: string;
  bookingId:
    | string
    | {
        _id: string;
        bookingId: string;
        serviceCategory: string;
        serviceDate: string;
      };
  customerId: {
    _id: string;
    name: string;
    location?: string;
    profileImage?: string;
  };
  workerId?: {
    _id: string;
    name: string;
    location?: string;
    profileImage?: string;
  };
  workerProfileId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

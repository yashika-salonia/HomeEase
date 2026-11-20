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

export const BOOKING_STATUSES = [
  'Pending',
  'Accepted',
  'Rejected',
  'Completed',
  'Cancelled',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type UserRole = 'customer' | 'worker';
export type PricingType = 'hourly' | 'daily';

export interface TransitionCheckInput {
  currentStatus: BookingStatus;
  nextStatus: BookingStatus;
  actorRole: UserRole;
  isAssignedWorker: boolean;
  isBookingCustomer: boolean;
}

export interface TransitionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Pure state-machine and RBAC validator for HomeEase booking lifecycle.
 */
export function canTransitionBookingStatus(
  input: TransitionCheckInput
): TransitionCheckResult {
  const { currentStatus, nextStatus, actorRole, isAssignedWorker, isBookingCustomer } = input;

  if (currentStatus === nextStatus) {
    return { allowed: false, reason: `Booking is already in ${currentStatus} status.` };
  }

  // Worker transitions: Accept, Reject, Complete
  if (nextStatus === 'Accepted' || nextStatus === 'Rejected' || nextStatus === 'Completed') {
    if (actorRole !== 'worker') {
      return { allowed: false, reason: 'Only workers can accept, reject, or complete jobs.' };
    }
    if (!isAssignedWorker) {
      return { allowed: false, reason: 'You are not authorized to update another worker\'s booking.' };
    }

    if (nextStatus === 'Accepted' || nextStatus === 'Rejected') {
      if (currentStatus !== 'Pending') {
        return {
          allowed: false,
          reason: `Only Pending bookings can be ${nextStatus.toLowerCase()}. Current status: ${currentStatus}.`,
        };
      }
      return { allowed: true };
    }

    if (nextStatus === 'Completed') {
      if (currentStatus !== 'Accepted') {
        return {
          allowed: false,
          reason: `Only Accepted bookings can be marked as Completed. Current status: ${currentStatus}.`,
        };
      }
      return { allowed: true };
    }
  }

  // Customer transition: Cancel
  if (nextStatus === 'Cancelled') {
    if (actorRole !== 'customer') {
      return { allowed: false, reason: 'Only customers can cancel bookings.' };
    }
    if (!isBookingCustomer) {
      return { allowed: false, reason: 'You cannot cancel another customer\'s booking.' };
    }
    if (currentStatus !== 'Pending') {
      return {
        allowed: false,
        reason: `Only Pending bookings can be cancelled. Current status: ${currentStatus}.`,
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Invalid booking status transition.' };
}

/**
 * Validates that a requested service date (YYYY-MM-DD) is valid and not in the past.
 */
export function validateServiceDate(
  serviceDateStr: string,
  referenceNow: Date = new Date()
): { valid: boolean; reason?: string } {
  if (!serviceDateStr || typeof serviceDateStr !== 'string') {
    return { valid: false, reason: 'Service date is required.' };
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(serviceDateStr.trim());
  if (!match) {
    return { valid: false, reason: 'Service date must be in YYYY-MM-DD format.' };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return { valid: false, reason: 'Invalid calendar date.' };
  }

  const todayUtc = new Date(
    Date.UTC(referenceNow.getFullYear(), referenceNow.getMonth(), referenceNow.getDate())
  );

  if (parsed.getTime() < todayUtc.getTime()) {
    return { valid: false, reason: 'Service date cannot be in the past.' };
  }

  // Limit bookings to within 1 year ahead
  const maxUtc = new Date(todayUtc);
  maxUtc.setUTCFullYear(maxUtc.getUTCFullYear() + 1);
  if (parsed.getTime() > maxUtc.getTime()) {
    return { valid: false, reason: 'Service date cannot be more than 1 year in advance.' };
  }

  return { valid: true };
}

/**
 * Generates a readable unique booking ID such as HE-2026-482913.
 */
export function generateBookingCode(now: Date = new Date(), randomSeed?: number): string {
  const year = now.getFullYear();
  const num =
    typeof randomSeed === 'number'
      ? Math.floor(100000 + (Math.abs(randomSeed) % 900000))
      : Math.floor(100000 + Math.random() * 900000);
  return `HE-${year}-${num}`;
}

/**
 * Consistently calculates the server-authoritative quoted price for a booking.
 */
export function calculateQuotedPrice(basePrice: number, pricingType: PricingType): number {
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    throw new Error('Worker base price must be a positive number.');
  }
  const rounded = Math.round(basePrice);
  // Hourly services quote a standard 2-hour minimum visit or base rate?
  // Prompt shows displaying worker hourly/daily rate and quoting consistently.
  // We quote the worker's published unit rate (1 hr / 1 day base visit) so displayed & stored price match transparently.
  return pricingType === 'hourly' ? rounded : rounded;
}

/**
 * Computes average rating rounded to 1 decimal place.
 */
export function computeAverageRating(ratings: number[]): {
  averageRating: number;
  totalReviews: number;
} {
  if (!ratings.length) {
    return { averageRating: 0, totalReviews: 0 };
  }
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  const averageRating = Math.round((sum / ratings.length) * 10) / 10;
  return { averageRating, totalReviews: ratings.length };
}

/**
 * Validates registration input fields.
 */
export function validateRegistrationInput(input: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  location?: string;
  role?: string;
}): string[] {
  const errors: string[] = [];
  if (!input.name || input.name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.push('Please provide a valid email address.');
  }
  const phoneDigits = (input.phone || '').replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.push('Please provide a valid phone number (10–15 digits).');
  }
  if (!input.password || input.password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (!input.location || input.location.trim().length < 2) {
    errors.push('Location is required.');
  }
  if (input.role !== 'customer' && input.role !== 'worker') {
    errors.push('Role must be either customer or worker.');
  }
  return errors;
}

/**
 * Validates booking submission payload.
 */
export function validateBookingInput(
  input: {
    workerId?: string;
    serviceCategory?: string;
    serviceDate?: string;
    preferredTime?: string;
    address?: string;
  },
  referenceNow: Date = new Date()
): string[] {
  const errors: string[] = [];
  if (!input.workerId) errors.push('Worker selection is required.');
  if (!input.serviceCategory) errors.push('Service category is required.');
  const dateCheck = validateServiceDate(input.serviceDate || '', referenceNow);
  if (!dateCheck.valid) errors.push(dateCheck.reason || 'Invalid service date.');
  if (!input.preferredTime || input.preferredTime.trim().length < 3) {
    errors.push('Preferred time slot is required.');
  }
  if (!input.address || input.address.trim().length < 8) {
    errors.push('Please provide a complete service address (at least 8 characters).');
  }
  return errors;
}

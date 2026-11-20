import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController.ts';
import { protect, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.post('/', protect, authorizeRoles('customer'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, authorizeRoles('worker'), updateBookingStatus);
router.patch('/:id/cancel', protect, authorizeRoles('customer'), cancelBooking);

export default router;

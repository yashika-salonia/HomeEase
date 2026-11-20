import { Router } from 'express';
import {
  createReview,
  getWorkerReviews,
  getMyReviews,
} from '../controllers/reviewController.ts';
import { protect, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.post('/', protect, authorizeRoles('customer'), createReview);
router.get('/my', protect, getMyReviews);
router.get('/worker/:workerId', getWorkerReviews);

export default router;

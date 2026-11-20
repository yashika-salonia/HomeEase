import { Router } from 'express';
import {
  getWorkers,
  searchWorkers,
  getWorkerById,
  createWorkerProfile,
  updateWorkerProfile,
  getMyWorkerProfile,
} from '../controllers/workerController';
import { protect, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', getWorkers);
router.get('/search', searchWorkers);
router.get('/me/profile', protect, authorizeRoles('worker'), getMyWorkerProfile);
router.post('/profile', protect, authorizeRoles('worker'), createWorkerProfile);
router.put('/profile', protect, authorizeRoles('worker'), updateWorkerProfile);
router.get('/:id', getWorkerById);

export default router;

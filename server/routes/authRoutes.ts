import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.ts';
import { protect } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;

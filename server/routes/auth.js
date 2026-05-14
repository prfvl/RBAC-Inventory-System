import express from 'express';
import { register, login, logout, refresh, me } from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/logout', verifyToken, logout);
router.post('/refresh', refresh);
router.get('/me', verifyToken, me);

export default router;

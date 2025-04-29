import express from 'express';
import { 
  register, 
  login,
  logout, 
  resetPassword, 
  requestPasswordReset, 
  refreshToken,
  getSession
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', requestPasswordReset);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/session', authenticateToken, getSession);

export default router;
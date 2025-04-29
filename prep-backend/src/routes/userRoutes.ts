import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
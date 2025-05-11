import express from 'express';
import { generateToken } from '../controllers/livekitController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes - requires authentication
router.post('/token', authenticateToken, generateToken);

export default router; 
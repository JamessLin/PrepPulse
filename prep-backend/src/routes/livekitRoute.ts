import express from 'express';
import { getToken, getTestToken } from '../controllers/livekitController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Add missing authentication middleware if needed
router.get('/token', getToken);

// New route for testing - NO AUTHENTICATION
router.get('/test-token', getTestToken);

export default router;
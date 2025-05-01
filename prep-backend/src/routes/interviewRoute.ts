import { Router } from 'express';
import { generateInterviewQuestions } from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Generate interview questions for a resume
router.post('/questions/:resumeId', authenticateToken, generateInterviewQuestions);

export default router;
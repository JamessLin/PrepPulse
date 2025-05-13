import { Router } from 'express';
import { generateInterviewQuestions } from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';
import express from 'express';

const router = express.Router();

// Generate interview questions for a resume
router.post('/questions/:resumeId', authenticateToken, generateInterviewQuestions);

export default router;
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  upload, 
  uploadResume, 
  deleteResume, 
  getResume, 
  getPeerResumes, 
} from '../controllers/resumeController';

const router = express.Router();

router.use(authenticateToken);

// Upload a resume
router.post('/upload', upload.single('resume'), uploadResume);

// Delete a resume
router.delete('/', deleteResume);

// Get own resume information
router.get('/', getResume);

// Get specific user's resume by ID
router.get('/user/:userId', getResume);

// Get all public resumes for peer review
router.get('/peers', getPeerResumes);

// // Generate interview questions based on a resume
// router.get('/questions/:resumeId', generateInterviewQuestions);

export default router;
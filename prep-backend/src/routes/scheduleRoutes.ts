import { Router } from 'express';
import { 
  createSchedule, 
  joinInterview, 
  getScheduleDetails, 
  getUserSchedules 
} from '../controllers/scheduleController';

import { authenticateToken } from '../middleware/auth';
const router = Router();

// Create a new schedule
router.post('/create', authenticateToken, createSchedule);

// Join an interview
router.post('/join', authenticateToken, joinInterview);

// Get all schedules for the current user
router.get('/user', authenticateToken, getUserSchedules);

// Get details of a specific schedule
router.get('/:id', authenticateToken, getScheduleDetails);


export default router;
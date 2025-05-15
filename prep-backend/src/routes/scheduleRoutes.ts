import { Router } from 'express';
import { 
  createSchedule, 
  joinInterview, 
  getScheduleDetails, 
  getUserSchedules,
  checkScheduleJoinable,
  testJoinQueue
} from '../controllers/scheduleController';

import { authenticateToken } from '../middleware/auth';
import express from 'express';
const router = express.Router();

// Create a new schedule
router.post('/create', authenticateToken, createSchedule);

// Join an interview
router.post('/join', authenticateToken, joinInterview);

// Get all schedules for the current user
router.get('/user', authenticateToken, getUserSchedules);

// Check if a schedule is joinable
router.get('/:id/joinable', authenticateToken, checkScheduleJoinable);

// Get details of a specific schedule
router.get('/:id', authenticateToken, getScheduleDetails);

// Test route for joining P2P queue
router.post('/test-join-queue', authenticateToken, testJoinQueue);


export default router;
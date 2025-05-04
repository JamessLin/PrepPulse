import { Router } from 'express';
import { createSchedule, joinInterview } from '../controllers/scheduleController';

const router = Router();

router.post('/create', createSchedule);
router.post('/join', joinInterview);

export default router;
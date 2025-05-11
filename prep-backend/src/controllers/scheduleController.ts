import { Request, Response } from 'express';
import { supabase, createSupabaseClient } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';
import { Server, Socket } from 'socket.io';

interface AuthRequest extends Request {
  user?: { id: string };
}

const activeSockets: Map<string, { socketId: string; scheduleId: string; userId: string }> = new Map();

const startMatchmaking = async () => {
  const { data: queueEntries, error: queueError } = await supabase
    .from('match_queue')
    .select('id, schedule_id, user_id, interview_type, created_at')
    .eq('status', 'searching')
    .order('created_at', { ascending: true });

  if (queueError) {
    console.error('Error fetching queue entries:', queueError.message);
    return;
  }

  if (!queueEntries || queueEntries.length < 2) return;

  for (let i = 0; i < queueEntries.length - 1; i++) {
    for (let j = i + 1; j < queueEntries.length; j++) {
      const queue1 = queueEntries[i];
      const queue2 = queueEntries[j];

      const { data: schedule1 } = await supabase
        .from('schedules')
        .select('id, scheduled_time, interview_type, interview_mode')
        .eq('id', queue1.schedule_id)
        .single();

      const { data: schedule2 } = await supabase
        .from('schedules')
        .select('id, scheduled_time, interview_type, interview_mode')
        .eq('id', queue2.schedule_id)
        .single();

      if (!schedule1 || !schedule2) continue;

      const timeDiff = Math.abs(
        new Date(schedule1.scheduled_time).getTime() - new Date(schedule2.scheduled_time).getTime()
      );
      const timeWindowMs = 2 * 60 * 1000; // 2 minutes

      if (
        schedule1.interview_mode === 'peer-to-peer' &&
        schedule2.interview_mode === 'peer-to-peer' &&
        schedule1.interview_type === schedule2.interview_type &&
        timeDiff <= timeWindowMs
      ) {
        const roomName = `interview-${uuidv4()}`;
        const sessionId = uuidv4();

        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert({
            schedule_id_1: schedule1.id,
            schedule_id_2: schedule2.id,
            participant_2_type: 'user',
            participant_2_id: queue2.user_id,
            room_name: roomName,
            session_id: sessionId,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          })
          .select()
          .single();

        if (matchError) {
          console.error('Error creating match:', matchError.message);
          return;
        }

        await supabase
          .from('schedules')
          .update({ status: 'matched', updated_at: new Date() })
          .in('id', [schedule1.id, schedule2.id]);

        await supabase
          .from('match_queue')
          .update({ status: 'matched', updated_at: new Date() })
          .in('schedule_id', [schedule1.id, schedule2.id]);

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
          console.error('LiveKit credentials are not configured');
          return;
        }

        const token1 = new AccessToken(apiKey, apiSecret, { identity: queue1.user_id });
        token1.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        const jwt1 = token1.toJwt();

        const token2 = new AccessToken(apiKey, apiSecret, { identity: queue2.user_id });
        token2.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        const jwt2 = token2.toJwt();

        const socket1 = activeSockets.get(queue1.user_id);
        const socket2 = activeSockets.get(queue2.user_id);

        if (socket1) {
          io.to(socket1.socketId).emit('match', { sessionId, token: jwt1, roomName });
          activeSockets.delete(queue1.user_id);
        }
        if (socket2) {
          io.to(socket2.socketId).emit('match', { sessionId, token: jwt2, roomName });
          activeSockets.delete(queue2.user_id);
        }
        return;
      }
    }
  }
};

const cleanupQueue = async (scheduleId: string) => {
  const { data: schedule } = await supabase
    .from('schedules')
    .select('id, status')
    .eq('id', scheduleId)
    .single();

  if (schedule && schedule.status === 'searching') {
    await supabase
      .from('schedules')
      .update({ status: 'cancelled', updated_at: new Date() })
      .eq('id', scheduleId);
    await supabase
      .from('match_queue')
      .update({ status: 'cancelled', updated_at: new Date() })
      .eq('schedule_id', scheduleId);
  }
};

const checkTimeouts = async () => {
  const now = new Date();
  const { data: queueEntries } = await supabase
    .from('match_queue')
    .select('schedule_id, user_id, created_at')
    .eq('status', 'searching');

  if (!queueEntries) return;

  for (const entry of queueEntries) {
    const expirationTime = new Date(entry.created_at);
    expirationTime.setMinutes(expirationTime.getMinutes() + 2);

    if (now >= expirationTime) {
      await cleanupQueue(entry.schedule_id);
      const socket = activeSockets.get(entry.user_id);
      if (socket) {
        io.to(socket.socketId).emit('timeout');
        activeSockets.delete(entry.user_id);
      }
    }
  }
};

let io: Server; // Declare io variable to be set later

export const initializeSocket = (socketIo: Server) => {
  io = socketIo; // Set the io instance

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinQueue', (data: { scheduleId: string; userId: string }) => {
      console.log('User joined queue:', data);
      activeSockets.set(data.userId, { socketId: socket.id, scheduleId: data.scheduleId, userId: data.userId });
      startMatchmaking();
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      for (const [userId, value] of activeSockets.entries()) {
        if (value.socketId === socket.id) {
          cleanupQueue(value.scheduleId);
          activeSockets.delete(userId);
          break;
        }
      }
    });
  });

  // Start the interval for matchmaking and timeouts
  setInterval(() => {
    startMatchmaking();
    checkTimeouts();
  }, 5000); // Check every 5 seconds
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { scheduledTime, interviewType, interviewMode, friendEmail } = req.body;
    if (!scheduledTime) {
      res.status(400).json({ error: 'Scheduled time is required' });
      return;
    }

    if (!interviewType) {
      res.status(400).json({ error: 'Interview type is required' });
      return;
    }

    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      res.status(400).json({ error: 'Invalid or past scheduled time' });
      return;
    }

    const interviewModeValue = interviewMode || 'peer-to-peer';
    if (!['peer-to-peer', 'you-vs-ai', 'you-vs-friend'].includes(interviewModeValue)) {
      res.status(400).json({ error: 'Invalid interview mode' });
      return;
    }

    if (interviewModeValue === 'you-vs-friend' && !friendEmail) {
      res.status(400).json({ error: 'Friend email is required for you-vs-friend mode' });
      return;
    }

    const { data: conflict, error: conflictError } = await supabase
      .from('schedules')
      .select('id')
      .eq('user_id', user.id)
      .eq('scheduled_time', scheduledDate.toISOString())
      .in('status', ['pending', 'matched']);

    if (conflictError) {
      console.error('Error checking for existing schedule:', conflictError.message);
      res.status(500).json({ error: 'Failed to validate existing schedules' });
      return;
    }

    if (conflict && conflict.length > 0) {
      res.status(400).json({ error: 'You already have an interview scheduled at this time' });
      return;
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        user_id: user.id,
        scheduled_time: scheduledDate.toISOString(),
        interview_type: interviewType,
        interview_mode: interviewModeValue,
        friend_email: interviewModeValue === 'you-vs-friend' ? friendEmail : null,
        friend_status: interviewModeValue === 'you-vs-friend' ? 'invited' : null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating schedule:', error.message);
      res.status(500).json({ error: 'Failed to create schedule' });
      return;
    }

    res.status(200).json({
      scheduleId: data.id,
      scheduledTime: data.scheduled_time,
      interviewType: data.interview_type,
      interviewMode: data.interview_mode,
      matched: false,
    });
  } catch (error: any) {
    console.error('Create schedule error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScheduleDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Schedule ID is required' });
      return;
    }

    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('id, user_id, scheduled_time, interview_type, interview_mode, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id, schedule_id_1, schedule_id_2, participant_2_type, participant_2_id, status')
      .or(`schedule_id_1.eq.${id},schedule_id_2.eq.${id}`)
      .eq('status', 'active')
      .single();

    if (matchError && matchError.code !== 'PGRST116') {
      console.error('Error getting match data:', matchError.message);
      res.status(500).json({ error: 'Failed to get match data' });
      return;
    }

    let matchedWith = null;
    if (matchData && matchData.participant_2_type === 'user') {
      const otherScheduleId = matchData.schedule_id_1 === id ? matchData.schedule_id_2 : matchData.schedule_id_1;
      const { data: otherSchedule, error: otherError } = await supabase
        .from('schedules')
        .select('user_id')
        .eq('id', otherScheduleId)
        .single();

      if (!otherError && otherSchedule) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('id', otherSchedule.user_id)
          .single();

        if (!userError && userData) {
          matchedWith = {
            userId: userData.id,
            name: `${userData.first_name} ${userData.last_name}` || 'Unknown',
          };
        }
      }
    }

    res.status(200).json({
      scheduleId: schedule.id,
      scheduledTime: schedule.scheduled_time,
      interviewType: schedule.interview_type,
      interviewMode: schedule.interview_mode,
      matched: matchedWith !== null,
      matchedWith,
    });
  } catch (error: any) {
    console.error('Get schedule details error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('id, scheduled_time, interview_type, interview_mode, status')
      .eq('user_id', user.id)
      .order('scheduled_time', { ascending: false });

    if (schedulesError) {
      console.error('Error getting user schedules:', schedulesError.message);
      res.status(500).json({ error: 'Failed to get user schedules' });
      return;
    }

    if (!schedules || schedules.length === 0) {
      res.status(200).json([]);
      return;
    }

    const scheduleIds = schedules.map((s) => s.id);
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, schedule_id_1, schedule_id_2, participant_2_type, participant_2_id, status')
      .or(`schedule_id_1.in.(${scheduleIds.join(',')}),schedule_id_2.in.(${scheduleIds.join(',')})`)
      .eq('status', 'active');

    if (matchesError) {
      console.error('Error getting matches:', matchesError.message);
      res.status(500).json({ error: 'Failed to get matches data' });
      return;
    }

    const matchMap = new Map();
    if (matches) {
      for (const match of matches) {
        const userScheduleId = match.schedule_id_1 === user.id ? match.schedule_id_1 : match.schedule_id_2;
        const otherScheduleId = match.schedule_id_1 === userScheduleId ? match.schedule_id_2 : match.schedule_id_1;
        matchMap.set(userScheduleId, { otherScheduleId, participant_2_type: match.participant_2_type });
      }
    }

    const result = await Promise.all(
      schedules.map(async (schedule) => {
        let matchedWith = null;

        if (matchMap.has(schedule.id)) {
          const { otherScheduleId, participant_2_type } = matchMap.get(schedule.id);
          if (participant_2_type === 'user') {
            const { data: otherSchedule, error: otherError } = await supabase
              .from('schedules')
              .select('user_id')
              .eq('id', otherScheduleId)
              .single();

            if (!otherError && otherSchedule) {
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .eq('id', otherSchedule.user_id)
                .single();

              if (!userError && userData) {
                matchedWith = {
                  userId: userData.id,
                  name: `${userData.first_name} ${userData.last_name}` || 'Unknown',
                };
              }
            }
          }
        }

        return {
          scheduleId: schedule.id,
          scheduledTime: schedule.scheduled_time,
          interviewType: schedule.interview_type,
          interviewMode: schedule.interview_mode,
          matched: matchedWith !== null,
          matchedWith,
        };
      })
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Get user schedules error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { scheduleId } = req.body;
    if (!scheduleId) {
      res.status(400).json({ error: 'Schedule ID is required' });
      return;
    }

    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('id, user_id, scheduled_time, interview_type, interview_mode, status')
      .eq('id', scheduleId)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    if (schedule.interview_mode !== 'peer-to-peer') {
      res.status(400).json({ error: 'This endpoint is only for peer-to-peer interviews' });
      return;
    }

    const scheduledTime = new Date(schedule.scheduled_time);
    const now = new Date();
    
    // Calculate time difference in minutes
    const timeDiffMinutes = (scheduledTime.getTime() - now.getTime()) / (60 * 1000);

    // Check if we're in the valid join window: 
    // Not more than 2 minutes before scheduled time and not more than 5 minutes after
    if (timeDiffMinutes > 2) {
      res.status(400).json({ 
        error: 'You can only join 2 minutes before your scheduled interview time',
        timeRemaining: Math.ceil(timeDiffMinutes) 
      });
      return;
    }
    
    if (timeDiffMinutes < -5) {
      res.status(400).json({ error: 'Interview time has already passed' });
      return;
    }

    // Check that the status is still 'pending' - can't join if already matched or cancelled
    if (schedule.status !== 'pending') {
      res.status(400).json({ 
        error: `Interview cannot be joined because its status is ${schedule.status}`,
        status: schedule.status
      });
      return;
    }

    // Add to match_queue
    const { error: queueError } = await supabase
      .from('match_queue')
      .insert({
        schedule_id: scheduleId,
        user_id: user.id,
        interview_type: schedule.interview_type,
        status: 'searching',
      });

    if (queueError) {
      console.error('Error adding to queue:', queueError.message);
      res.status(500).json({ error: 'Failed to join queue' });
      return;
    }

    // Update schedule status to searching
    await supabase
      .from('schedules')
      .update({ status: 'searching', updated_at: now })
      .eq('id', scheduleId);

    res.status(200).json({ 
      message: 'Joined matchmaking queue',
      searchTimeoutSeconds: 120 // 2 minute timeout for matchmaking
    });
  } catch (error: any) {
    console.error('Join interview error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkScheduleJoinable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Schedule ID is required' });
      return;
    }

    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('id, user_id, scheduled_time, interview_type, interview_mode, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    const scheduledTime = new Date(schedule.scheduled_time);
    const now = new Date();
    
    // Calculate time difference in minutes
    const timeDiffMinutes = (scheduledTime.getTime() - now.getTime()) / (60 * 1000);

    // Check various conditions for joinability
    let joinable = false;
    let reason = '';
    let timeRemaining = Math.ceil(timeDiffMinutes);

    if (schedule.status !== 'pending') {
      joinable = false;
      reason = `Interview cannot be joined because its status is ${schedule.status}`;
    } else if (timeDiffMinutes > 2) {
      joinable = false;
      reason = 'You can only join 2 minutes before your scheduled interview time';
    } else if (timeDiffMinutes < -5) {
      joinable = false;
      reason = 'Interview time has already passed';
    } else if (schedule.interview_mode !== 'peer-to-peer') {
      joinable = false;
      reason = 'Only peer-to-peer interviews can be joined for matching';
    } else {
      joinable = true;
      reason = 'Ready to join';
    }

    res.status(200).json({
      scheduleId: schedule.id,
      scheduledTime: schedule.scheduled_time,
      interviewType: schedule.interview_type,
      interviewMode: schedule.interview_mode,
      status: schedule.status,
      joinable,
      reason,
      timeRemaining,
      canJoinAt: timeDiffMinutes > 2 ? new Date(scheduledTime.getTime() - 2 * 60 * 1000).toISOString() : null
    });
  } catch (error: any) {
    console.error('Check schedule joinable error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
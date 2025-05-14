import { Request, Response } from 'express';
import { supabase, createSupabaseClient } from '../config/supabase';

//TODO: SEPERATE MATCHMAKING AND QUEUE SERVICE

interface AuthRequest extends Request {
  user?: { id: string };
}

// All Socket.IO and matchmaking logic has been moved to prep-backend/src/services/socketHandler.ts
// activeSockets Map has been moved
// startMatchmaking function has been moved
// cleanupQueue function has been moved
// checkTimeouts function has been moved
// io variable has been moved
// initializeSocket function has been moved

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
      status: data.status
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
      .select('id, user_id, scheduled_time, interview_type, interview_mode, status, friend_email, friend_status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    let matchedWith = null;
    if (schedule.status === 'matched' || schedule.status === 'active') {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id, schedule_id_1, schedule_id_2, participant_2_type, participant_2_id, status')
        .or(`schedule_id_1.eq.${id},schedule_id_2.eq.${id}`)
        .single();

      if (matchError && matchError.code !== 'PGRST116') {
        console.error('Error getting match data:', matchError.message);
        res.status(500).json({ error: 'Failed to get match data' });
        return;
      }

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
              name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Peer',
            };
          }
        }
      }
    }

    res.status(200).json({
      scheduleId: schedule.id,
      scheduledTime: schedule.scheduled_time,
      interviewType: schedule.interview_type,
      interviewMode: schedule.interview_mode,
      status: schedule.status,
      friendEmail: schedule.friend_email,
      friendStatus: schedule.friend_status,
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

    const { data: schedulesData, error: schedulesError } = await supabase
      .from('schedules')
      .select('id, scheduled_time, interview_type, interview_mode, status, friend_email, friend_status')
      .eq('user_id', user.id)
      .order('scheduled_time', { ascending: false });

    if (schedulesError) {
      console.error('Error getting user schedules:', schedulesError.message);
      res.status(500).json({ error: 'Failed to get user schedules' });
      return;
    }

    if (!schedulesData || schedulesData.length === 0) {
      res.status(200).json({ schedules: [] });
      return;
    }

    const scheduleIds = new Set(schedulesData.map((s) => s.id));

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('id, schedule_id_1, schedule_id_2, participant_2_type, participant_2_id, status')
      .or(`schedule_id_1.in.(${Array.from(scheduleIds).join(',')}),schedule_id_2.in.(${Array.from(scheduleIds).join(',')})`)

    if (matchesError) {
      console.error('Error getting matches:', matchesError.message);
      res.status(500).json({ error: 'Failed to get matches data' });
      return;
    }

    const matchMap = new Map();
    if (matchesData) {
      for (const match of matchesData) {
        let currentUserScheduleIdInMatch: string | null = null;
        let otherUserScheduleIdInMatch: string | null = null;

        if (scheduleIds.has(match.schedule_id_1)) {
          currentUserScheduleIdInMatch = match.schedule_id_1;
          otherUserScheduleIdInMatch = match.schedule_id_2;
        } else if (scheduleIds.has(match.schedule_id_2)) {
          currentUserScheduleIdInMatch = match.schedule_id_2;
          otherUserScheduleIdInMatch = match.schedule_id_1;
        }
        
        if (currentUserScheduleIdInMatch && otherUserScheduleIdInMatch && match.participant_2_type === 'user') {
           matchMap.set(currentUserScheduleIdInMatch, { 
             otherScheduleId: otherUserScheduleIdInMatch,
           });
        }
      }
    }
    
    const populatedSchedules = await Promise.all(
      schedulesData.map(async (schedule) => {
        let matchedWithInfo = null;
        if ((schedule.status === 'matched' || schedule.status === 'active') && matchMap.has(schedule.id)) {
          const matchDetails = matchMap.get(schedule.id);
          if (matchDetails && matchDetails.otherScheduleId) {
            const { data: otherUserSchedule, error: otherUserScheduleError } = await supabase
              .from('schedules')
              .select('user_id')
              .eq('id', matchDetails.otherScheduleId)
              .single();

            if (!otherUserScheduleError && otherUserSchedule) {
              const { data: otherUserData, error: otherUserError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .eq('id', otherUserSchedule.user_id)
                .single();

              if (!otherUserError && otherUserData) {
                matchedWithInfo = {
                  userId: otherUserData.id,
                  name: `${otherUserData.first_name || ''} ${otherUserData.last_name || ''}`.trim() || 'Peer',
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
          status: schedule.status,
          friendEmail: schedule.friend_email,
          friendStatus: schedule.friend_status,
          matchedWith: matchedWithInfo,
        };
      })
    );

    res.status(200).json({ schedules: populatedSchedules });
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
    
    const timeDiffMinutes = (scheduledTime.getTime() - now.getTime()) / (60 * 1000);

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

    if (schedule.status !== 'pending') {
      res.status(400).json({ 
        error: `Interview cannot be joined because its status is ${schedule.status}`,
        status: schedule.status
      });
      return;
    }

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

    await supabase
      .from('schedules')
      .update({ status: 'searching', updated_at: now })
      .eq('id', scheduleId);

    res.status(200).json({ 
      message: 'Successfully joined matchmaking queue. Waiting for a match...',
      searchTimeoutSeconds: 120
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
    
    const timeDiffMinutes = (scheduledTime.getTime() - now.getTime()) / (60 * 1000);

    let joinable = false;
    let reason = '';
    let timeRemaining = Math.ceil(timeDiffMinutes);
    let canJoinAt = null;

    if (schedule.interview_mode !== 'peer-to-peer') {
      joinable = false;
      reason = 'Only peer-to-peer interviews can be joined for matching.';
    } else if (schedule.status !== 'pending') {
      joinable = false;
      reason = `Interview cannot be joined. Current status: ${schedule.status}.`;
    } else if (timeDiffMinutes < -5) {
      joinable = false;
      reason = 'Interview time has passed.';
    } else if (timeDiffMinutes > 2) {
      joinable = false;
      reason = 'You can join 2 minutes before your scheduled interview time.';
      canJoinAt = new Date(scheduledTime.getTime() - 2 * 60 * 1000).toISOString();
    } else {
      joinable = true;
      reason = 'Ready to join matchmaking.';
    }

    res.status(200).json({
      scheduleId: schedule.id,
      scheduledTime: schedule.scheduled_time,
      interviewType: schedule.interview_type,
      interviewMode: schedule.interview_mode,
      status: schedule.status,
      joinable,
      reason,
      timeRemainingMinutes: joinable && timeDiffMinutes > 0 ? Math.ceil(timeDiffMinutes) : (timeDiffMinutes <=0 && timeDiffMinutes >= -5 ? Math.ceil(5 + timeDiffMinutes) : 0),
      canJoinAt
    });
  } catch (error: any) {
    console.error('Check schedule joinable error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
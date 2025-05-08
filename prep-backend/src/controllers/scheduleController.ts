import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { scheduledTime, interviewType } = req.body;
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
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
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
      matched: false
    });
  } catch (error: any) {
    console.error('Create schedule error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScheduleDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
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
      .select('id, user_id, scheduled_time, interview_type, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id, schedule_id_1, schedule_id_2, status')
      .or(`schedule_id_1.eq.${id},schedule_id_2.eq.${id}`)
      .eq('status', 'active')
      .single();

    if (matchError && matchError.code !== 'PGRST116') {
      console.error('Error getting match data:', matchError.message);
      res.status(500).json({ error: 'Failed to get match data' });
      return;
    }

    let matchedWith = null;
    if (matchData) {
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
            name: `${userData.first_name} ${userData.last_name}` || 'Unknown'
          };
        }
      }
    }

    res.status(200).json({
      scheduleId: schedule.id,
      scheduledTime: schedule.scheduled_time,
      interviewType: schedule.interview_type,
      matched: matchedWith !== null,
      matchedWith
    });
  } catch (error: any) {
    console.error('Get schedule details error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('id, scheduled_time, interview_type, status')
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

    const scheduleIds = schedules.map(s => s.id);
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, schedule_id_1, schedule_id_2, status')
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
        matchMap.set(userScheduleId, otherScheduleId);
      }
    }

    const result = await Promise.all(schedules.map(async (schedule) => {
      let matchedWith = null;
      
      if (matchMap.has(schedule.id)) {
        const otherScheduleId = matchMap.get(schedule.id);
        
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
              name: `${userData.first_name} ${userData.last_name}` || 'Unknown'
            };
          }
        }
      }

      return {
        scheduleId: schedule.id,
        scheduledTime: schedule.scheduled_time,
        interviewType: schedule.interview_type,
        matched: matchedWith !== null,
        matchedWith
      };
    }));

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Get user schedules error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
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
      .select('id, user_id, scheduled_time, interview_type, status')
      .eq('id', scheduleId)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    // TODO: Disabled for testing purposes, re-enable later
    // FIXME: Double reminder to fix
    // const now = new Date();
    // const scheduledTime = new Date(schedule.scheduled_time);
    
    // if (now < scheduledTime) {
    //   res.status(400).json({ error: 'Interview time has not yet started' });
    //   return;
    // }
    const scheduledTime = new Date(schedule.scheduled_time);
    if (schedule.status !== 'pending') {
      const { data: existingMatch, error: existingMatchError } = await supabase
        .from('matches')
        .select('id, schedule_id_1, schedule_id_2, room_name, session_id, status')
        .or(`schedule_id_1.eq.${scheduleId},schedule_id_2.eq.${scheduleId}`)
        .eq('status', 'active')
        .single();

      if (!existingMatchError && existingMatch) {
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
          console.error('LiveKit credentials are not configured');
          res.status(500).json({ error: 'Server configuration error: LiveKit credentials missing' });
          return;
        }

        const token = new AccessToken(apiKey, apiSecret, {
          identity: user.id,
        });

        token.addGrant({
          roomJoin: true,
          room: existingMatch.room_name,
          canPublish: true,
          canSubscribe: true,
        });

        const jwt = token.toJwt();

        res.status(200).json({
          sessionId: existingMatch.session_id,
          token: jwt,
          roomName: existingMatch.room_name
        });
        return;
      }
      
      res.status(400).json({ error: 'Schedule is not in pending state' });
      return;
    }

    const timeWindowMinutes = 2;
    const earliestTime = new Date(scheduledTime);
    earliestTime.setMinutes(earliestTime.getMinutes() - timeWindowMinutes);
    
    const latestTime = new Date(scheduledTime);
    latestTime.setMinutes(latestTime.getMinutes() + timeWindowMinutes);

    const { data: potentialMatches, error: matchError } = await supabase
      .from('schedules')
      .select('id, user_id, scheduled_time, interview_type')
      .eq('status', 'pending')
      .eq('interview_type', schedule.interview_type)
      .neq('user_id', user.id)
      .gte('scheduled_time', earliestTime.toISOString())
      .lte('scheduled_time', latestTime.toISOString())
      .limit(1);

    if (matchError) {
      console.error('Matchmaking error:', matchError.message);
      res.status(500).json({ error: 'Failed to find a match' });
      return;
    }

    const timeout = setTimeout(async () => {
      const { error: updateError } = await supabase
        .from('schedules')
        .update({ status: 'cancelled', updated_at: new Date() })
        .eq('id', scheduleId)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Error cancelling schedule:', updateError.message);
      }
      res.status(408).json({ message: 'No match found within 2 minutes. Please reschedule.' });
    }, 2 * 60 * 1000);

    if (!potentialMatches || potentialMatches.length === 0) {
      res.status(202).json({ message: 'Waiting for a match' });
      return;
    }

    clearTimeout(timeout);

    const peerSchedule = potentialMatches[0];
    const roomName = `interview-${uuidv4()}`;
    const sessionId = uuidv4();

    const { data: matchData, error: createMatchError } = await supabase
      .from('matches')
      .insert({
        schedule_id_1: scheduleId,
        schedule_id_2: peerSchedule.id,
        room_name: roomName,
        session_id: sessionId,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (createMatchError) {
      console.error('Error creating match:', createMatchError.message);
      res.status(500).json({ error: 'Failed to create match' });
      return;
    }

    const { error: updateError } = await supabase
      .from('schedules')
      .update({ status: 'matched', updated_at: new Date() })
      .in('id', [scheduleId, peerSchedule.id]);

    if (updateError) {
      console.error('Error updating schedules:', updateError.message);
      await supabase.from('matches').delete().eq('id', matchData.id);
      res.status(500).json({ error: 'Failed to update schedules' });
      return;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('LiveKit credentials are not configured');
      await supabase.from('matches').delete().eq('id', matchData.id);
      await supabase.from('schedules').update({ status: 'pending', updated_at: new Date() }).eq('id', scheduleId);
      res.status(500).json({ error: 'Server configuration error: LiveKit credentials missing' });
      return;
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = token.toJwt();

    res.status(200).json({
      sessionId: sessionId,
      token: jwt,
      roomName,
    });
  } catch (error: any) {
    console.error('Join interview error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
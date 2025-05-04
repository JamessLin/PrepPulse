import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';

interface AuthRequest extends Request {
  user?: { id: string };
}


//TODO: This is a temporary solution. Will implement with more detail (interview type, etc.) 
export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { scheduledTime } = req.body;
    if (!scheduledTime) {
      res.status(400).json({ error: 'Scheduled time is required' });
      return;
    }

    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      res.status(400).json({ error: 'Invalid or past scheduled time' });
      return;
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        user_id: user.id,
        scheduled_time: scheduledDate.toISOString(),
        status: 'pending',
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
    });
  } catch (error: any) {
    console.error('Create schedule error:', error.message);
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
      .select('id, user_id, scheduled_time, status')
      .eq('id', scheduleId)
      .eq('user_id', user.id)
      .single();

    if (scheduleError || !schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    const now = new Date();
    const scheduledTime = new Date(schedule.scheduled_time);
    if (now < scheduledTime) {
      res.status(400).json({ error: 'Interview time has not yet started' });
      return;
    }

    if (schedule.status !== 'pending') {
      res.status(400).json({ error: 'Schedule is not in pending state' });
      return;
    }

    // Matchmaking: Look for another user with a pending schedule within the same time slot
    const { data: potentialMatches, error: matchError } = await supabase
      .from('schedules')
      .select('id, user_id, scheduled_time')
      .eq('status', 'pending')
      .neq('user_id', user.id)
      .lte('scheduled_time', now.toISOString())
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
    }, 2 * 60 * 1000); // 2 minutes timeout

    if (!potentialMatches || potentialMatches.length === 0) {
      res.status(202).json({ message: 'Waiting for a match...' });
      return;
    }

    clearTimeout(timeout);

    const peerSchedule = potentialMatches[0];
    const roomName = `interview-${uuidv4()}`;

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user1_id: user.id,
        user2_id: peerSchedule.user_id,
        room_name: roomName,
        status: 'active',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError.message);
      res.status(500).json({ error: 'Failed to create session' });
      return;
    }

    // Update both schedules to 'matched'
    const { error: updateError } = await supabase
      .from('schedules')
      .update({ status: 'matched', updated_at: new Date() })
      .in('id', [scheduleId, peerSchedule.id]);

    if (updateError) {
      console.error('Error updating schedules:', updateError.message);
      res.status(500).json({ error: 'Failed to update schedules' });
      return;
    }

    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

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
      sessionId: sessionData.id,
      token: jwt,
      roomName,
    });
  } catch (error: any) {
    console.error('Join interview error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
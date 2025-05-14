import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';
import { Server, Socket } from 'socket.io';

// TODO: Potentially move matchmaking logic to a separate matchmakingService.ts in the future

const activeSockets: Map<string, { socketId: string; scheduleId: string; userId: string }> = new Map();

let io: Server; // Declare io variable to be set by initializeSocket

const startMatchmaking = async () => {
  // Implementation will be moved here
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
          // Consider not returning immediately, to allow other potential matches.
          // Or, if this is a critical error, ensure proper handling.
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
          return; // Critical error, cannot proceed with token generation
        }

        const token1 = new AccessToken(apiKey, apiSecret, { identity: queue1.user_id });
        token1.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        const jwt1 = token1.toJwt();

        const token2 = new AccessToken(apiKey, apiSecret, { identity: queue2.user_id });
        token2.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        const jwt2 = token2.toJwt();

        const socketInfo1 = activeSockets.get(queue1.user_id);
        const socketInfo2 = activeSockets.get(queue2.user_id);

        if (socketInfo1) {
          io.to(socketInfo1.socketId).emit('match', { sessionId, token: jwt1, roomName });
          activeSockets.delete(queue1.user_id);
        }
        if (socketInfo2) {
          io.to(socketInfo2.socketId).emit('match', { sessionId, token: jwt2, roomName });
          activeSockets.delete(queue2.user_id);
        }
        // Found and processed a match, exit loops to restart search on next interval
        // This prevents issues if queueEntries array was modified by matching.
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
  const { data: queueEntries, error } = await supabase // Added error handling
    .from('match_queue')
    .select('schedule_id, user_id, created_at')
    .eq('status', 'searching');

  if (error) {
    console.error('Error fetching queue for timeouts:', error.message);
    return;
  }
  if (!queueEntries) return;

  for (const entry of queueEntries) {
    const expirationTime = new Date(entry.created_at);
    expirationTime.setMinutes(expirationTime.getMinutes() + 2); // 2 minute timeout

    if (now >= expirationTime) {
      await cleanupQueue(entry.schedule_id);
      const socketInfo = activeSockets.get(entry.user_id);
      if (socketInfo) {
        io.to(socketInfo.socketId).emit('timeout');
        activeSockets.delete(entry.user_id);
      }
    }
  }
};

export const initializeSocket = (socketIoInstance: Server) => {
  io = socketIoInstance; // Assign the passed Socket.IO server instance

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinQueue', (data: { scheduleId: string; userId: string }) => {
      console.log('User joined queue via socket:', data);
      // Basic validation: ensure data.userId and data.scheduleId are present
      if (!data.userId || !data.scheduleId) {
        console.error('Invalid data for joinQueue:', data);
        socket.emit('error', { message: 'Invalid data for joining queue.' });
        return;
      }
      activeSockets.set(data.userId, { socketId: socket.id, scheduleId: data.scheduleId, userId: data.userId });
      // Potentially trigger matchmaking immediately or rely on the interval
      startMatchmaking(); 
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      for (const [userId, value] of activeSockets.entries()) {
        if (value.socketId === socket.id) {
          // User disconnected while in queue, so cleanup their queue entry
          console.log(`Cleaning up queue for user ${userId} due to disconnect.`);
          cleanupQueue(value.scheduleId); 
          activeSockets.delete(userId);
          break;
        }
      }
    });

    // Consider adding a generic error handler for sockets
    socket.on('error', (err) => {
        console.error("Socket error:", err.message);
        // Potentially emit a message back to the specific client
    });
  });

  // Start the interval for matchmaking and timeouts
  setInterval(() => {
    startMatchmaking();
    checkTimeouts();
  }, 5000); // Check every 5 seconds

  console.log('Socket handler initialized and matchmaking interval started.');
}; 
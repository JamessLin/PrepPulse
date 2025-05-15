import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

// TODO: Potentially move matchmaking logic to a separate matchmakingService.ts in the future
// This TODO is now being addressed by moving logic to a worker.

const activeSockets: Map<string, { socketId: string; scheduleId: string; userId: string; dynamicQueueKey: string }> = new Map();

let io: Server; // Declare io variable to be set by initializeSocket

// Initialize Redis clients
// Ensure your Redis server is running and accessible.
// TODO: Move Redis connection strings to environment variables.
const redisClient = new Redis(); // For general commands
const redisSubscriber = new Redis(); // For Pub/Sub

// const MATCHMAKING_QUEUE_KEY = 'matchmaking_queue:p2p_technical'; // Removed, now dynamic
const MATCH_NOTIFICATIONS_CHANNEL = 'match_notifications_channel'; // Pub/Sub channel

// Old startMatchmaking function is removed. Will be in a separate worker.
// Old checkTimeouts function is removed. Timeout logic will be re-evaluated with the new worker architecture.

const cleanupQueueOnDisconnect = async (userId: string, scheduleId: string, dynamicQueueKey: string) => {
  console.log(`[CleanupQueueOnDisconnect] Attempting to remove user ${userId} (schedule ${scheduleId}) from Redis queue: ${dynamicQueueKey}.`);
  try {
    // This payload MUST exactly match the string pushed to the Redis list for LREM to work.
    const payload = JSON.stringify({ userId, scheduleId }); 
    const result = await redisClient.lrem(dynamicQueueKey, 0, payload);
    console.log(`[CleanupQueueOnDisconnect] Removed ${result} instances of user ${userId} from Redis queue: ${dynamicQueueKey}.`);

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
      // The match_queue table's role is diminished, but if it's still used for tracking, update it.
      // Consider if this update is still necessary or if the worker handles all status updates.
      await supabase
        .from('match_queue') // This table might be deprecated with Redis queuing
        .update({ status: 'cancelled', updated_at: new Date() })
        .eq('schedule_id', scheduleId);
      console.log(`[CleanupQueueOnDisconnect] Marked schedule ${scheduleId} as cancelled in DB.`);
    }
  } catch (error) {
    console.error(`[CleanupQueueOnDisconnect] Error during cleanup for user ${userId}:`, error);
  }
};

export const initializeSocket = (socketIoInstance: Server) => {
  io = socketIoInstance;

  // Subscribe to match notifications from the worker
  redisSubscriber.subscribe(MATCH_NOTIFICATIONS_CHANNEL, (err, count) => {
    if (err) {
      console.error('Failed to subscribe to Redis channel:', err);
      return;
    }
    console.log(`Subscribed to ${count} Redis channel(s). Listening for match notifications on ${MATCH_NOTIFICATIONS_CHANNEL}`);
  });

  redisSubscriber.on('message', (channel, message) => {
    console.log(`[Redis Pub/Sub] Received message from channel ${channel}:`, message);
    if (channel === MATCH_NOTIFICATIONS_CHANNEL) {
      try {
        // Log the current state of activeSockets for debugging
        console.log('[MatchNotification] Current activeSockets before processing:', JSON.stringify(Array.from(activeSockets.entries()), null, 2));

        const matchDetails = JSON.parse(message);
        // Ensure all necessary details are present in the message from the worker
        const { userId1, token1, scheduleId1, userId2, token2, scheduleId2, roomName, sessionId } = matchDetails;

        const socketInfo1 = activeSockets.get(userId1);
        const socketInfo2 = activeSockets.get(userId2);

        if (socketInfo1) {
          console.log(`[MatchNotification] Emitting 'match' to user ${userId1} (socket ${socketInfo1.socketId}) for schedule ${scheduleId1}`);
          io.to(socketInfo1.socketId).emit('match', { sessionId, token: token1, roomName, scheduleId: scheduleId1 });
          activeSockets.delete(userId1);
        } else {
          console.warn(`[MatchNotification] Socket info not found for userId1: ${userId1}. User might have disconnected.`);
        }

        if (socketInfo2) {
          console.log(`[MatchNotification] Emitting 'match' to user ${userId2} (socket ${socketInfo2.socketId}) for schedule ${scheduleId2}`);
          io.to(socketInfo2.socketId).emit('match', { sessionId, token: token2, roomName, scheduleId: scheduleId2 });
          activeSockets.delete(userId2);
        } else {
          console.warn(`[MatchNotification] Socket info not found for userId2: ${userId2}. User might have disconnected.`);
        }
      } catch (parseError) {
        console.error('[Redis Pub/Sub] Error parsing match notification message:', parseError);
      }
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('[SocketConnection] Client connected:', socket.id);

    socket.on('joinQueue', async (data: { scheduleId: string; userId: string }) => {
      console.log('[SocketEvent - joinQueue] User joining queue with data:', data);
      if (!data.userId || !data.scheduleId) {
        console.error('Invalid data for joinQueue:', data);
        socket.emit('error', { message: 'Invalid data for joining queue.' });
        return;
      }

      console.log(`[SocketEvent - joinQueue] DEBUG: Attempting to fetch schedule with ID: ${data.scheduleId} using ANON client.`);

      try {
        // Step 1: Query without .single() for debugging
        const { data: debugScheduleData, error: debugScheduleError } = await supabase
          .from('schedules')
          .select('id, interview_type, interview_mode, status') // Select more fields for debugging
          .eq('id', data.scheduleId);

        console.log('[SocketEvent - joinQueue] DEBUG: Raw fetch result:');
        console.log('[SocketEvent - joinQueue] DEBUG: Data:', JSON.stringify(debugScheduleData, null, 2));
        console.log('[SocketEvent - joinQueue] DEBUG: Error:', debugScheduleError ? debugScheduleError.message : null);

        if (debugScheduleError && debugScheduleError.message !== 'JSON object requested, multiple (or no) rows returned') {
          // Handle unexpected errors from the broader query itself
          console.error(`[SocketEvent - joinQueue] DEBUG: Unexpected error fetching schedule (before .single()): ${data.scheduleId}:`, debugScheduleError.message);
          socket.emit('error', { message: 'Error fetching schedule details.' });
          return;
        }
        
        if (!debugScheduleData || debugScheduleData.length === 0) {
            console.error(`[SocketEvent - joinQueue] DEBUG: No schedule found for ID ${data.scheduleId} by ANON client. RLS likely issue.`);
            socket.emit('error', { message: 'Schedule not found, RLS may be active.' });
            return;
        }

        if (debugScheduleData.length > 1) {
            console.error(`[SocketEvent - joinQueue] DEBUG: Multiple schedules found for ID ${data.scheduleId}. This should not happen with a UUID.`);
            socket.emit('error', { message: 'Duplicate schedule ID found.' });
            return;
        }

        // If we reach here, debugScheduleData should contain exactly one schedule.
        // Now, proceed with the original logic, but using the already fetched data if possible, or re-fetching with .single()
        // For simplicity in this debugging step, we'll just use the first element from debugScheduleData.
        const scheduleInfo = debugScheduleData[0];

        const interviewType = scheduleInfo.interview_type;
        if (!interviewType) {
            console.error(`[SocketEvent - joinQueue] Schedule ${data.scheduleId} (status: ${scheduleInfo.status}) does not have an interview_type.`);
            socket.emit('error', { message: 'Schedule missing interview type.' });
            return;
        }
        
        // Check if the status is 'searching' as a sanity check here based on RLS policy intent
        if (scheduleInfo.status !== 'searching') {
            console.warn(`[SocketEvent - joinQueue] Fetched schedule ${data.scheduleId} has status '${scheduleInfo.status}', not 'searching'. This might be unexpected if RLS policy relies on 'searching' status.`);
        }

        const dynamicQueueKey = `matchmaking_queue:p2p_${interviewType.toLowerCase().replace(/\s+/g, '_')}`;
        console.log(`[SocketEvent - joinQueue] Determined dynamic queue key: ${dynamicQueueKey} for schedule ${data.scheduleId}`);

        activeSockets.set(data.userId, { 
          socketId: socket.id, 
          scheduleId: data.scheduleId, 
          userId: data.userId,
          dynamicQueueKey: dynamicQueueKey
        });
        
        const payloadToPush = JSON.stringify({ userId: data.userId, scheduleId: data.scheduleId }); 
        await redisClient.rpush(dynamicQueueKey, payloadToPush);

        console.log(`[SocketEvent - joinQueue] User ${data.userId} (schedule ${data.scheduleId}) added to Redis queue: ${dynamicQueueKey}`);
        socket.emit('queueJoinedSuccessfully', { scheduleId: data.scheduleId, queueName: dynamicQueueKey });
      } catch (error: any) {
        console.error('[SocketEvent - joinQueue] Error during joinQueue process:', error.message || error);
        // Log the specific scheduleId if available in data
        if(data && data.scheduleId) {
            console.error(`[SocketEvent - joinQueue] Error was for scheduleId: ${data.scheduleId}`);
        }
        socket.emit('error', { message: 'Failed to join queue due to a server error.' });
        if (data && data.userId) activeSockets.delete(data.userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('[SocketEvent - disconnect] Client disconnected:', socket.id);
      let disconnectedUserInfo: { userId: string; scheduleId: string; dynamicQueueKey: string } | null = null;
      for (const [userId, value] of activeSockets.entries()) {
        if (value.socketId === socket.id) {
          disconnectedUserInfo = value;
          activeSockets.delete(userId);
          break;
        }
      }

      if (disconnectedUserInfo) {
        console.log(`[SocketEvent - disconnect] Cleaning up for disconnected user ${disconnectedUserInfo.userId} (schedule ${disconnectedUserInfo.scheduleId}) from queue ${disconnectedUserInfo.dynamicQueueKey}.`);
        cleanupQueueOnDisconnect(disconnectedUserInfo.userId, disconnectedUserInfo.scheduleId, disconnectedUserInfo.dynamicQueueKey);
      }
    });

    socket.on('error', (err) => {
        console.error("[SocketError] Socket error:", err.message, err);
    });
  });

  // Removed setInterval for startMatchmaking and checkTimeouts
  console.log('Socket handler initialized. Redis Pub/Sub listener started for match notifications.');
}; 
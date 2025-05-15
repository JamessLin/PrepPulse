import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- Environment Variable Checks ---
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'REDIS_URL',
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Error: Environment variable ${varName} is not set.`);
    process.exit(1);
  }
}

// --- Supported Interview Types for Dynamic Queues ---
// TODO: Potentially move this to a config file or fetch from DB if it becomes very dynamic
const SUPPORTED_INTERVIEW_TYPES = ['technical', 'behavioral', '']; //TODO: Add more LATER 

// --- Redis Configuration ---
const redisUrl = process.env.REDIS_URL!;
const redisClient = new Redis(redisUrl); // For BLPOP
const redisPublisher = new Redis(redisUrl); // For PUBLISH

redisClient.on('connect', () => {
  console.log('[MatchmakingWorker] Connected to Redis (Subscriber/BLPOP client).');
});
redisClient.on('error', (err) => {
  console.error('[MatchmakingWorker] Redis Subscriber/BLPOP client error:', err);
});

redisPublisher.on('connect', () => {
  console.log('[MatchmakingWorker] Connected to Redis (Publisher client).');
});
redisPublisher.on('error', (err) => {
  console.error('[MatchmakingWorker] Redis Publisher client error:', err);
});

const DYNAMIC_QUEUE_PREFIX = 'matchmaking_queue:p2p_';
const queueKeysToWatch: string[] = SUPPORTED_INTERVIEW_TYPES.map(
    type => `${DYNAMIC_QUEUE_PREFIX}${type.toLowerCase().replace(/s+/g, '_')}`
);

const MATCH_NOTIFICATIONS_CHANNEL = 'match_notifications_channel'; // Must match socketHandler.ts

// --- Supabase Configuration ---
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Important for service role key to bypass RLS
    autoRefreshToken: false,
    persistSession: false,
  }
});

console.log('[MatchmakingWorker] Initialized with Supabase URL:', supabaseUrl);
console.log('[MatchmakingWorker] LiveKit API Key available:', !!process.env.LIVEKIT_API_KEY);
console.log('[MatchmakingWorker] Watching Redis queues:', queueKeysToWatch);

interface QueueEntry {
  userId: string;
  scheduleId: string;
  // interviewType is no longer in the payload from socketHandler, worker will fetch schedule
}

async function processQueue() {
  console.log(`[MatchmakingWorker] Waiting for users in queues: ${queueKeysToWatch.join(', ')}...`);

  // Check Redis connection status before starting the loop
  if (!redisClient.status || redisClient.status !== 'ready') {
    console.error('[MatchmakingWorker] Redis client (blpop) not ready. Current status:', redisClient.status);
    // Optionally wait and retry, or exit. For now, we log and proceed, blpop might wait or fail.
  }
   if (!redisPublisher.status || redisPublisher.status !== 'ready') {
    console.error('[MatchmakingWorker] Redis client (publisher) not ready. Current status:', redisPublisher.status);
  }

  while (true) {
    let originalQueueKeyUser1: string | null = null;
    let rawUser1: string | null = null;
    let user1: QueueEntry | null = null;

    let originalQueueKeyUser2: string | null = null;
    let rawUser2: string | null = null;
    let user2: QueueEntry | null = null;

    try {
      // BLPOP returns an array: [queueName, value]
      // It will block until an item is available in any of the watched queues.
      console.log(`[MatchmakingWorker] Attempting to pop first user from queues: ${queueKeysToWatch.join(', ')}`);
      const result1 = await redisClient.blpop(queueKeysToWatch, 0);
      if (!result1) continue;

      originalQueueKeyUser1 = result1[0];
      rawUser1 = result1[1];
      user1 = JSON.parse(rawUser1) as QueueEntry;
      console.log(`[MatchmakingWorker] Popped user1: ${user1.userId} (scheduleId: ${user1.scheduleId}) from queue: ${originalQueueKeyUser1}`);

      // Try to get a second user from THE SAME queue non-blockingly.
      // If we want to match across different compatible queues, the logic would be more complex.
      // For now, we assume a match must come from the exact same dynamic queue.
      console.log(`[MatchmakingWorker] Attempting to pop second user from specific queue: ${originalQueueKeyUser1}`);
      const lpopResult = await redisClient.lpop(originalQueueKeyUser1);

      if (!lpopResult) {
        console.log(`[MatchmakingWorker] No second user found immediately in ${originalQueueKeyUser1}. Re-queueing user1: ${user1.userId}`);
        await redisClient.rpush(originalQueueKeyUser1, rawUser1);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      rawUser2 = lpopResult;
      user2 = JSON.parse(rawUser2) as QueueEntry;
      originalQueueKeyUser2 = originalQueueKeyUser1; // They came from the same queue
      console.log(`[MatchmakingWorker] Popped user2: ${user2.userId} (scheduleId: ${user2.scheduleId}) from queue: ${originalQueueKeyUser2}`);

      if (user1.userId === user2.userId) {
        console.log(`[MatchmakingWorker] User ${user1.userId} attempted to match with themselves. Re-queueing both to ${originalQueueKeyUser1}.`);
        await redisClient.rpush(originalQueueKeyUser1, rawUser1);
        await redisClient.rpush(originalQueueKeyUser2, rawUser2); // originalQueueKeyUser2 is same as 1 here
        continue;
      }
      
      console.log(`[MatchmakingWorker] Processing potential match between ${user1.userId} and ${user2.userId} from queue ${originalQueueKeyUser1}`);

      // --- Fetch schedule details from Supabase ---
      const { data: schedule1, error: sched1Error } = await supabase
        .from('schedules')
        .select('id, scheduled_time, interview_type, interview_mode, user_id, status')
        .eq('id', user1.scheduleId)
        .single();

      const { data: schedule2, error: sched2Error } = await supabase
        .from('schedules')
        .select('id, scheduled_time, interview_type, interview_mode, user_id, status')
        .eq('id', user2.scheduleId)
        .single();

      if (sched1Error || !schedule1) {
        console.error(`[MatchmakingWorker] Error fetching schedule1 (id: ${user1.scheduleId}) or not found:`, sched1Error?.message);
        if (rawUser2 && originalQueueKeyUser2) await redisClient.rpush(originalQueueKeyUser2, rawUser2); // Re-queue user2
        continue;
      }
      if (sched2Error || !schedule2) {
        console.error(`[MatchmakingWorker] Error fetching schedule2 (id: ${user2.scheduleId}) or not found:`, sched2Error?.message);
        if (rawUser1 && originalQueueKeyUser1) await redisClient.rpush(originalQueueKeyUser1, rawUser1); // Re-queue user1
        continue;
      }
      
      // Ensure schedules are still in 'searching' state (they should be if they are in the queue)
      if (schedule1.status !== 'searching' || schedule2.status !== 'searching') {
        console.log('[MatchmakingWorker] One or both schedules no longer in searching state. Re-queueing if applicable.');
        if (schedule1.status === 'searching' && rawUser1 && originalQueueKeyUser1) await redisClient.rpush(originalQueueKeyUser1, rawUser1);
        if (schedule2.status === 'searching' && rawUser2 && originalQueueKeyUser2) await redisClient.rpush(originalQueueKeyUser2, rawUser2);
        continue;
      }

      // --- Matching Logic ---
      // The queue itself implies the interview_type and p2p mode, but we verify from fetched schedules for robustness.
      const derivedQueueTypeFromSchedule1 = `${DYNAMIC_QUEUE_PREFIX}${schedule1.interview_type?.toLowerCase().replace(/s+/g, '_')}`;
      if (originalQueueKeyUser1 !== derivedQueueTypeFromSchedule1) {
          console.warn(`[MatchmakingWorker] Mismatch! User1 popped from ${originalQueueKeyUser1} but schedule ${schedule1.id} has type ${schedule1.interview_type}. Re-queueing both.`);
          if (rawUser1 && originalQueueKeyUser1) await redisClient.rpush(originalQueueKeyUser1, rawUser1);
          if (rawUser2 && originalQueueKeyUser2) await redisClient.rpush(originalQueueKeyUser2, rawUser2);
          continue;
      }

      console.log('[MatchmakingWorker] schedule1 details:', JSON.stringify(schedule1, null, 2));
      console.log('[MatchmakingWorker] schedule2 details:', JSON.stringify(schedule2, null, 2));

      const timeDiff = Math.abs(
        new Date(schedule1.scheduled_time).getTime() - new Date(schedule2.scheduled_time).getTime()
      );
      const timeWindowMs = 2 * 60 * 1000; // 2 minutes, can be configured

      const bypassTimeCheck = process.env.BYPASS_MATCHMAKING_TIME_CHECK === 'true';
      const timeCheckPassed = bypassTimeCheck || (timeDiff <= timeWindowMs);

      console.log('[MatchmakingWorker] Time check values:', { bypassTimeCheck, timeDiff, timeWindowMs, timeCheckPassed });
      // interview_type is implicitly matched by being in the same dynamic queue.
      // interview_mode is also implicitly p2p by the queue name prefix.

      //TODO: Lol Fix this Idiotic matching logic
      if (
        schedule1.interview_mode === 'peer-to-peer' &&
        schedule2.interview_mode === 'peer-to-peer' &&
        schedule1.interview_type === schedule2.interview_type &&
        schedule1.id !== schedule2.id &&
        timeCheckPassed
      ) {
        console.log(`[MatchmakingWorker] Match criteria MET for ${schedule1.id} and ${schedule2.id} from queue ${originalQueueKeyUser1}.`);
        const roomName = `interview-${uuidv4()}`;
        const sessionId = uuidv4();

        // --- Database operations for match ---
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert({
            schedule_id_1: schedule1.id,
            schedule_id_2: schedule2.id,
            participant_1_id: schedule1.user_id, // Store user_id from schedule
            participant_2_id: schedule2.user_id, // Store user_id from schedule
            participant_1_type: 'user',
            participant_2_type: 'user',
            room_name: roomName,
            session_id: sessionId,
            status: 'active', // Or 'pending_join', 'confirmed'
            // created_at and updated_at will be set by default by Supabase if configured
          })
          .select()
          .single();

        if (matchError) {
          console.error('[MatchmakingWorker] Error creating match record:', matchError.message);
          if (rawUser1 && originalQueueKeyUser1) await redisClient.rpush(originalQueueKeyUser1, rawUser1);
          if (rawUser2 && originalQueueKeyUser2) await redisClient.rpush(originalQueueKeyUser2, rawUser2);
          continue;
        }
        console.log('[MatchmakingWorker] Match record created:', JSON.stringify(matchData, null, 2));

        const { error: schedUpdateError } = await supabase
          .from('schedules')
          .update({ status: 'matched', updated_at: new Date() })
          .in('id', [schedule1.id, schedule2.id]);

        if (schedUpdateError) {
          console.error('[MatchmakingWorker] Error updating schedules to matched:', schedUpdateError.message);
        } else {
          console.log('[MatchmakingWorker] Schedules updated to matched status.');
        }
        
        // Optionally, update original match_queue entries if that table is still being used for auditing/status
        // await supabase.from('match_queue').update({ status: 'matched' }).in('schedule_id', [schedule1.id, schedule2.id]);


        // --- LiveKit Token Generation ---
        const apiKey = process.env.LIVEKIT_API_KEY!;
        const apiSecret = process.env.LIVEKIT_API_SECRET!;

        const token1 = new AccessToken(apiKey, apiSecret, { identity: schedule1.user_id }); // Use user_id from schedule
        token1.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        const jwt1 = token1.toJwt();

        const token2 = new AccessToken(apiKey, apiSecret, { identity: schedule2.user_id }); // Use user_id from schedule
        token2.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        const jwt2 = token2.toJwt();
        console.log(`[MatchmakingWorker] LiveKit tokens generated for user ${schedule1.user_id} and ${schedule2.user_id}`);

        // --- Publish match notification to Redis Pub/Sub ---
        const notificationPayload = JSON.stringify({
          userId1: schedule1.user_id, // User ID from schedule
          token1: jwt1,
          scheduleId1: schedule1.id,
          userId2: schedule2.user_id, // User ID from schedule
          token2: jwt2,
          scheduleId2: schedule2.id,
          roomName,
          sessionId,
        });

        await redisPublisher.publish(MATCH_NOTIFICATIONS_CHANNEL, notificationPayload);
        console.log(`[MatchmakingWorker] Published match notification to ${MATCH_NOTIFICATIONS_CHANNEL}`);

      } else {
        console.log(`[MatchmakingWorker] Match criteria NOT MET for ${user1?.scheduleId} and ${user2?.scheduleId}. Re-queueing both.`);
        if (rawUser1 && originalQueueKeyUser1) await redisClient.rpush(originalQueueKeyUser1, rawUser1);
        if (rawUser2 && originalQueueKeyUser2) await redisClient.rpush(originalQueueKeyUser2, rawUser2);
      }
    } catch (error: any) {
      console.error('[MatchmakingWorker] Error in processing loop:', error.message || error);
      // Re-queue users if they were popped and an unexpected error occurred before processing completion
      if (rawUser1 && originalQueueKeyUser1 && !user2) { // user1 popped, error before user2 processing
         console.log(`[MatchmakingWorker] Re-queueing user1 (${user1?.userId}) to ${originalQueueKeyUser1} due to error.`);
         await redisClient.rpush(originalQueueKeyUser1, rawUser1);
      } else if (rawUser1 && originalQueueKeyUser1 && rawUser2 && originalQueueKeyUser2) { // Both popped, error during their processing
         console.log(`[MatchmakingWorker] Re-queueing user1 (${user1?.userId}) to ${originalQueueKeyUser1} and user2 (${user2?.userId}) to ${originalQueueKeyUser2} due to error.`);
         await redisClient.rpush(originalQueueKeyUser1, rawUser1);
         await redisClient.rpush(originalQueueKeyUser2, rawUser2);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('[MatchmakingWorker] Shutting down...');
  try {
    await redisClient.quit();
    await redisPublisher.quit();
    console.log('[MatchmakingWorker] Redis connections closed.');
  } catch (err) {
    console.error('[MatchmakingWorker] Error closing Redis connections during shutdown:', err);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown); 
process.on('SIGTERM', shutdown); 


processQueue().catch(err => {
  console.error("[MatchmakingWorker] Unhandled error in processQueue, worker stopping:", err);
  shutdown();
});

console.log('[MatchmakingWorker] Worker process started.'); 
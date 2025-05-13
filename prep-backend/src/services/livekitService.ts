import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const livekitUrl   = process.env.LIVEKIT_URL!;
const livekitKey   = process.env.LIVEKIT_API_KEY!;
const livekitSecret= process.env.LIVEKIT_API_SECRET!;
const supabaseUrl  = process.env.SUPABASE_URL!;
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const livekit = new RoomServiceClient(livekitUrl, livekitKey, livekitSecret);
const supabase = createClient(supabaseUrl, supabaseKey);

export interface TokenOptions {
  identity: string;    
  roomName: string;
  peerId?: string;     // other user's id for P2P
  matchId?: string;    // optional match reference
}

export async function createLiveKitToken(opts: TokenOptions) {
  const { identity, roomName, peerId, matchId } = opts;

  await livekit.createRoom({ name: roomName });

  const at = new AccessToken(livekitKey, livekitSecret, {
    identity,
    name: identity,
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
  const jwt = await at.toJwt();

  // 3. persist session record
  const { error } = await supabase
    .from('livekit_sessions')
    .insert({
      user1_id: identity,
      user2_id: peerId || null,
      room_name: roomName,
      status: 'created',
      match_id: matchId || null,
    });

  if (error) throw error;

  return { token: jwt, url: livekitUrl };
}

// NEW FUNCTION FOR TESTING
export async function generateTestLiveKitToken(opts: { identity?: string; roomName?: string }) {
  const identity = opts.identity || `test-user-${uuidv4()}`;
  const roomName = opts.roomName || `test-room-${uuidv4()}`;

  const livekitApiKey = process.env.LIVEKIT_API_KEY!;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET!;
  const livekitUrl = process.env.LIVEKIT_URL!;

  if (!livekitApiKey || !livekitApiSecret || !livekitUrl) {
    console.error('LiveKit Test Token: API Key, Secret, or URL is missing from environment variables.');
    throw new Error('LiveKit server environment variables not fully configured for testing.');
  }

  const at = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: identity,
    name: identity, // Optional: display name for participant
  });

  at.addGrant({ 
    roomJoin: true, 
    room: roomName, 
    canPublish: true, 
    canSubscribe: true 
  });

  const token = await at.toJwt();

  console.log(`Generated test token for user '${identity}' in room '${roomName}'`);
  return { token, roomName, identity, livekitUrl };
}

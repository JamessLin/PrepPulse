import { Router, Request, Response } from 'express';
import * as LiveKit from 'livekit-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';

const router = Router();

/**
 * Generate a LiveKit token for a user to join a video room
 * @route POST /api/livekit/token
 * @access Private - Requires authentication
 */
router.post('/token', authenticateToken, async (req: Request, res: Response) => {
  try {
    // req.user created by authenticateToken
    const user = (req as any).user;
    if (!user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = user.id as string;

    // Extract or create a room name
    const { roomName: rn } = req.body as { roomName?: string };
    const roomName = rn || `interview-${uuidv4()}`;

    // Create AccessToken and attach VideoGrant
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      { identity: userId }
    );
    at.addGrant({
      roomJoin:    true,
      room:        roomName,
      canPublish:  true,
      canSubscribe:true,
    });

    // Issue JWT and respond
    const jwt = at.toJwt();
    res.json({ token: jwt, roomName });
  } catch (err) {
    console.error('LiveKit token error:', err);
    res.status(500).json({ error: 'Failed to generate LiveKit token' });
  }
});

/**
 * Test endpoint for generating a LiveKit token without authentication
 * @route POST /api/livekit/test-token
 * @access Public
 */
router.post('/test-token', async (req: Request, res: Response) => {
  try {
    // Generate test identity and room
    const identity = `test-user-${Math.floor(Math.random() * 10000)}`;
    const { roomName: rn } = req.body as { roomName?: string };
    const roomName = rn || `test-room-${uuidv4()}`;

    // Ensure env vars are set
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      res.status(500).json({
        error:   'LiveKit credentials not configured',
        details: 'Add LIVEKIT_API_KEY & LIVEKIT_API_SECRET to your .env',
      });
      return;
    }

    // Create AccessToken and VideoGrant
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      { identity }
    );
    at.addGrant({
      roomJoin:    true,
      room:        roomName,
      canPublish:  true,
      canSubscribe:true,
    });

    // Issue JWT and respond
    const jwt = at.toJwt();
    res.json({ token: jwt, roomName, identity, note: 'This is a test token. Do not use in production.' });
  } catch (err) {
    console.error('LiveKit test-token error:', err);
    res.status(500).json({ error: 'Failed to generate LiveKit test token' });
  }
});

export default router;

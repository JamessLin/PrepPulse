import { Router, Request, Response } from 'express';
import { createSupabaseClient } from '../config/supabase';
import { AccessToken } from 'livekit-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Generate a LiveKit token for a user to join a video room
 * 
 * @route POST /api/livekit/token
 * @access Private - Requires authentication
 */
router.post('/token', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Verify user is authenticated
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;
    
    // Extract room name from request body or generate one
    let { roomName } = req.body as { roomName?: string };
    if (!roomName) {
      roomName = `interview-${uuidv4()}`;
    }

    // Generate LiveKit token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      { identity: userId }
    );
    
    // Add grants to the token
    token.addGrant({ 
      roomJoin: true, 
      room: roomName, 
      canPublish: true, 
      canSubscribe: true 
    });
    
    // Generate JWT
    const jwt = token.toJwt();
    
    // Return token and room name
    res.json({ token: jwt, roomName });
  } catch (error) {
    console.error('LiveKit token error:', error);
    res.status(500).json({ error: 'Failed to generate LiveKit token' });
  }
});

/**
 * Test endpoint for generating a LiveKit token without authentication
 * IMPORTANT: For development/testing only
 * 
 * @route POST /test-token
 * @access Public
 */
router.post('/test-token', async (req: Request, res: Response) => {
  try {
    // Use a test user identity
    const testUserId = `test-user-${Math.floor(Math.random() * 10000)}`;
    
    // Extract room name from request body or generate one
    let { roomName } = req.body as { roomName?: string };
    if (!roomName) {
      roomName = `test-room-${uuidv4()}`;
    }

    // Check if LiveKit credentials are configured
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      res.status(500).json({ 
        error: 'LiveKit credentials not configured',
        details: 'Add LIVEKIT_API_KEY and LIVEKIT_API_SECRET to your .env file'
      });
      return;
    }

    // Generate LiveKit token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: testUserId }
    );
    
    // Add grants to the token
    token.addGrant({ 
      roomJoin: true, 
      room: roomName, 
      canPublish: true, 
      canSubscribe: true 
    });
    
    // Generate JWT
    const jwt = token.toJwt();
    
    // Return token and room name
    res.json({ 
      token: jwt, 
      roomName,
      identity: testUserId,
      note: 'This is a test token. Do not use in production.'
    });
  } catch (error) {
    console.error('LiveKit test token error:', error);
    res.status(500).json({ error: 'Failed to generate test LiveKit token' });
  }
});

export default router; 
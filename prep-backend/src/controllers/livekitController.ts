import { Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';

interface AuthRequest extends Request {
  user?: { id: string };
}

/**
 * Generate a LiveKit token for joining a room
 * @param req - Request with roomName and participantName in body
 * @param res - Response with token
 */
export const generateToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomName, participantName } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!roomName || !participantName) {
      res.status(400).json({ error: 'Room name and participant name are required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get API credentials from environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('LiveKit credentials are not configured');
      res.status(500).json({ error: 'LiveKit service is not properly configured' });
      return;
    }

    // Create token with the specified identity and name
    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: participantName,
    });

    // Add permissions
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    // Generate JWT
    const jwt = token.toJwt();

    // Return the token
    res.status(200).json({
      token: jwt
    });
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
}; 
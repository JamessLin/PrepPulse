import { Request, Response, NextFunction } from 'express';
import { createLiveKitToken, generateTestLiveKitToken } from '../services/livekitService';

// FIXME: Maybe dont need
interface AuthRequest extends Request {
  auth?: {
    userId: string;
  };
}

export async function getToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Use req.user from auth middleware
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const { room, peerId, matchId } = req.query;

    if (typeof room !== 'string') {
      res.status(400).json({ error: 'room query param required' });
      return;
    }

    const { token, url } = await createLiveKitToken({
      identity: userId,
      roomName: room,
      peerId:  typeof peerId === 'string' ? peerId : undefined,
      matchId: typeof matchId === 'string' ? matchId : undefined,
    });

    res.json({ token, url });
  } catch (err) {
    next(err);
  }
}

// NEW CONTROLLER FOR TEST TOKEN
export async function getTestToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.query.userId as string | undefined;
    const roomName = req.query.roomName as string | undefined;

    console.log(`Test token request received. UserID: ${userId}, RoomName: ${roomName}`);

    // Call the new service function
    const { token, roomName: actualRoomName, identity, livekitUrl } = await generateTestLiveKitToken({ identity: userId, roomName });
    
    res.json({ 
      token,
      url: livekitUrl, // Use the URL returned by the service
      roomName: actualRoomName, // Use the actual room name (might be generated)
      userId: identity // Use the actual identity (might be generated)
    });
  } catch (err) {
    console.error("[getTestToken Controller] Error:", err);
    // Forward error to the Express error handler
    next(err); 
  }
}

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(403).json({ error: 'Invalid token.' });
      return;
    }

    console.log('[auth middleware] Supabase user object:', user);

    // Check what ID you're getting
    console.log('[auth middleware] Using user ID:', user.id); // <-- Critical

    req.user = user;
    next();
  } catch (error) {
    console.error('[auth middleware] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

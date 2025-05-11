// auth.ts

import { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string /* plus any other fields you care about */ };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Make sure we actually got a Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    // 2) Create a Supabase client that forwards that header
    const supabase = createSupabaseClient(authHeader);

    // 3) Ask Supabase to decode & validate the user from the token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }

    // 4) Attach the user to the request and continue
    req.user = user;
    next();
  } catch (err: any) {
    console.error('[auth middleware] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

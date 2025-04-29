import {Request, Response, NextFunction} from 'express';
import { supabase } from '../client';

export interface AuthenticatedRequest extends Request {
    user: import("@supabase/supabase-js").User;
}

export async function authMiddleware(req:Request, res: Response, next:NextFunction){
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.split(' ')[1];
    const { data: {user}, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    (req as AuthenticatedRequest).user = user;
    next();
}
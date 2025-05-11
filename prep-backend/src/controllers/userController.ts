import { Request, Response } from 'express';
import { createSupabaseClient } from '../config/supabase';


export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    console.log('[getProfile] Requesting profile for user ID:', userId);

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', userId).maybeSingle();


    if (error) {
      console.error('[getProfile] Supabase error:', error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    if (!profile) {
      console.warn('[getProfile] No profile found for user ID:', userId);
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('[getProfile] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, avatarUrl, ...otherFields } = req.body;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        ...otherFields,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateProfile error object:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (error) {
    console.error('Unexpected updateProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
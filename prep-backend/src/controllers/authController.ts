import { Request, Response } from 'express';
import { createSupabaseClient } from '../config/supabase';



export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name: firstName, last_name: lastName } = req.body;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);
    
    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Register the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: 'Registration successful',
      user: data.user
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Token refreshed successfully',
      session: data.session
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Password reset email sent'
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization;
    const supabase = createSupabaseClient(authHeader);

    if (!password) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    // User will be available because of the authenticateToken middleware
    res.status(200).json({
      user: req.user
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
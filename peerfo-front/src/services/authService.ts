import { AuthFormData } from "@/lib/types";
import { supabase } from "@/lib/supabase";

/**
 * Authentication service that works with Supabase's built-in auth system
 */
export const authService = {
  /**
   * Check if a user is logged in based on the Supabase session
   */
  isLoggedIn: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  /**
   * Get the current user ID from Supabase session
   */
  getCurrentUserId: async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  },

  /**
   * Get the current user data from Supabase
   */
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Get the auth token
   */
  getToken: async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  /**
   * Register a new user with Supabase
   */
  register: async (userData: AuthFormData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  },

  /**
   * Login a user with Supabase
   */
  login: async (userData: AuthFormData) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  },

  /**
   * Login with Google OAuth
   */
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Login with GitHub OAuth
   */
  loginWithGitHub: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Logout the current user with Supabase
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  /**
   * Update user password
   */
  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }
};
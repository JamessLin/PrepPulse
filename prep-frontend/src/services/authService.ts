import { AuthFormData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Keys for consistent storage access
const TOKEN_KEY = 'sb-auth-token';
const USER_DATA_KEY = 'sb-user-data';

/**
 * Authentication service that works with Supabase's built-in auth system
 */
export const authService = {
  /**
   * Check if a user is logged in based on auth token
   */
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the current user ID from Supabase user data
   */
  getCurrentUserId: (): string | null => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      return user?.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  /**
   * Get the current user data
   */
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Get the auth token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Register a new user
   */
  register: async (userData: AuthFormData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  /**
   * Login a user
   */
  login: async (userData: AuthFormData) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store the auth token and user data
    if (data.session?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.session.access_token);
    }
    
    if (data.user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    }
    
    return data;
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Logout API error, continuing with local logout');
      }
    }

    // Clear auth data regardless of API success
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    
    return true;
  }
};
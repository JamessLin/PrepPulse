// Services for handling authentication API calls
import { AuthFormData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Authorization header name and prefix
const AUTH_HEADER = 'Authorization';
const TOKEN_PREFIX = 'Bearer ';

// LocalStorage keys
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Authentication service for handling API calls to the backend
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (userData: AuthFormData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Login a user
   */
  login: async (userData: AuthFormData) => {
    try {
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
      
      // Store token in localStorage
      if (data.session) {
        // Store session data
        authService.saveSession(data.session, data.user);
        console.log('Auth: Login successful, session saved');
      } else {
        console.error('Auth: Login response missing session data');
        throw new Error('Invalid login response from server');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Save session data to localStorage
   */
  saveSession: (session: any, user: any) => {
    try {
      if (!session || !session.access_token || !session.refresh_token) {
        console.error('Auth: Invalid session data', session);
        return false;
      }
      
      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
      
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      
      return true;
    } catch (error) {
      console.error('Auth: Failed to save session', error);
      return false;
    }
  },

  /**
   * Logout a user
   */
  logout: async () => {
    try {
      const token = authService.getToken();
      
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [AUTH_HEADER]: `${TOKEN_PREFIX}${token}`,
            },
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.warn('Logout warning:', data.error);
          }
        } catch (apiError) {
          console.warn('Logout API error:', apiError);
          // Continue with local logout even if API call fails
        }
      }
      
      // Clear localStorage regardless of response
      authService.clearSession();
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage even if there's an error
      authService.clearSession();
      return true;
    }
  },

  /**
   * Clear all session data from localStorage
   */
  clearSession: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return true;
    } catch (error) {
      console.error('Auth: Failed to clear session', error);
      return false;
    }
  },

  /**
   * Refresh the auth token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Clear invalid tokens
        if (response.status === 401) {
          authService.clearSession();
        }
        throw new Error(data.error || 'Token refresh failed');
      }
      
      // Update tokens in localStorage
      if (data.session) {
        authService.saveSession(data.session, data.user || authService.getCurrentUser());
        return data;
      } else {
        throw new Error('Invalid refresh response from server');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  /**
   * Request a password reset email
   */
  requestPasswordReset: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password reset request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  },

  /**
   * Get the current user
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Get auth token
   */
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders: () => {
    const token = authService.getToken();
    return token ? {
      [AUTH_HEADER]: `${TOKEN_PREFIX}${token}`
    } : {};
  },

  /**
   * Social auth
   */
  socialAuth: async (provider: string, accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/${provider.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `${provider} authentication failed`);
      }
      
      // Store token in localStorage
      if (data.session) {
        authService.saveSession(data.session, data.user);
      } else {
        throw new Error(`Invalid ${provider} auth response`);
      }
      
      return data;
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      throw error;
    }
  },



  
};
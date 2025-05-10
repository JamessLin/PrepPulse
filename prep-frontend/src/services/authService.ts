import { AuthFormData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Authorization header name and prefix
const AUTH_HEADER = 'Authorization';
const TOKEN_PREFIX = 'Bearer ';

// SessionStorage keys (will be prefixed with userId)
const TOKEN_KEY_BASE = 'authToken';
const REFRESH_TOKEN_KEY_BASE = 'refreshToken';
const USER_KEY_BASE = 'user';

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
          last_name: userData.lastName,
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

      // Store session data with userId
      if (data.session && data.user && data.user.id) {
        authService.saveSession(data.session, data.user, data.user.id);
        console.log('Auth: Login successful, session saved for user:', data.user.id);
      } else {
        console.error('Auth: Login response missing session or user data');
        throw new Error('Invalid login response from server');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Save session data to sessionStorage with userId prefix
   */
  saveSession: (session: any, user: any, userId: string) => {
    try {
      if (!session || !session.access_token || !session.refresh_token || !userId) {
        console.error('Auth: Invalid session or userId data', { session, userId });
        return false;
      }

      sessionStorage.setItem(`${TOKEN_KEY_BASE}_${userId}`, session.access_token);
      sessionStorage.setItem(`${REFRESH_TOKEN_KEY_BASE}_${userId}`, session.refresh_token);

      if (user) {
        sessionStorage.setItem(`${USER_KEY_BASE}_${userId}`, JSON.stringify(user));
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
  logout: async (userId: string) => {
    try {
      const token = authService.getToken(userId);

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

      // Clear session data for this userId
      authService.clearSession(userId);

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      authService.clearSession(userId);
      return true;
    }
  },

  /**
   * Clear session data for a specific user from sessionStorage
   */
  clearSession: (userId: string) => {
    try {
      sessionStorage.removeItem(`${TOKEN_KEY_BASE}_${userId}`);
      sessionStorage.removeItem(`${REFRESH_TOKEN_KEY_BASE}_${userId}`);
      sessionStorage.removeItem(`${USER_KEY_BASE}_${userId}`);
      return true;
    } catch (error) {
      console.error('Auth: Failed to clear session', error);
      return false;
    }
  },

  /**
   * Refresh the auth token
   */
  refreshToken: async (userId: string) => {
    try {
      const refreshToken = sessionStorage.getItem(`${REFRESH_TOKEN_KEY_BASE}_${userId}`);

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
        if (response.status === 401) {
          authService.clearSession(userId);
        }
        throw new Error(data.error || 'Token refresh failed');
      }

      if (data.session && data.user && data.user.id) {
        authService.saveSession(data.session, data.user, data.user.id);
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
  isAuthenticated: (userId?: string) => {
    const token = authService.getToken(userId || authService.getCurrentUserId());
    return !!token;
  },

  /**
   * Get the current user
   */
  getCurrentUser: (userId?: string) => {
    const id = userId || authService.getCurrentUserId();
    const userStr = sessionStorage.getItem(`${USER_KEY_BASE}_${id}`);
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
  getToken: (userId?: string) => {
    const id = userId || authService.getCurrentUserId();
    try {
      return sessionStorage.getItem(`${TOKEN_KEY_BASE}_${id}`);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders: (userId?: string) => {
    const token = authService.getToken(userId || authService.getCurrentUserId());
    if (!token) {
      console.warn('Auth: No token available for headers');
      return {};
    }
    
    return {
      [AUTH_HEADER]: `${TOKEN_PREFIX}${token}`
    };
  },

  /**
   * Get current userId from storage (first valid user if multiple exist)
   */
  getCurrentUserId: () => {
    const keys = Object.keys(sessionStorage);
    const userId = keys.find(key => key.startsWith(`${USER_KEY_BASE}_`))?.split('_')[1];
    return userId || undefined;
  },

  /**
   * Social auth
   */
  socialAuth: async (provider: string, accessToken: string, userId: string) => {
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

      if (data.session && data.user && data.user.id) {
        authService.saveSession(data.session, data.user, data.user.id);
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
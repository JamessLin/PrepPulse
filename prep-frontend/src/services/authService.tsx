// Services for handling authentication API calls
import { AuthFormData } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout a user
   */
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      // Clear localStorage regardless of response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (!response.ok) {
        console.warn('Logout warning:', data.error);
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return true;
    }
  },

  /**
   * Refresh the auth token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
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
        throw new Error(data.error || 'Token refresh failed');
      }
      
      // Update tokens in localStorage
      if (data.session) {
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }
      
      return data;
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
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get the current user
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
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
    return localStorage.getItem('token');
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
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      throw error;
    }
  },
};
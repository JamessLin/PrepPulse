import { authService } from './authService';
import { debugAuth } from './authDebug'; // Import the debug utility

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ScheduleResponse {
  scheduleId: string;
  scheduledTime: string;
  status?: string;
}

interface JoinInterviewResponse {
  sessionId: string;
  token: string;
  roomName: string;
}

interface ScheduleData {
  scheduledTime: string;
  interviewType?: string;
  interviewMode?: string;
  friendEmail?: string;
}

interface JoinableResponse {
  scheduleId: string;
  scheduledTime: string;
  status: string;
  interviewType: string;
  interviewMode: string;
  joinable: boolean;
  reason: string;
  timeRemaining: number;
  canJoinAt: string | null;
}

export const scheduleService = {
  createSchedule: async (
    scheduledTime: string,
    interviewType?: string,
    interviewMode?: string,
    friendEmail?: string
  ): Promise<ScheduleResponse> => {
    try {
      console.log('Creating schedule for time:', scheduledTime);
      console.log('Interview type:', interviewType);
      console.log('Interview mode:', interviewMode);
      console.log('Friend email:', friendEmail);

      // Run auth debug utility
      const isAuthenticated = debugAuth();

      // Get the current userId
      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user authenticated');
      }

      let token = authService.getToken(userId);
      if (!token) {
        try {
          console.log('No token available. Attempting to refresh...');
          await authService.refreshToken(userId);
          token = authService.getToken(userId);
          if (!token) {
            throw new Error('User not authenticated even after token refresh');
          }
          console.log('Token refresh successful');
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication required. Please log in again.');
        }
      }

      console.log('Sending schedule request with token:', token ? 'Token exists' : 'No token');

      const scheduleData = {
        scheduledTime,
        interviewType: interviewType || 'technical',
        interviewMode: interviewMode || 'peer-to-peer',
        friendEmail: friendEmail || null
      };

      const response = await fetch(`${API_URL}/schedules/create`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(userId),
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: JSON.stringify(scheduleData),
      });

      console.log('Schedule API response status:', response.status);

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed. Token may be invalid or expired.');
          authService.clearSession(userId);
          throw new Error('Your session has expired. Please log in again.');
        }

        throw new Error(data.error || `Failed to create schedule (Status: ${response.status})`);
      }

      return data;
    } catch (error: any) {
      console.error('Create schedule error:', error);
      throw error;
    }
  },

  getSchedule: async (scheduleId: string) => {
    try {
      debugAuth();

      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user authenticated');
      }

      const token = authService.getToken(userId);
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'GET',
        headers: {
          ...authService.getAuthHeaders(userId),
          'Content-Type': 'application/json',
        } as Record<string, string>,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get schedule details');
      }

      return data;
    } catch (error: any) {
      console.error('Get schedule error:', error);
      throw error;
    }
  },

  checkScheduleJoinable: async (scheduleId: string): Promise<JoinableResponse> => {
    try {
      debugAuth();

      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user authenticated');
      }

      const token = authService.getToken(userId);
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/${scheduleId}/joinable`, {
        method: 'GET',
        headers: {
          ...authService.getAuthHeaders(userId),
          'Content-Type': 'application/json',
        } as Record<string, string>,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check schedule joinability');
      }

      return data;
    } catch (error: any) {
      console.error('Check schedule joinable error:', error);
      throw error;
    }
  },

  joinInterview: async (scheduleId: string): Promise<{message: string, searchTimeoutSeconds: number}> => {
    try {
      debugAuth();

      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user authenticated');
      }

      const token = authService.getToken(userId);
      if (!token) {
        throw new Error('User not authenticated');
      }

      console.log('Joining interview with scheduleId:', scheduleId);

      const response = await fetch(`${API_URL}/schedules/join`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(userId),
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: JSON.stringify({ scheduleId }),
      });

      console.log('Join interview API response status:', response.status);
      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        // If we get information about timeRemaining, include it in the error
        if (data.timeRemaining) {
          throw new Error(`${data.error} (${data.timeRemaining} minutes remaining)`);
        }
        throw new Error(data.error || 'Failed to join interview');
      }

      // Update the schedule in localStorage
      const storedSchedules = localStorage.getItem('userSchedules');
      if (storedSchedules) {
        const schedules = JSON.parse(storedSchedules);
        const updatedSchedules = schedules.map((schedule: any) => {
          if (schedule.scheduleId === scheduleId) {
            return { ...schedule, status: 'searching' };
          }
          return schedule;
        });
        localStorage.setItem('userSchedules', JSON.stringify(updatedSchedules));
      }

      return {
        message: data.message || 'Joined matchmaking queue',
        searchTimeoutSeconds: data.searchTimeoutSeconds || 120
      };
    } catch (error: any) {
      console.error('Join interview error:', error);
      throw error;
    }
  },

  getUserSchedules: async () => {
    try {
      debugAuth();

      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user authenticated');
      }

      const token = authService.getToken(userId);
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/user`, {
        method: 'GET',
        headers: {
          ...authService.getAuthHeaders(userId),
          'Content-Type': 'application/json',
        } as Record<string, string>,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user schedules');
      }

      return data;
    } catch (error: any) {
      console.error('Get user schedules error:', error);
      throw error;
    }
  }
};
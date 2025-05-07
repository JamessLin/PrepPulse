import { authService } from './authService';
import { debugAuth } from './authDebug'; // Import the debug utility

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ScheduleResponse {
  scheduleId: string;
  scheduledTime: string;
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

export const scheduleService = {
  createSchedule: async (scheduledTime: string, interviewType?: string, interviewMode?: string, friendEmail?: string): Promise<ScheduleResponse> => {
    try {
      // Add debug output
      console.log('Creating schedule for time:', scheduledTime);
      console.log('Interview type:', interviewType);
      console.log('Interview mode:', interviewMode);
      console.log('Friend email:', friendEmail);
      
      // Run auth debug utility
      const isAuthenticated = debugAuth();
      
      const token = authService.getToken();
      if (!token) {
        // Try to refresh token if no token is available
        try {
          console.log('No token available. Attempting to refresh...');
          await authService.refreshToken();
          const newToken = authService.getToken();
          if (!newToken) {
            throw new Error('User not authenticated even after token refresh');
          }
          console.log('Token refresh successful');
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication required. Please log in again.');
        }
      }
      
      // Get token again (might be refreshed now)
      const currentToken = authService.getToken();
      
      // Prepare the data to send
      const scheduleData: ScheduleData = {
        scheduledTime
      };
      
      // Add interview type if provided
      if (interviewType) {
        scheduleData.interviewType = interviewType;
      }

      // Add interview mode if provided
      if (interviewMode) {
        scheduleData.interviewMode = interviewMode;
      }

      // Add friend email if provided
      if (friendEmail) {
        scheduleData.friendEmail = friendEmail;
      }

      console.log('Sending schedule request with token:', currentToken ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_URL}/schedules/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      console.log('Schedule API response status:', response.status);
      
      // Log full response for debugging
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      // Parse the response text back to JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        // Check for specific error conditions
        if (response.status === 401) {
          console.error('Authentication failed. Token may be invalid or expired.');
          
          // Clear invalid credentials and notify user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
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
      // Debug auth before making request
      debugAuth();
      
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  joinInterview: async (scheduleId: string): Promise<JoinInterviewResponse> => {
    try {
      // Debug auth before making request
      debugAuth();
      
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      console.log('Joining interview with scheduleId:', scheduleId);

      const response = await fetch(`${API_URL}/schedules/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

      if (response.status === 202) {
        throw new Error('Waiting for a match');
      }
      if (response.status === 408) {
        throw new Error('No match found within 2 minutes. Please reschedule.');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join interview');
      }

      return data as JoinInterviewResponse;
    } catch (error: any) {
      console.error('Join interview error:', error);
      throw error;
    }
  },
  
  getUserSchedules: async () => {
    try {
      // Debug auth before making request
      debugAuth();
      
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
  },
};
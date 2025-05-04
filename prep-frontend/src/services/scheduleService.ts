import { authService } from './authService';

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

export const scheduleService = {
  createSchedule: async (scheduledTime: string): Promise<ScheduleResponse> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledTime }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schedule');
      }

      return data;
    } catch (error: any) {
      console.error('Create schedule error:', error);
      throw error;
    }
  },

  joinInterview: async (scheduleId: string): Promise<JoinInterviewResponse> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/schedules/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleId }),
      });

      const data = await response.json();
      if (response.status === 202) {
        throw new Error('Waiting for a match');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join interview');
      }

      return data;
    } catch (error: any) {
      console.error('Join interview error:', error);
      throw error;
    }
  },
};
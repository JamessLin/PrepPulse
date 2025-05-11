import { authFetch, handleResponse, getApiUrl } from './apiUtils';

const API_URL = getApiUrl();

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

      const scheduleData = {
        scheduledTime,
        interviewType: interviewType || 'technical',
        interviewMode: interviewMode || 'peer-to-peer',
        friendEmail: friendEmail || null
      };

      const response = await authFetch(`${API_URL}/schedules/create`, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
      
      return await handleResponse<ScheduleResponse>(response);
    } catch (error: any) {
      console.error('Create schedule error:', error);
      throw error;
    }
  },

  getSchedule: async (scheduleId: string) => {
    try {
      const response = await authFetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'GET',
      });

      return await handleResponse(response);
    } catch (error: any) {
      console.error('Get schedule error:', error);
      throw error;
    }
  },

  checkScheduleJoinable: async (scheduleId: string): Promise<JoinableResponse> => {
    try {
      const response = await authFetch(`${API_URL}/schedules/${scheduleId}/joinable`, {
        method: 'GET',
      });

      return await handleResponse<JoinableResponse>(response);
    } catch (error: any) {
      console.error('Check schedule joinable error:', error);
      throw error;
    }
  },

  joinInterview: async (scheduleId: string): Promise<{message: string, searchTimeoutSeconds: number}> => {
    try {
      console.log('Joining interview with scheduleId:', scheduleId);

      const response = await authFetch(`${API_URL}/schedules/join`, {
        method: 'POST',
        body: JSON.stringify({ scheduleId }),
      });
      
      return await handleResponse<{message: string, searchTimeoutSeconds: number}>(response);
    } catch (error: any) {
      console.error('Join interview error:', error);
      throw error;
    }
  },

  getUserSchedules: async (forceRefresh = true) => {
    try {
      console.log('getUserSchedules called, forceRefresh:', forceRefresh);
      
      // Generate cache-busting query parameter if forcing refresh
      const cacheBuster = forceRefresh ? `?_=${Date.now()}` : '';
      
      // Make the API call to get schedules with cache busting
      const response = await authFetch(`${API_URL}/schedules/user${cacheBuster}`, {
        method: 'GET'
      });

      return await handleResponse<{schedules: any[]}>(response);
    } catch (error: any) {
      console.error('Get user schedules error:', error);
      throw error;
    }
  }
};
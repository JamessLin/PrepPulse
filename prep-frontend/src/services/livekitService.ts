import { authService } from './authService';
import { debugAuth } from './authDebug';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LiveKitTokenResponse {
  token: string;
}

export const livekitService = {
  /**
   * Get a LiveKit token for joining a room
   * @param roomName The name of the room to join
   * @param displayName The display name of the participant
   * @returns A JWT token for LiveKit authentication
   */
  getToken: async (roomName: string, displayName: string): Promise<string> => {
    try {
      debugAuth();

      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No user authenticated');
      }

      // Make sure we have a valid auth token
      const token = authService.getToken(userId);
      if (!token) {
        try {
          console.log('No token available. Attempting to refresh...');
          await authService.refreshToken(userId);
          if (!authService.getToken(userId)) {
            throw new Error('User not authenticated even after token refresh');
          }
          console.log('Token refresh successful');
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication required. Please log in again.');
        }
      }

      // Get auth headers and ensure it's a valid HeadersInit object
      const authHeaders = authService.getAuthHeaders(userId);
      
      // Request LiveKit token from the backend
      const response = await fetch(`${API_URL}/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders as Record<string, string>),
        },
        body: JSON.stringify({
          roomName,
          participantName: displayName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LiveKit token error response:', errorText);
        
        if (response.status === 401) {
          authService.clearSession(userId);
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error('Failed to get LiveKit token');
      }

      const data = await response.json() as LiveKitTokenResponse;
      return data.token;
    } catch (error: any) {
      console.error('Error getting LiveKit token:', error);
      throw error;
    }
  },

  /**
   * Get the LiveKit server URL based on environment
   * @returns The WebSocket URL for LiveKit server
   */
  getServerUrl: (): string => {
    // Use the environment variable if available, otherwise fall back to localhost for development
    return process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
  }
}; 
import { authService } from './authService';
import { authFetch, handleResponse, getApiUrl } from './apiUtils';

const API_URL = getApiUrl();

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

      const response = await authFetch(`${API_URL}/livekit/token`, {
        method: 'POST',
        body: JSON.stringify({
          roomName,
          participantName: displayName,
        }),
      });

      const data = await handleResponse<LiveKitTokenResponse>(response);
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
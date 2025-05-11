import { authService } from "./authService";
import { authFetch, handleResponse, getApiUrl } from './apiUtils';

const API_URL = getApiUrl();

/** Shape of a profile row coming from the /profiles table */
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  /** any extra columns you added in Supabase */
  [key: string]: any;
}

export const userService = {
  /**
   * GET /users/profile → returns the logged‑in user's profile row
   */
  async getProfile(): Promise<UserProfile> {
    const userId = authService.getCurrentUserId();
    if (!userId) {
      throw new Error('No user is authenticated');
    }
    
    const res = await authFetch(`${API_URL}/users/profile`, { method: 'GET' });
    const { profile } = await handleResponse<{ profile: UserProfile }>(res);
    
    return profile;
  },

  /**
   * PUT /users/profile → updates any fields you pass in the payload
   * (firstName, lastName, avatarUrl, …others)
   */
  async updateProfile(
    payload: Partial<{
      firstName: string;
      lastName: string;
      avatarUrl: string;
      [key: string]: any;
    }>
  ): Promise<UserProfile> {
    const userId = authService.getCurrentUserId();
    if (!userId) {
      throw new Error('No user is authenticated');
    }
    
    const res = await authFetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    
    const { profile } = await handleResponse<{ profile: UserProfile }>(res);
    
    return profile;
  }
};
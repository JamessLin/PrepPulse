import { authService } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const profileService = {
  /**
   * Fetches the current authenticated user's profile from the backend.
   */
  getProfile: async (): Promise<any> => {
    const token = authService.getToken();
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Profile fetch error:", errorText);
      throw new Error('Failed to fetch profile'); //FIXME: Handle error properly
    }

    const { profile } = await response.json();
    return profile;
  },

  /**
   * Updates the authenticated user's profile.
   */
  updateProfile: async (updates: any): Promise<any> => {
    const token = authService.getToken();
    if (!token) throw new Error("User is not authenticated");

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Profile update error:", errorText);
      throw new Error('Failed to update profile');
    }

    const { profile } = await response.json();
    return profile;
  },
};

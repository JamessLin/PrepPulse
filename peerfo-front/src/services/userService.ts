import { authService } from "./authService";
import { supabase } from '@/lib/supabase';
import { getApiUrl } from './apiUtils';

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
   * Fetch user profile directly from Supabase
   */
  async getProfile(): Promise<UserProfile> {
    // Get the current user ID from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      throw new Error('No user is authenticated');
    }
    
    // Fetch the profile from Supabase's profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      throw new Error(`Error fetching profile: ${error.message}`);
    }
    
    return data as UserProfile;
  },

  /**
   * Update user profile directly in Supabase
   */
  async updateProfile(
    payload: Partial<{
      firstName: string;
      lastName: string;
      avatarUrl: string;
      [key: string]: any;
    }>
  ): Promise<UserProfile> {
    // Get the current user ID from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      throw new Error('No user is authenticated');
    }
    
    // Format payload for database
    const profileData = {
      ...(payload.firstName && { first_name: payload.firstName }),
      ...(payload.lastName && { last_name: payload.lastName }),
      ...(payload.avatarUrl && { avatar_url: payload.avatarUrl }),
      updated_at: new Date().toISOString(),
    };
    
    // Update auth metadata
    if (payload.firstName || payload.lastName) {
      await supabase.auth.updateUser({
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
        }
      });
    }
    
    // Update the profile in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
    
    return data as UserProfile;
  }
};
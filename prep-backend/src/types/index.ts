export interface UserProfile {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface AuthResponse {
    user: any;
    session?: any;
    message?: string;
    error?: string;
  }
  
  export interface ProfileResponse {
    profile: UserProfile;
    message?: string;
    error?: string;
  }
import { authService } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';



/** Shape of a profile row coming from the /profiles table */
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  /** any extra columns you added in Supabase */
  [key: string]: any;
}

/**
 * Helper: parse the JSON body and throw if the request failed
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = (await response.json().catch(() => ({}))) as any;
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data;
};

/**
 * Helper: performs an authenticated fetch _once_.
 * If it comes back 401 we try a silent refresh() and retry exactly one time.
 */
const authFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...authService.getAuthHeaders(),
  };

  // first attempt
  let res = await fetch(input, { ...init, headers: { ...baseHeaders, ...init.headers } as HeadersInit });
  const resolvedUserId = authService.getCurrentUserId();
  // if our access token is expired, try to refresh & retry
  if (res.status === 401) {
    try {
      if (resolvedUserId) {
        await authService.refreshToken(resolvedUserId);
      }
      const retryHeaders = {
        ...baseHeaders,
        ...authService.getAuthHeaders(), // now contains the fresh token
        ...init.headers,
      };
      res = await fetch(input, { ...init, headers: retryHeaders as HeadersInit });
    } catch {
      // refresh failed – bubble the original 401 up
    }
  }

  return res;
};

export const userService = {
  /**
   * GET /users/profile → returns the logged‑in user’s profile row
   */
  async getProfile(): Promise<UserProfile> {
    const res = await authFetch(`${API_URL}/users/profile`, { method: 'GET' });
    const { profile } = await handleResponse<{ profile: UserProfile }>(res);

    // Optionally keep the fresh profile client‑side
    if (typeof window !== 'undefined' && profile) {
      localStorage.setItem('user', JSON.stringify(profile));
    }
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
    const res = await authFetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const { profile } = await handleResponse<{ profile: UserProfile }>(res);

    // Keep local copy in sync
    if (typeof window !== 'undefined' && profile) {
      localStorage.setItem('user', JSON.stringify(profile));
    }
    return profile;
  },
};
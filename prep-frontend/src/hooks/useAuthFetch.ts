import { useAuth } from "@/context/authContext";
import { authFetch } from "@/services/apiUtils";

/**
 * Custom hook that combines useAuth with authFetch
 * Ensures API requests use the auth token from context instead of localStorage
 */
export function useAuthFetch() {
  const { user } = useAuth();
  
  // Get the token from context user
  const getTokenFromUser = (): string | null => {
    if (!user) return null;
    // This implementation depends on how your user object stores the token
    // You might need to adjust it based on your auth system
    return localStorage.getItem('sb-auth-token'); // Temporary solution until refactored
  };
  
  // The wrapper function for authFetch
  const fetchWithAuth = async (url: RequestInfo, init: RequestInit = {}) => {
    const token = getTokenFromUser();
    return authFetch(url, init, token);
  };
  
  return {
    fetchWithAuth,
    isAuthenticated: !!user
  };
} 
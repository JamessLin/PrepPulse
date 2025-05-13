import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Parse JSON response and handle errors consistently
 */
export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // Try to get detailed error information from response
    try {
      const errorData = await response.json();
      // Return the exact error message or object from the server
      throw errorData.error || errorData || response.statusText || `Error ${response.status}`;
    } catch (e) {
      // If we can't parse JSON, return the raw text if possible
      throw e 
    }
  }
  
  try {
    // Handle empty response
    const text = await response.text();
    if (!text) return {} as T;
    
    // Parse JSON
    return JSON.parse(text) as T;
  } catch (e) {
    console.error('Failed to parse API response as JSON:', e);
    throw e; // Throw the actual error instead of a generic message
  }
};

/**
 * Simplified authenticated fetch - uses Supabase auth token
 */
export const authFetch = async (
  input: RequestInfo, 
  init: RequestInit = {}
): Promise<Response> => {
  try {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // Set up headers with auth token if available
    const headersObj: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    // Make the request
    const response = await fetch(input, { 
      ...init, 
      headers: headersObj,
      credentials: 'omit'
    });
    
    return response;
  } catch (error) {
    console.error('Network error in authFetch:', error);
    throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
  }
};

/**
 * Get base API URL
 */
export const getApiUrl = (): string => {
  return API_URL;
};
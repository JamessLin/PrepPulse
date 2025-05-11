import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

/**
 * Creates a Supabase client instance forwarding the Authorization header
 * @param authToken The Bearer token from the incoming request (e.g. req.headers.authorization)
 * @returns A SupabaseClient scoped to the authenticated user
 */
export function createSupabaseClient(authToken?: string): SupabaseClient {
  // If the header includes "Bearer <token>", use it directly;
  // otherwise assume authToken is already the token
  const authorization = authToken?.startsWith('Bearer')
    ? authToken
    : authToken
    ? `Bearer ${authToken}`
    : undefined;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        ...(authorization && { Authorization: authorization }),
      },
    },
  });
}

// For unauthenticated, admin, or other use-cases, you can still import an anonymous client:
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

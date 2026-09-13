import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { runtimeConfig, checkIsSupabaseConfigured } from '../config/runtimeConfig';

export const isSupabaseConfigured = checkIsSupabaseConfigured();
const { url: supabaseUrl, anonKey: supabaseAnonKey } = runtimeConfig.supabase;

/**
 * Data-Only Supabase Client for Public Catalogue Reads.
 *
 * NOTE: Authentication and identity in TerroirTrail are authoritative exclusively
 * in Firebase Auth. The Supabase client must NEVER maintain a secondary auth session.
 * Auth session persistence, background token refreshes, and URL hash session detection
 * are strictly disabled.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;


import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Real Supabase client, or null when VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
 * are not set. Every caller (auth, Persona Health services, SERA chat) must
 * handle the null case explicitly — see docs/AI_ARCHITECTURE.md and
 * docs/SECURITY.md for how the rest of the app stays usable without a
 * backend configured (Phase 24: no single AI/backend dependency should be
 * able to take the whole app down).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

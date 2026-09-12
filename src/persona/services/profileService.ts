import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

// Mirrors the `profiles` table from Persona Health's Supabase schema
// (see supabase/migrations/). Kept as a hand-written interface rather than
// generated types since no live project exists yet to generate them from.
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  register_number: string | null;
  department: string | null;
  class: string | null;
  section: string | null;
  registration_completed: boolean | null;
  provider: string | null;
  created_at?: string;
  updated_at?: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data as UserProfile;
  },

  async syncProfileFromOAuth(user: User): Promise<UserProfile | null> {
    if (!supabase) return null;
    const provider = user.identities?.[0]?.provider ?? null;
    const fullName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email?.split('@')[0] || '';
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        provider,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) return null;
    return data as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) return null;
    return data as UserProfile;
  },
};

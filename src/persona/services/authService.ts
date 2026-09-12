import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

export type OAuthProvider = 'github' | 'google';

export interface AuthResult {
  error: AuthError | Error | null;
}

const NOT_CONFIGURED = new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing)');

/**
 * Persona Health's auth surface, ported onto the shared nullable Supabase
 * client (src/lib/supabaseClient.ts). Every call degrades to a clear error
 * instead of throwing at import time when Supabase isn't configured yet —
 * see docs/SECURITY.md and docs/AI_ARCHITECTURE.md for why the original's
 * hard `throw` on missing env vars was replaced with graceful checks.
 */
export const authService = {
  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResult> {
    if (!supabase) return { error: NOT_CONFIGURED };
    const redirectUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        ...(provider === 'github' && { scopes: 'user:email,read:user' }),
        ...(provider === 'google' && { scopes: 'profile email openid' }),
      },
    });
    return { error };
  },

  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async signOut(): Promise<AuthResult> {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (!supabase) return { unsubscribe() {} };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return subscription;
  },
};

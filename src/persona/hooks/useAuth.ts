import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { authService } from '../services/authService';
import { profileService, type UserProfile } from '../services/profileService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    authService.getSession().then((existingSession) => {
      if (!isMounted) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
      if (existingSession?.user) {
        profileService.syncProfileFromOAuth(existingSession.user).then((p) => isMounted && setProfile(p));
      }
    });

    const subscription = authService.onAuthStateChange((newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      if (newSession?.user) {
        profileService.syncProfileFromOAuth(newSession.user).then((p) => isMounted && setProfile(p));
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    setProfile(await profileService.getProfile(user.id));
  };

  return { user, session, profile, loading, signOut, refreshProfile, isAuthenticated: !!session && !!user };
}

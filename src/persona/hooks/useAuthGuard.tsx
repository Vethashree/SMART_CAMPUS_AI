import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './useAuth';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  );
}

function NotConfiguredNotice() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h2 className="text-xl font-semibold text-white mb-2">Persona Health backend isn't connected yet</h2>
      <p className="text-slate-400 text-sm">
        Set <code className="text-slate-300">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-slate-300">VITE_SUPABASE_PUBLISHABLE_KEY</code> to enable authentication, the wellness
        assessment and the institute dashboard.
      </p>
    </div>
  );
}

export function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;
  if (loading) return <LoadingScreen />;
  if (!session || !user) {
    return <Navigate to={requireAdmin ? '/persona/institute-login' : '/persona/auth'} state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export function PublicRoute({ children, redirectTo = '/persona' }: { children: ReactNode; redirectTo?: string }) {
  const { user, loading, session } = useAuth();

  if (loading) return <LoadingScreen />;
  if (session && user) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}

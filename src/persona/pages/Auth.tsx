import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Github, Mail } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { authService } from '../services/authService';
import { logUserLogin } from '../services/scoreService';
import PersonaShell from '../components/PersonaShell';

type Mode = 'signin' | 'signup';

async function checkRegistrationStatus(userId: string): Promise<string> {
  if (!supabase) return '/persona';
  const { data: profile } = await supabase.from('profiles').select('registration_completed').eq('id', userId).single();
  return profile && !profile.registration_completed ? '/persona/register' : '/persona';
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        const path = await checkRegistrationStatus(data.session.user.id);
        navigate(path, { replace: true });
        return;
      }
      setChecking(false);
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.session) await logUserLogin(data.session.user.id);
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const path = await checkRegistrationStatus(sessionData.session.user.id);
        navigate(path, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    const { error: oauthError } = await authService.signInWithOAuth(provider);
    if (oauthError) {
      setError(oauthError.message);
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <PersonaShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </PersonaShell>
    );
  }

  return (
    <PersonaShell>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-1">{mode === 'signin' ? 'Student Login' : 'Create Account'}</h1>
          <p className="text-sm text-slate-400 text-center mb-6">Access your wellness journey</p>

          {!isSupabaseConfigured && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              Supabase isn't configured — sign-in is disabled until VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are set.
            </p>
          )}
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">{error}</p>}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || !isSupabaseConfigured}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !isSupabaseConfigured}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" disabled={isLoading || !isSupabaseConfigured} className="btn-primary w-full py-2.5 disabled:opacity-50">
              {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="w-full text-sm text-blue-400 hover:text-blue-300 mt-3"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleOAuth('github')} disabled={isLoading || !isSupabaseConfigured} className="btn-secondary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button onClick={() => handleOAuth('google')} disabled={isLoading || !isSupabaseConfigured} className="btn-secondary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              <Mail className="w-4 h-4" /> Google
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 space-y-2 text-center">
            <button onClick={() => navigate('/persona/register-number')} className="text-sm text-slate-400 hover:text-white block w-full">
              Sign in with your registration number instead
            </button>
            <button onClick={() => navigate('/persona/institute-login')} className="text-sm text-slate-400 hover:text-white block w-full">
              Institute / admin login
            </button>
          </div>
        </div>
      </div>
    </PersonaShell>
  );
}

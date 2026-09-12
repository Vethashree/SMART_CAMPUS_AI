import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import PersonaShell from '../components/PersonaShell';

type Mode = 'signin' | 'signup';

export default function RegisterNumberAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [form, setForm] = useState({ registerNumber: '', password: '', confirmPassword: '' });

  const validate = (): string | null => {
    if (!form.registerNumber.trim()) return 'Please enter your registration number';
    if (form.registerNumber.length < 5) return 'Registration number must be at least 5 characters';
    if (!form.password) return 'Please enter your password';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (mode === 'signup' && form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfo(null);

    // Registration-number-to-synthetic-email mapping, preserved exactly from
    // Persona Health: <sanitized register number>@persona.app.
    const cleanRegNum = form.registerNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanRegNum}@persona.app`;

    try {
      if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: form.password,
          options: { data: { register_number: form.registerNumber.toUpperCase() } },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: form.password });
            if (signInError) {
              setError('Account already exists. Please sign in or use a different registration number.');
              setIsLoading(false);
              return;
            }
            navigate('/persona/register', { replace: true });
            return;
          }
          throw signUpError;
        }

        if (signUpData.user && !signUpData.session) {
          setError('Email verification is enabled for this project — disable it in Supabase to allow direct signup.');
          setIsLoading(false);
          return;
        }

        if (signUpData.session) {
          await supabase.from('profiles').upsert({
            id: signUpData.user!.id,
            email,
            register_number: form.registerNumber.toUpperCase(),
            registration_completed: false,
            updated_at: new Date().toISOString(),
          });
          navigate('/persona/register', { replace: true });
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: form.password });
        if (signInError) {
          setError(
            signInError.message.includes('Invalid login credentials')
              ? 'Invalid registration number or password'
              : signInError.message
          );
          setIsLoading(false);
          return;
        }
        if (!signInData.session) {
          setError('Failed to establish session');
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('registration_completed')
          .eq('register_number', form.registerNumber.toUpperCase())
          .single();

        navigate(!profile || !profile.registration_completed ? '/persona/register' : '/persona', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PersonaShell>
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/persona/auth')} className="text-sm text-slate-400 hover:text-white mb-6">
          ← Back to Login
        </button>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-1">{mode === 'signin' ? 'Student Login' : 'Student Sign Up'}</h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            {mode === 'signin' ? 'Login with your registration number' : 'Create your account with your registration number'}
          </p>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">{error}</p>}
          {info && <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">{info}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Registration Number</label>
              <input
                type="text"
                placeholder="e.g., REG123456"
                value={form.registerNumber}
                onChange={(e) => setForm((p) => ({ ...p, registerNumber: e.target.value }))}
                disabled={isLoading || !isSupabaseConfigured}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Must be at least 5 characters</p>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  disabled={isLoading || !isSupabaseConfigured}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  disabled={isLoading || !isSupabaseConfigured}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button type="submit" disabled={isLoading || !isSupabaseConfigured} className="btn-primary w-full py-2.5 disabled:opacity-50">
              {isLoading ? (mode === 'signin' ? 'Logging in...' : 'Creating Account...') : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setForm({ registerNumber: '', password: '', confirmPassword: '' });
              setError(null);
            }}
            className="w-full text-sm text-blue-400 hover:text-blue-300 mt-4"
          >
            {mode === 'signin' ? 'Sign Up Instead' : 'Sign In Instead'}
          </button>
        </div>
      </div>
    </PersonaShell>
  );
}

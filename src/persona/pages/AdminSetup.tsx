import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import PersonaShell from '../components/PersonaShell';

// The original Persona Health build hardcoded a real-looking admin email and
// password directly in this file (shipped to the browser bundle). That's a
// credential-exposure issue (Phase 26 of the SERA build brief), so bootstrap
// credentials here come from env vars instead — see .env.example — and the
// page tells the operator to set them rather than silently failing.
const ADMIN_EMAIL = import.meta.env.VITE_SERA_ADMIN_BOOTSTRAP_EMAIL as string | undefined;
const ADMIN_PASSWORD = import.meta.env.VITE_SERA_ADMIN_BOOTSTRAP_PASSWORD as string | undefined;

export default function AdminSetup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const ensureAdminRole = async (userId: string) => {
    if (!supabase) return;
    const { data: existing } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').single();
    if (existing) return;

    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    if (error) {
      const { error: upsertError } = await supabase.from('user_roles').upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });
      if (upsertError) throw new Error('Failed to assign admin role. Apply the RLS policies in supabase/migrations/ first.');
    }
  };

  const setupAdminAccount = async () => {
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase is not configured.');
      return;
    }
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      setStatus('error');
      setMessage('Set VITE_SERA_ADMIN_BOOTSTRAP_EMAIL and VITE_SERA_ADMIN_BOOTSTRAP_PASSWORD before running this.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: { data: { full_name: 'Institute Admin' } },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
          if (signInError) throw signInError;
          await ensureAdminRole(signInData.user.id);
          await supabase.auth.signOut();
          setStatus('success');
          setMessage('Admin account verified and ready. You can now login with the institutional credentials.');
          return;
        }
        throw signUpError;
      }

      if (!signUpData.user) throw new Error('Failed to create user');
      await ensureAdminRole(signUpData.user.id);
      await supabase.auth.signOut();
      setStatus('success');
      setMessage('Admin account created successfully! You can now login with the institutional credentials.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to setup admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PersonaShell>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-xl font-bold text-white text-center mb-1">Admin Account Setup</h1>
          <p className="text-sm text-slate-400 text-center mb-6">Create or verify the institutional admin account</p>

          <div className="bg-slate-700/40 rounded-lg p-4 mb-4 text-sm text-slate-300 space-y-1">
            <p className="font-medium text-white">Bootstrap credentials (from environment):</p>
            <p>Email: <code className="text-slate-200">{ADMIN_EMAIL ?? 'not set'}</code></p>
            <p>Password: <code className="text-slate-200">{ADMIN_PASSWORD ? '••••••••' : 'not set'}</code></p>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-300">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <XCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-300">{message}</p>
            </div>
          )}

          <button onClick={setupAdminAccount} disabled={isLoading} className="btn-primary w-full py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Setting up...' : 'Setup Admin Account'}
          </button>

          {status === 'success' && (
            <button onClick={() => navigate('/persona/institute-login')} className="btn-secondary w-full py-2.5 mt-3">
              Go to Institute Login
            </button>
          )}

          <button onClick={() => navigate('/persona')} className="w-full text-sm text-slate-400 hover:text-white mt-6 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </div>
    </PersonaShell>
  );
}

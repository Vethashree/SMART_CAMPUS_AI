import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import PersonaShell from '../components/PersonaShell';

export default function InstituteLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        setError('Access denied. Admin privileges required.');
        setIsLoading(false);
        return;
      }

      navigate('/persona/institute-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PersonaShell>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-1">Institute Login</h1>
          <p className="text-sm text-slate-400 text-center mb-6">Access student assessment results (Admin only)</p>

          {!isSupabaseConfigured && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              Supabase isn't configured yet.
            </p>
          )}
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button type="submit" disabled={isLoading || !isSupabaseConfigured} className="btn-primary w-full py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Login as Institute
            </button>
          </form>

          <button onClick={() => navigate('/persona/auth')} className="w-full text-sm text-slate-400 hover:text-white mt-6">
            ← Back to Student Login
          </button>
        </div>
      </div>
    </PersonaShell>
  );
}

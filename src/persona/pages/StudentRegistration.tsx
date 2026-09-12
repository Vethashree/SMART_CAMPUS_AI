import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PersonaShell from '../components/PersonaShell';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biomedical Engineering',
  'Information Technology',
  'Aerospace Engineering',
  'Artificial Intelligence & Machine Learning',
  'Artificial Intelligence and Data Science',
  'Other',
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', registerNumber: '', department: '', year: '', semester: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const metadataRegNum = user.user_metadata?.register_number as string | undefined;
      if (metadataRegNum) setForm((p) => ({ ...p, registerNumber: metadataRegNum }));

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setForm((p) => ({
          ...p,
          fullName: profile.full_name || '',
          registerNumber: profile.register_number || metadataRegNum || '',
          department: profile.department || '',
          year: profile.class || '',
          semester: profile.section || '',
        }));
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.registerNumber.trim() || !form.department || !form.year || !form.semester) {
      setError('Please fill in every field.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/persona/auth', { replace: true });
        return;
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: form.fullName,
        register_number: form.registerNumber,
        department: form.department,
        class: form.year,
        section: form.semester,
        registration_completed: true,
        updated_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;

      navigate('/persona', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <PersonaShell>
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/persona/auth')} className="text-sm text-slate-400 hover:text-white mb-6">
          ← Back to Login
        </button>
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-1">Complete Your Profile</h1>
          <p className="text-sm text-slate-400 text-center mb-6">Add your academic details to access Persona</p>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} disabled={isLoading} className={selectClass} required />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Registration Number *</label>
              <input name="registerNumber" value={form.registerNumber} onChange={handleChange} disabled={isLoading} className={selectClass} required />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} disabled={isLoading} className={selectClass} required>
                <option value="">Select your department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Year *</label>
              <select name="year" value={form.year} onChange={handleChange} disabled={isLoading} className={selectClass} required>
                <option value="">Select your year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Semester *</label>
              <select name="semester" value={form.semester} onChange={handleChange} disabled={isLoading} className={selectClass} required>
                <option value="">Select your semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 disabled:opacity-50 mt-2">
              {isLoading ? 'Saving...' : 'Complete Registration'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">* All fields are required</p>
        </div>
      </div>
    </PersonaShell>
  );
}

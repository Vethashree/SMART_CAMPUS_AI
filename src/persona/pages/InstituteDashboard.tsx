import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Search, RefreshCw, Activity, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import PersonaShell from '../components/PersonaShell';

interface StudentScoreRow {
  id: string;
  user_id: string;
  stress_score: number;
  anxiety_score: number;
  depression_score: number;
  created_at: string;
  full_name: string | null;
  department: string | null;
  year: string | null;
  section: string | null;
  register_number: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  register_number: string | null;
  department: string | null;
  class: string | null;
  section: string | null;
}

function getTotalSeverity(total: number) {
  if (total <= 20) return { level: 'Low Risk', color: 'text-green-400' };
  if (total <= 40) return { level: 'Moderate Risk', color: 'text-yellow-400' };
  if (total <= 60) return { level: 'High Risk', color: 'text-orange-400' };
  return { level: 'Critical', color: 'text-red-400 font-bold' };
}

export default function InstituteDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [scores, setScores] = useState<StudentScoreRow[]>([]);
  const [filtered, setFiltered] = useState<StudentScoreRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    const { data: scoresData } = await supabase.from('student_scores').select('*').order('created_at', { ascending: false });
    const { data: profilesData } = await supabase.from('profiles').select('id, full_name, register_number, department, class, section');

    const profileMap = new Map<string, ProfileRow>();
    (profilesData as ProfileRow[] | null)?.forEach((p) => profileMap.set(p.id, p));

    const enriched: StudentScoreRow[] = ((scoresData as StudentScoreRow[]) ?? []).map((score) => {
      const profile = profileMap.get(score.user_id);
      return {
        ...score,
        full_name: score.full_name || profile?.full_name || null,
        register_number: score.register_number || profile?.register_number || null,
        department: score.department || profile?.department || null,
        year: score.year || profile?.class || null,
        section: score.section || profile?.section || null,
      };
    });

    setScores(enriched);
    setFiltered(enriched);
    setLastUpdated(new Date());
    setDepartments([...new Set(enriched.map((s) => s.department).filter(Boolean))] as string[]);
    setYears([...new Set(enriched.map((s) => s.year).filter(Boolean))] as string[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !supabase) return;
    if (!user) {
      navigate('/persona/institute-login');
      return;
    }

    let unsubscribed = false;
    const setup = async () => {
      const { data: roleData, error: roleError } = await supabase!
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        await supabase!.auth.signOut();
        navigate('/persona/institute-login');
        return;
      }
      if (unsubscribed) return;

      setIsAdmin(true);
      await fetchData();

      const channel = supabase!
        .channel('student_scores_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_scores' }, async () => {
          setIsLive(true);
          await fetchData();
          setTimeout(() => setIsLive(false), 3000);
        })
        .subscribe();

      return () => {
        supabase!.removeChannel(channel);
      };
    };

    const cleanup = setup();
    return () => {
      unsubscribed = true;
      cleanup.then((fn) => fn?.());
    };
  }, [user, authLoading, navigate, fetchData]);

  useEffect(() => {
    let result = [...scores];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.register_number?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q) ||
          s.user_id.toLowerCase().includes(q)
      );
    }
    if (departmentFilter !== 'all') result = result.filter((s) => s.department === departmentFilter);
    if (yearFilter !== 'all') result = result.filter((s) => s.year === yearFilter);
    if (severityFilter !== 'all') {
      result = result.filter((s) => {
        const total = s.stress_score + s.anxiety_score + s.depression_score;
        if (severityFilter === 'critical') return total > 60;
        if (severityFilter === 'high') return total > 40 && total <= 60;
        if (severityFilter === 'moderate') return total > 20 && total <= 40;
        return total <= 20;
      });
    }
    setFiltered(result);
  }, [searchQuery, departmentFilter, yearFilter, severityFilter, scores]);

  const exportToCSV = () => {
    const headers = ['Date', 'Register No', 'Name', 'Department', 'Year', 'Stress', 'Anxiety', 'Depression', 'Total'];
    const rows = filtered.map((s) => [
      new Date(s.created_at).toLocaleDateString(),
      s.register_number || '-',
      s.full_name || '-',
      s.department || '-',
      s.year || '-',
      s.stress_score,
      s.anxiety_score,
      s.depression_score,
      s.stress_score + s.anxiety_score + s.depression_score,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_scores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalStudents = scores.length;
  const criticalCases = scores.filter((s) => s.stress_score + s.anxiety_score + s.depression_score > 60).length;
  const avgTotal = totalStudents > 0 ? Math.round(scores.reduce((sum, s) => sum + s.stress_score + s.anxiety_score + s.depression_score, 0) / totalStudents) : 0;

  const selectClass = 'bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white';

  if (authLoading || !isAdmin) {
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
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Institute Dashboard</h1>
            <p className="text-sm text-slate-400">Real-time student assessment monitoring</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${isLive ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
              <Activity className="w-3.5 h-3.5" /> {isLive ? 'Live Update!' : 'Real-time'}
            </div>
            <button onClick={fetchData} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={exportToCSV} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => signOut().then(() => navigate('/persona'))} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-blue-500">
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1"><Users className="w-3.5 h-3.5" /> Total Records</p>
            <p className="text-2xl font-bold text-blue-400">{totalStudents}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-red-500">
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Critical Cases</p>
            <p className="text-2xl font-bold text-red-400">{criticalCases}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-purple-500">
            <p className="text-xs text-slate-400 mb-1">Avg Total Score</p>
            <p className="text-2xl font-bold text-purple-400">{avgTotal}/126</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-green-500">
            <p className="text-xs text-slate-400 mb-1">Last Updated</p>
            <p className="text-sm font-semibold text-green-400">{lastUpdated?.toLocaleTimeString() ?? '-'}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              placeholder="Search name, register no, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white"
            />
          </div>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={selectClass}>
            <option value="all">All Depts</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className={selectClass}>
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={selectClass}>
            <option value="all">All Levels</option>
            <option value="critical">Critical (&gt;60)</option>
            <option value="high">High (41-60)</option>
            <option value="moderate">Moderate (21-40)</option>
            <option value="low">Low (≤20)</option>
          </select>
          <span className="text-xs text-slate-500">Showing {filtered.length} of {scores.length}</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-800/50 p-12 rounded-xl border border-slate-700 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3" />
            {scores.length === 0 ? 'No student scores yet. Scores will appear here when students complete the game.' : 'No results match your filters.'}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-400">
                  <th className="p-3 whitespace-nowrap">Date</th>
                  <th className="p-3 whitespace-nowrap">Register No.</th>
                  <th className="p-3 whitespace-nowrap">Name</th>
                  <th className="p-3 whitespace-nowrap">Department</th>
                  <th className="p-3 whitespace-nowrap text-center">Stress</th>
                  <th className="p-3 whitespace-nowrap text-center">Anxiety</th>
                  <th className="p-3 whitespace-nowrap text-center">Depression</th>
                  <th className="p-3 whitespace-nowrap text-center">Total</th>
                  <th className="p-3 whitespace-nowrap text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((score) => {
                  const total = score.stress_score + score.anxiety_score + score.depression_score;
                  const severity = getTotalSeverity(total);
                  return (
                    <tr key={score.id} className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${total > 60 ? 'border-l-4 border-l-red-500' : ''}`}>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{new Date(score.created_at).toLocaleDateString()}</td>
                      <td className="p-3 font-mono text-slate-300">{score.register_number || '-'}</td>
                      <td className="p-3 text-white max-w-[150px] truncate">{score.full_name || 'Unknown'}</td>
                      <td className="p-3 text-slate-300">{score.department || '-'}</td>
                      <td className="p-3 text-center text-white font-semibold">{score.stress_score}</td>
                      <td className="p-3 text-center text-white font-semibold">{score.anxiety_score}</td>
                      <td className="p-3 text-center text-white font-semibold">{score.depression_score}</td>
                      <td className="p-3 text-center font-bold text-white">{total}/126</td>
                      <td className={`p-3 text-center font-medium ${severity.color}`}>
                        {total > 60 && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
                        {severity.level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PersonaShell>
  );
}

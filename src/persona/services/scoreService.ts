import { supabase } from '../../lib/supabaseClient';

export interface ScoreData {
  userId: string;
  stressScore: number;
  anxietyScore: number;
  depressionScore: number;
  fullName?: string | null;
  department?: string | null;
  year?: string | null;
  section?: string | null;
  registerNumber?: string | null;
}

export interface StudentScoreRow {
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

export async function logUserLogin(userId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('user_login_logs').insert({
    user_id: userId,
    login_timestamp: new Date().toISOString(),
    device_agent: navigator.userAgent,
    session_id: Date.now().toString(),
  });
}

export async function saveUserScore(data: ScoreData): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) return { success: false, error: new Error('Supabase is not configured') };

  const coreRecord = {
    user_id: data.userId,
    stress_score: Math.round(data.stressScore),
    anxiety_score: Math.round(data.anxietyScore),
    depression_score: Math.round(data.depressionScore),
  };

  const { data: result, error } = await supabase.from('student_scores').insert(coreRecord).select();
  if (error) return { success: false, error };

  const rowId = result?.[0]?.id;
  if (rowId) {
    const extra: Record<string, string> = {};
    if (data.fullName) extra.full_name = data.fullName;
    if (data.department) extra.department = data.department;
    if (data.year) extra.year = data.year;
    if (data.section) extra.section = data.section;
    if (data.registerNumber) extra.register_number = data.registerNumber;
    if (Object.keys(extra).length > 0) {
      await supabase.from('student_scores').update(extra).eq('id', rowId);
    }
  }

  return { success: true, error: null };
}

export async function getUserScoreHistory(userId: string): Promise<StudentScoreRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('student_scores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data as StudentScoreRow[]) ?? [];
}

export async function getAllScores(): Promise<StudentScoreRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('student_scores').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data as StudentScoreRow[]) ?? [];
}

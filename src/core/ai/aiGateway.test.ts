import { describe, expect, it } from 'vitest';
import { getSeraReply } from './aiGateway';
import { buildStudentContext } from '../context/buildStudentContext';

describe('getSeraReply fallback behavior', () => {
  it('falls back to a deterministic, explainable reply when Supabase is not configured', async () => {
    // No VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are set in the test env,
    // so isSupabaseConfigured is false and the edge function is never called.
    const context = buildStudentContext();
    const result = await getSeraReply([{ role: 'user', content: 'What should I do next?' }], context);

    expect(result.source).toBe('fallback');
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.text).toContain('Next Best Actions');
  });
});

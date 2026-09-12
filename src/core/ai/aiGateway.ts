import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { explainWhy } from '../recommendation/explanationEngine';
import { generateRecommendations } from '../recommendation/recommendationEngine';
import type { StudentContext } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIReplyResult {
  text: string;
  source: 'ai' | 'fallback';
}

function summarizeContextForPrompt(context: StudentContext) {
  return {
    profile: context.profile,
    now: context.now.toISOString(),
    upcomingClasses: context.timetable.slice(0, 5),
    activeGoals: context.studyGoals.map((g) => ({ subject: g.subject, priority: g.priority, examInDays: g.examInDays })),
    topNotices: context.notices.slice(0, 3).map((n) => n.title),
  };
}

async function callSeraChatEdgeFunction(messages: ChatMessage[], context: StudentContext): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.functions.invoke('sera-chat', {
    body: { messages, context: summarizeContextForPrompt(context) },
  });
  if (error) throw error;
  const text = data?.reply ?? data?.text ?? '';
  if (!text) throw new Error('Empty response from sera-chat');
  return text;
}

/**
 * Deterministic, no-network fallback used whenever the AI gateway is not
 * configured or fails (Phase 24). It still gives a useful, explainable
 * answer by reusing the same recommendation engine the dashboard uses — the
 * product does not go blank just because an AI call didn't work.
 */
function fallbackReply(context: StudentContext): string {
  const [top] = generateRecommendations(context, 1);
  if (!top) {
    return "I don't have enough context yet to suggest something specific. Once your timetable and preferences are set, I'll be able to help.";
  }
  return `${explainWhy(top)} You can also see this in your Next Best Actions.`;
}

/**
 * Single entry point for SERA chat (Phase 17, 23, 24). Swappable by design:
 * which AI provider sits behind supabase/functions/sera-chat is a deployment
 * decision, not something this frontend hardcodes — see docs/AI_ARCHITECTURE.md.
 */
export async function getSeraReply(messages: ChatMessage[], context: StudentContext): Promise<AIReplyResult> {
  if (isSupabaseConfigured) {
    try {
      const text = await callSeraChatEdgeFunction(messages, context);
      return { text, source: 'ai' };
    } catch {
      // AI gateway unavailable/misconfigured — degrade to the deterministic fallback below.
    }
  }
  return { text: fallbackReply(context), source: 'fallback' };
}

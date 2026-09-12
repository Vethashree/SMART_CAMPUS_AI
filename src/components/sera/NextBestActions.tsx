import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, BookOpen, Brain, Bell, Sparkles } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { buildStudentContext } from '../../core/context/buildStudentContext';
import { explainWhy } from '../../core/recommendation/explanationEngine';
import { generateRecommendations } from '../../core/recommendation/recommendationEngine';
import { applyFeedback, recordFeedback } from '../../core/recommendation/preferenceLearning';
import type { Recommendation, RecommendationFeedbackReason } from '../../core/types';

const CATEGORY_ICON: Record<Recommendation['category'], typeof BookOpen> = {
  study: BookOpen,
  library: BookOpen,
  travel: MapPin,
  notice: Bell,
  wellness: Sparkles,
  academic: Brain,
};

const PRIORITY_STYLE: Record<Recommendation['priority'], string> = {
  high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  medium: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  low: 'border-slate-600 bg-slate-700/30 text-slate-300',
};

const FEEDBACK_OPTIONS: { label: string; reason: RecommendationFeedbackReason }[] = [
  { label: 'Not relevant', reason: 'not-relevant' },
  { label: 'Too far', reason: 'too-far' },
  { label: 'Too crowded', reason: 'too-crowded' },
  { label: "Don't recommend this again", reason: 'dont-recommend-again' },
];

export default function NextBestActions() {
  const { currentUser } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    const context = buildStudentContext({ name: currentUser.name });
    return generateRecommendations(context);
    // refreshKey forces recomputation after feedback changes stored preferences.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.name, refreshKey]);

  const handleFeedback = (rec: Recommendation, reason: RecommendationFeedbackReason) => {
    applyFeedback(rec, reason);
    recordFeedback({ recommendationId: rec.id, category: rec.category, reason, timestamp: new Date().toISOString() });
    setRefreshKey((k) => k + 1);
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center text-slate-400">
        No pending actions right now — check back after your next class or free period.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Your Next Best Actions</h2>
        <span className="text-xs text-slate-500">Updated {new Date().toLocaleTimeString()}</span>
      </div>

      {recommendations.map((rec, idx) => {
        const Icon = CATEGORY_ICON[rec.category];
        const expanded = expandedId === rec.id;
        return (
          <div key={rec.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 card-hover">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-sm font-mono">{idx + 1}.</span>
                    <h3 className="text-white font-semibold">{rec.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>
                  {rec.timeWindow && <p className="text-sm text-slate-400 mt-1">{rec.timeWindow}</p>}
                </div>
              </div>
              <button className="btn-secondary text-sm px-4 py-2 whitespace-nowrap">{rec.action}</button>
            </div>

            <button
              onClick={() => setExpandedId(expanded ? null : rec.id)}
              className="mt-4 flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              Why am I seeing this?
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-300">{explainWhy(rec)}</p>
                <ul className="space-y-1">
                  {rec.reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                      {reason.text}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
                  {FEEDBACK_OPTIONS.map((opt) => (
                    <button
                      key={opt.reason}
                      onClick={() => handleFeedback(rec, opt.reason)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

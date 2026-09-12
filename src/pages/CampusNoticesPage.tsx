import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle } from 'lucide-react';
import { buildStudentContext } from '../core/context/buildStudentContext';
import { rankNotices } from '../core/notices/noticeRankingEngine';
import { useSession } from '../context/SessionContext';

const URGENCY_STYLE = {
  high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  medium: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  low: 'border-slate-600 bg-slate-700/30 text-slate-400',
};

export default function CampusNoticesPage() {
  const { currentUser } = useSession();

  const ranked = useMemo(() => {
    const ctx = buildStudentContext({ name: currentUser.name });
    return rankNotices(ctx.notices, ctx);
  }, [currentUser.name]);

  const important = ranked.filter((n) => n.relevanceScore >= 0.5);
  const rest = ranked.filter((n) => n.relevanceScore < 0.5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="w-6 h-6 text-amber-400" /> Campus Notices
      </h1>
      <p className="text-slate-400 -mt-4">Ranked for you by timetable, department and urgency — not shown in posting order.</p>

      {important.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Important for you</h2>
          <div className="space-y-3">
            {important.map((n) => (
              <div key={n.id} className={`p-5 rounded-xl border ${URGENCY_STYLE[n.urgency]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{n.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{n.body}</p>
                    <p className="text-xs text-slate-400 mt-2">Why: {n.whyRelevant}</p>
                  </div>
                  {n.category === 'facility' && (
                    <Link
                      to="/timetable/optimize"
                      className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:border-slate-500 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> View Plan Impact
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Less important</h2>
          <div className="space-y-3">
            {rest.map((n) => (
              <div key={n.id} className="p-4 rounded-xl border border-slate-700 bg-slate-800/30 opacity-80">
                <h3 className="font-medium text-slate-200">{n.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { BookMarked, TrendingDown, TrendingUp } from 'lucide-react';
import { buildStudentContext } from '../core/context/buildStudentContext';
import { allocateStudyTime } from '../core/study/studyAllocationEngine';
import { findFreeGaps } from '../core/time';
import { useSession } from '../context/SessionContext';

export default function StudyTrackerPage() {
  const { currentUser } = useSession();

  const { context, allocations, availableMinutes } = useMemo(() => {
    const ctx = buildStudentContext({ name: currentUser.name });
    const gaps = findFreeGaps(ctx.timetable);
    const available = gaps.reduce((sum, g) => sum + g.durationMinutes, 0);
    return { context: ctx, allocations: allocateStudyTime(ctx.studyGoals, available), availableMinutes: available };
  }, [currentUser.name]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-purple-400" /> Personal Study Tracker
        </h1>
        <p className="text-slate-400 mt-1">
          {availableMinutes} minutes of free time today, allocated by exam proximity, mastery, priority and how
          recently you've studied each subject.
        </p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Today's Study Priorities</h2>
        <div className="space-y-4">
          {allocations.map((a) => (
            <div key={a.goalId} className="p-4 bg-slate-700/40 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">{a.subject}</span>
                <span className="text-purple-300 font-semibold">{a.minutes} min</span>
              </div>
              <p className="text-sm text-slate-400">{a.reason}</p>
              <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full progress-bar" style={{ width: `${Math.round(a.priorityScore * 100)}%` }} />
              </div>
            </div>
          ))}
          {allocations.length === 0 && (
            <p className="text-slate-400 text-sm">No free time left today to allocate.</p>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Exam Readiness</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {context.studyGoals.map((goal) => {
            const weak = goal.masteryPercent < 60;
            return (
              <div key={goal.id} className="p-4 bg-slate-700/30 rounded-lg flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{goal.subject}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {goal.examInDays !== null ? `Exam in ${goal.examInDays} days` : 'No exam scheduled'} ·{' '}
                    {goal.masteryPercent}% mastery
                  </p>
                </div>
                {weak ? (
                  <TrendingDown className="w-5 h-5 text-orange-400 shrink-0" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-green-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

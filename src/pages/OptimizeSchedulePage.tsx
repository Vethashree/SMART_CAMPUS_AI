import { useMemo, useState } from 'react';
import { CalendarClock, Coffee, MapPin, BookOpen, GraduationCap, AlertTriangle, Wand2 } from 'lucide-react';
import { buildStudentContext } from '../core/context/buildStudentContext';
import { optimizeDay } from '../core/scheduling/schedulerEngine';
import { findAffectedBlocks, repairSchedule } from '../core/scheduling/scheduleRepairEngine';
import { formatMinutes } from '../core/time';
import type { ScheduleBlock } from '../core/scheduling/types';
import { useSession } from '../context/SessionContext';

const BLOCK_STYLE: Record<ScheduleBlock['type'], { icon: typeof BookOpen; color: string }> = {
  class: { icon: GraduationCap, color: 'border-blue-500/30 bg-blue-500/10' },
  study: { icon: BookOpen, color: 'border-purple-500/30 bg-purple-500/10' },
  break: { icon: Coffee, color: 'border-slate-600 bg-slate-700/30' },
  travel: { icon: MapPin, color: 'border-amber-500/30 bg-amber-500/10' },
};

function Timeline({ blocks, highlightIds }: { blocks: ScheduleBlock[]; highlightIds?: Set<string> }) {
  return (
    <div className="space-y-2">
      {blocks.map((block) => {
        const style = BLOCK_STYLE[block.type];
        const Icon = style.icon;
        const highlighted = highlightIds?.has(block.id);
        return (
          <div
            key={block.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${style.color} ${
              highlighted ? 'ring-2 ring-orange-400' : ''
            }`}
          >
            <Icon className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="text-sm text-slate-400 w-32 shrink-0">
              {formatMinutes(block.startMinutes)} - {formatMinutes(block.endMinutes)}
            </span>
            <span className="text-white text-sm font-medium">{block.title}</span>
            {block.reason && <span className="text-xs text-slate-500 ml-auto hidden md:block">{block.reason}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function OptimizeSchedulePage() {
  const { currentUser } = useSession();
  const context = useMemo(() => buildStudentContext({ name: currentUser.name }), [currentUser.name]);
  const [schedule] = useState(() => optimizeDay(context));
  const [impactVisible, setImpactVisible] = useState(false);
  const [repaired, setRepaired] = useState(false);

  const disruption = context.events[0];
  const affected = disruption ? findAffectedBlocks(schedule, disruption) : [];
  const repairResult = disruption ? repairSchedule(schedule, disruption) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-indigo-400" /> Optimize My Day
        </h1>
        <p className="text-slate-400 mt-1">
          Classes stay fixed; every free period is filled with study time and, where needed, a travel buffer —
          based on your study goals and wellbeing preferences.
        </p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <Timeline blocks={repaired && repairResult ? repairResult.repaired : schedule} highlightIds={repaired && repairResult ? new Set(repairResult.affected.map((b) => b.id)) : undefined} />
      </div>

      {disruption && affected.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="font-semibold text-white">Campus update</h2>
          </div>
          <p className="text-sm text-slate-300 mb-3">{disruption.description}</p>
          {!impactVisible ? (
            <button onClick={() => setImpactVisible(true)} className="btn-secondary text-sm px-4 py-2">
              {affected.length} of your planned activities may be affected — View Plan Impact
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Affected: {affected.map((b) => `${formatMinutes(b.startMinutes)} ${b.title}`).join(', ')}
              </p>
              {!repaired ? (
                <button
                  onClick={() => setRepaired(true)}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2 w-fit"
                >
                  <Wand2 className="w-4 h-4" /> Repair My Plan
                </button>
              ) : (
                <p className="text-sm text-green-400">{repairResult?.explanation} — plan updated below.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

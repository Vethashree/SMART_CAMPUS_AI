import { useMemo } from 'react';
import { Library, Users } from 'lucide-react';
import { buildStudentContext } from '../core/context/buildStudentContext';
import { recommendLibraryZone } from '../core/library/libraryRecommendation';
import { useSession } from '../context/SessionContext';

export default function SmartLibraryPage() {
  const { currentUser } = useSession();

  const { context, pick } = useMemo(() => {
    const ctx = buildStudentContext({ name: currentUser.name });
    return { context: ctx, pick: recommendLibraryZone(ctx.library, ctx.preferences) };
  }, [currentUser.name]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Library className="w-6 h-6 text-teal-400" /> Smart Library
      </h1>

      {pick && (
        <div className="bg-teal-500/10 border border-teal-500/30 p-6 rounded-xl">
          <p className="text-sm text-teal-300 font-medium mb-1">Recommended for your next session</p>
          <h2 className="text-xl font-bold text-white">{pick.zone.name}</h2>
          <ul className="mt-3 space-y-1">
            {pick.reasons.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {context.library.map((zone) => {
          const ratio = zone.seatsAvailable / zone.seatsTotal;
          return (
            <div key={zone.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{zone.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    zone.quiet
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      : 'border-slate-600 bg-slate-700/30 text-slate-300'
                  }`}
                >
                  {zone.quiet ? 'Quiet Zone' : 'Group Study'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <Users className="w-4 h-4" />
                {zone.seatsAvailable} of {zone.seatsTotal} seats free
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full progress-bar"
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { loadPreferences, resetPreferences, savePreferences } from '../core/context/preferenceStore';
import type { StudentPreferences } from '../core/types';

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<StudentPreferences>(() => loadPreferences());

  const update = (next: StudentPreferences) => {
    setPrefs(next);
    savePreferences(next);
  };

  const handleReset = () => setPrefs(resetPreferences());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-slate-300" /> Preferences
        </h1>
        <button onClick={handleReset} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset all preferences
        </button>
      </div>
      <p className="text-slate-400 -mt-4">
        These directly change your Next Best Actions, schedule and library recommendations — nothing here is
        cosmetic.
      </p>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-2">Accessibility</h2>
        <Toggle
          label="Minimize walking"
          checked={prefs.accessibility.minimizeWalking}
          onChange={(v) => update({ ...prefs, accessibility: { ...prefs.accessibility, minimizeWalking: v } })}
        />
        <Toggle
          label="Avoid stairs"
          checked={prefs.accessibility.avoidStairs}
          onChange={(v) => update({ ...prefs, accessibility: { ...prefs.accessibility, avoidStairs: v } })}
        />
        <Toggle
          label="Prefer elevator routes"
          checked={prefs.accessibility.preferElevator}
          onChange={(v) => update({ ...prefs, accessibility: { ...prefs.accessibility, preferElevator: v } })}
        />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Extra travel buffer (minutes)</span>
          <input
            type="number"
            min={0}
            max={30}
            value={prefs.accessibility.extraTravelBufferMinutes}
            onChange={(e) =>
              update({
                ...prefs,
                accessibility: { ...prefs.accessibility, extraTravelBufferMinutes: Number(e.target.value) },
              })
            }
            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-2">Study</h2>
        <Toggle
          label="Prefer quiet study spaces"
          checked={prefs.study.preferQuiet}
          onChange={(v) => update({ ...prefs, study: { ...prefs.study, preferQuiet: v } })}
        />
        <Toggle
          label="Avoid crowded places"
          checked={prefs.study.avoidCrowdedPlaces}
          onChange={(v) => update({ ...prefs, study: { ...prefs.study, avoidCrowdedPlaces: v } })}
        />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Preferred session length (minutes)</span>
          <input
            type="number"
            min={15}
            max={120}
            step={5}
            value={prefs.study.preferredSessionMinutes}
            onChange={(e) => update({ ...prefs, study: { ...prefs.study, preferredSessionMinutes: Number(e.target.value) } })}
            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-2">Wellbeing</h2>
        <Toggle
          label="Remind me to take breaks"
          checked={prefs.wellbeing.wantsBreakReminders}
          onChange={(v) => update({ ...prefs, wellbeing: { ...prefs.wellbeing, wantsBreakReminders: v } })}
        />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Max consecutive study minutes</span>
          <input
            type="number"
            min={30}
            max={180}
            step={15}
            value={prefs.wellbeing.maxConsecutiveStudyMinutes}
            onChange={(e) =>
              update({ ...prefs, wellbeing: { ...prefs.wellbeing, maxConsecutiveStudyMinutes: Number(e.target.value) } })
            }
            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white"
          />
        </div>
      </div>

      {prefs.dismissedRecommendationTypes.length > 0 && (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Dismissed recommendation types</h2>
          <div className="flex flex-wrap gap-2">
            {prefs.dismissedRecommendationTypes.map((category) => (
              <button
                key={category}
                onClick={() =>
                  update({
                    ...prefs,
                    dismissedRecommendationTypes: prefs.dismissedRecommendationTypes.filter((c) => c !== category),
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Click to re-enable"
              >
                {category} ✕
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Check } from 'lucide-react';
import { Badge } from './_shared';

function LogView({ dailyLog }) {
  const entries = Object.entries(dailyLog)
    .filter(([, v]) => v.study?.studied || v.workout?.done || v.reading?.read || v.study?.note || v.workout?.note)
    .sort(([a], [b]) => b.localeCompare(a));

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold">Daily log</h2>
      <p className="text-sm text-stone-600">Every day you showed up.</p>

      <div className="mt-5 space-y-3">
        {entries.length === 0 && (
          <p className="text-center text-stone-400 italic py-12">No entries yet. Log your first day from the Today tab.</p>
        )}
        {entries.map(([date, entry]) => {
          const d = new Date(date);
          const s = entry.study || {};
          const w = entry.workout || {};
          const r = entry.reading || {};
          const n = entry.nutrition || {};
          const rl = entry.runLog || {};
          return (
            <div key={date} className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4">
              <div className="shrink-0 text-center w-12">
                <div className="font-serif text-2xl font-bold">{d.getDate()}</div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-stone-500 mb-2">{d.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="flex gap-2 flex-wrap mb-2">
                  {s.studied && <Badge color="orange">📖 {s.minutes || 0}m study</Badge>}
                  {w.done && <Badge color="red">💪 workout</Badge>}
                  {rl.distance && <Badge color="amber">🏃 {rl.distance}km{rl.pace ? ` @ ${rl.pace}` : ''}</Badge>}
                  {r.read && <Badge color="indigo">📚 {r.minutes || 0}m read</Badge>}
                  {n.protein && <Badge color="green">🥩 {n.protein}g protein</Badge>}
                  {n.water && <Badge color="blue">💧 {n.water}L</Badge>}
                </div>
                {s.note && <p className="text-sm text-stone-700 mt-1"><span className="text-stone-400">Study:</span> {s.note}</p>}
                {w.note && <p className="text-sm text-stone-700 mt-1"><span className="text-stone-400">Workout:</span> {w.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LogView;

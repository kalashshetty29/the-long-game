import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Trophy, Zap } from 'lucide-react';
import { PLAN } from '../../lib/life-data';
import { Label } from './_shared';

function PlanView({ completedWeeks, toggleWeek, checkpoints, toggleCheckpoint, currentMonth, reflections, updateReflection }) {
  const [expandedMonth, setExpandedMonth] = useState(currentMonth);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold">The 12-Month Plan</h2>
        <p className="text-sm text-stone-600">Three phases. 48 weeks. Check them off.</p>
      </div>

      {PLAN.map(phase => (
        <div key={phase.phase}>
          <div className="flex items-baseline gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-bold"
              style={{ background: phase.color }}>{phase.phase}</div>
            <div>
              <h3 className="font-serif text-lg font-bold">{phase.name}</h3>
              <p className="text-xs text-stone-500">{phase.tagline}</p>
            </div>
          </div>

          <div className="space-y-2 ml-11">
            {phase.months.map(month => {
              const isExpanded = expandedMonth === month.num;
              const isCurrent = month.num === currentMonth;
              const weekKeys = [1, 2, 3, 4].map(w => `${month.num}-${w}`);
              const completedInMonth = weekKeys.filter(k => completedWeeks[k]).length;
              const checkpointDone = checkpoints[`month-${month.num}`];

              return (
                <div key={month.num} className={`bg-white rounded-xl border transition-all ${
                  isCurrent ? 'border-stone-900 shadow-md' : 'border-stone-200'
                }`}>
                  <button onClick={() => setExpandedMonth(isExpanded ? null : month.num)}
                    className="w-full flex items-center gap-3 p-3 text-left">
                    <div className="text-xs font-mono text-stone-400 shrink-0 w-7">M{month.num}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{month.title}</h4>
                        {isCurrent && <span className="text-[9px] uppercase tracking-wider bg-stone-900 text-white px-2 py-0.5 rounded-full">Now</span>}
                        {checkpointDone && <Check size={12} className="text-green-600" strokeWidth={3} />}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 truncate">{month.focus}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-stone-500">{completedInMonth}/4</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-stone-100">
                      <div className="space-y-2 mt-3">
                        {month.weekly.map((task, i) => {
                          const key = `${month.num}-${i + 1}`;
                          const done = completedWeeks[key];
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <button onClick={() => toggleWeek(month.num, i + 1)}
                                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                  done ? 'bg-stone-900 border-stone-900' : 'border-stone-300 hover:border-stone-600'
                                }`}>
                                {done && <Check size={12} className="text-white" strokeWidth={3} />}
                              </button>
                              <div className="flex-1">
                                <div className="text-[10px] uppercase tracking-wider text-stone-400">Week {i + 1}</div>
                                <p className={`text-sm ${done ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{task}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleCheckpoint(month.num)}
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                              checkpointDone ? 'bg-green-600 border-green-600' : 'border-stone-300 hover:border-green-600'
                            }`}>
                            {checkpointDone && <Check size={12} className="text-white" strokeWidth={3} />}
                          </button>
                          <div className="flex-1">
                            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Month {month.num} checkpoint</div>
                            <p className="text-sm text-stone-800 mt-1">{month.checkpoint}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label>End-of-month reflection</Label>
                        <textarea value={reflections[`month-${month.num}`] || ''}
                          onChange={(e) => updateReflection(month.num, e.target.value)} rows={2}
                          placeholder="What worked? What didn't? What's changing for next month?"
                          className="w-full mt-1 p-2 rounded-lg border border-stone-200 focus:border-stone-500 focus:outline-none text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlanView;

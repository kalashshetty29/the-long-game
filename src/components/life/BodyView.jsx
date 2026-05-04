import React, { useState } from 'react';
import { Dumbbell, Apple, Droplet, Moon, Heart, Activity, Check, TrendingUp, Sun } from 'lucide-react';
import { WORKOUTS, getLongRunTarget } from '../../lib/life-data';
import { Card, Label, MiniButton } from './_shared';

function BodyView({ todayEntry, updateDaily, dayOfWeek, currentWeek }) {
  const workout = todayEntry.workout || {};
  const habits = todayEntry.habits || {};
  const weighIn = todayEntry.weighIn || {};
  const runLog = todayEntry.runLog || {};
  const todaysWorkout = WORKOUTS[dayOfWeek];
  const exercises = workout.exercises || {};
  const isRunDay = todaysWorkout.type === 'run';
  const isSunday = dayOfWeek === 0;
  const longRun = isSunday ? getLongRunTarget(currentWeek) : null;

  const setExercise = (label, field, value) => {
    const newExercises = { ...exercises, [label]: { ...(exercises[label] || {}), [field]: value } };
    updateDaily('workout', { exercises: newExercises });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Body</h2>
        <p className="text-sm text-stone-600">Hybrid athlete: training, recovery, performance metrics.</p>
      </div>

      {/* Today's workout detail */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-red-600" />
              <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Today's workout</div>
            </div>
            <p className="font-serif text-xl font-bold mt-1">{todaysWorkout.name}</p>
            {todaysWorkout.note && (
              <p className="text-xs text-stone-600 mt-1 italic">{todaysWorkout.note}</p>
            )}
          </div>
          <button onClick={() => updateDaily('workout', { done: !workout.done })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
              workout.done ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-700'
            }`}>
            {workout.done ? '✓ Done' : 'Mark complete'}
          </button>
        </div>

        {isSunday && longRun && (
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-amber-900">{longRun.target}K</span>
              <span className="text-xs text-amber-800">target · week {currentWeek}</span>
            </div>
            {longRun.note && <p className="text-[11px] text-amber-800 mt-1">{longRun.note}</p>}
          </div>
        )}

        {isRunDay && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Label>Run log</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <div className="text-[10px] text-stone-600 mb-0.5">Distance (km)</div>
                <input type="number" step="0.1" value={runLog.distance || ''}
                  onChange={(e) => updateDaily('runLog', { distance: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-2 py-1.5 rounded border border-stone-200 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <div className="text-[10px] text-stone-600 mb-0.5">Time (min)</div>
                <input type="number" value={runLog.minutes || ''}
                  onChange={(e) => updateDaily('runLog', { minutes: e.target.value })}
                  placeholder="0"
                  className="w-full px-2 py-1.5 rounded border border-stone-200 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <div className="text-[10px] text-stone-600 mb-0.5">Pace (min/km)</div>
                <input type="text" value={runLog.pace || ''}
                  onChange={(e) => updateDaily('runLog', { pace: e.target.value })}
                  placeholder="6:30"
                  className="w-full px-2 py-1.5 rounded border border-stone-200 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-[10px] text-stone-600 mb-1">How did it feel?</div>
              <div className="flex gap-1 flex-wrap">
                {['😅 Tough', '🙂 Steady', '💪 Strong', '⚡ Easy'].map(f => (
                  <MiniButton key={f} small active={runLog.feel === f} onClick={() => updateDaily('runLog', { feel: f })}>{f}</MiniButton>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-[10px] text-stone-600 mb-1">Walk breaks?</div>
              <div className="flex gap-1 flex-wrap">
                {['None', '1 short', '2+', 'Lots'].map(w => (
                  <MiniButton key={w} small active={runLog.walks === w} onClick={() => updateDaily('runLog', { walks: w })}>{w}</MiniButton>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-3">
          {todaysWorkout.items.map((item, i) => {
            const ex = exercises[item.label] || {};
            return (
              <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    {item.target && <div className="text-xs text-stone-500">Target: {item.target}</div>}
                  </div>
                  <button onClick={() => setExercise(item.label, 'done', !ex.done)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      ex.done ? 'bg-red-600 text-white' : 'bg-white border-2 border-stone-300 text-stone-400'
                    }`}>
                    <Check size={14} strokeWidth={3} />
                  </button>
                </div>
                {ex.done && (
                  <input type="text" value={ex.actual || ''}
                    onChange={(e) => setExercise(item.label, 'actual', e.target.value)}
                    placeholder="What you actually did (reps, time, weight…)"
                    className="w-full mt-2 px-2 py-1 text-xs rounded border border-stone-200 focus:outline-none focus:border-stone-500" />
                )}
              </div>
            );
          })}
        </div>

        <textarea value={workout.note || ''} onChange={(e) => updateDaily('workout', { note: e.target.value })}
          rows={2} placeholder="How did the session feel? Energy, form, anything off…"
          className="w-full mt-3 p-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-500" />
      </Card>

      {/* Habits — smoking, drinking, sleep */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Moon size={14} className="text-stone-600" />
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Habits & recovery</div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Sleep last night (hrs)</Label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {[5, 6, 6.5, 7, 7.5, 8, 9].map(h => (
                <MiniButton key={h} small active={habits.sleepHrs === h} onClick={() => updateDaily('habits', { sleepHrs: h })}>
                  {h}h
                </MiniButton>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Target: 7+ hrs · lights out 10:45 PM</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-stone-500" />
              <Label>Energy today</Label>
            </div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {[
                { v: 1, label: '😴 Drained' },
                { v: 2, label: '🙂 Low' },
                { v: 3, label: '💪 Solid' },
                { v: 4, label: '⚡ High' },
                { v: 5, label: '🔥 Peak' },
              ].map(e => (
                <MiniButton key={e.v} small active={habits.energy === e.v} onClick={() => updateDaily('habits', { energy: e.v })}>
                  {e.label}
                </MiniButton>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Low energy 2 days in a row? Sleep, food, or stress — investigate.</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-stone-500" />
              <Label>Soreness / pain check</Label>
            </div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {['None', 'Mild DOMS', 'Sore', 'Pain — rest'].map(s => (
                <MiniButton key={s} small active={habits.soreness === s} onClick={() => updateDaily('habits', { soreness: s })}>
                  {s}
                </MiniButton>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">DOMS is fine. Sharp pain means skip the workout, don't push through.</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Sun size={12} className="text-stone-500" />
              <Label>Morning routine done?</Label>
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {[
                { k: 'water', label: '500ml water' },
                { k: 'warmup', label: '5-min warmup' },
                { k: 'coldShower', label: 'Cold shower' },
              ].map(item => {
                const done = habits.morning?.[item.k];
                return (
                  <button key={item.k}
                    onClick={() => updateDaily('habits', { morning: { ...(habits.morning || {}), [item.k]: !done } })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      done ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}>
                    {done && <Check size={10} strokeWidth={3} />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly weigh-in */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-stone-600" />
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Weekly check-in (Sunday mornings)</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Weight (kg)</Label>
            <input type="number" step="0.1" value={weighIn.weight || ''}
              onChange={(e) => updateDaily('weighIn', { weight: e.target.value })}
              placeholder="79.4"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-500" />
          </div>
          <div>
            <Label>Waist (cm)</Label>
            <input type="number" step="0.1" value={weighIn.waist || ''}
              onChange={(e) => updateDaily('weighIn', { waist: e.target.value })}
              placeholder="at navel"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-500" />
          </div>
        </div>
        <p className="text-[11px] text-stone-500 mt-2 italic">
          Slow recomp: weight should drift down 0.2–0.3 kg/week max. If it drops faster, eat more — performance suffers fast in a deficit.
        </p>
      </Card>
    </div>
  );
}

export default BodyView;

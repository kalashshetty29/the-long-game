import React, { useState } from 'react';
import { Check, Flame, Target, BookOpen, Plus, X, Activity, Sun, Trophy, Zap, AlertCircle, Dumbbell, Apple, BookMarked, Sparkles } from 'lucide-react';
import { WORKOUTS, getLongRunTarget } from '../../lib/life-data';
import { Card, Label, MiniButton } from './_shared';

function TodayView({
  currentMonth, currentMonthData, currentPhase, weekOfMonth, currentWeek, currentWeekTask,
  todayEntry, updateDaily, quote, dayOfWeek,
  customGoals, addCustomGoal, toggleCustomGoal, removeCustomGoal,
  studyStreak, currentBook, updateBook,
}) {
  const [newGoal, setNewGoal] = useState('');
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const study = todayEntry.study || {};
  const workout = todayEntry.workout || {};
  const nutrition = todayEntry.nutrition || {};
  const reading = todayEntry.reading || {};
  const todaysWorkout = WORKOUTS[dayOfWeek];
  const isSunday = dayOfWeek === 0;
  const isTuesday = dayOfWeek === 2;
  const longRun = isSunday ? getLongRunTarget(currentWeek) : null;

  return (
    <div className="space-y-5">
      {/* Quote hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white" style={{ background: `linear-gradient(135deg, ${currentPhase.color}, ${currentPhase.color}dd)` }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-80">
            <span>{dayName}, {dateStr}</span>
            <span>·</span>
            <span>Phase {currentPhase.phase}</span>
          </div>
          <div className="flex items-start gap-2 mt-4">
            <Sparkles size={18} className="shrink-0 mt-1 opacity-70" />
            <p className="font-serif text-xl md:text-2xl leading-snug italic">
              {quote.text}
            </p>
          </div>
          <p className="text-xs opacity-70 mt-2 ml-7">— {quote.source}</p>
        </div>
      </div>

      {/* Today's study focus */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-orange-600" />
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">This week's study task</div>
        </div>
        <p className="font-serif text-lg leading-tight text-stone-900">{currentWeekTask}</p>
        <p className="text-xs text-stone-500 mt-1 italic">Month {currentMonth} · Week {weekOfMonth} · {currentMonthData.focus}</p>

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Did you study today?</div>
            <div className="text-xs text-stone-500 mt-0.5">
              {study.studied ? `${study.minutes || 60} min logged. Nice.` : 'Even 10 minutes counts. Never zero.'}
            </div>
          </div>
          <button onClick={() => updateDaily('study', { studied: !study.studied, minutes: study.minutes || 60 })}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              study.studied ? 'bg-green-600 text-white scale-110' : 'bg-stone-100 hover:bg-stone-200 text-stone-400'
            }`}>
            <Check size={22} strokeWidth={3} />
          </button>
        </div>

        {study.studied && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <Label>Minutes</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[10, 30, 60, 90, 120, 180].map(m => (
                <MiniButton key={m} active={study.minutes === m} onClick={() => updateDaily('study', { studied: true, minutes: m })}>
                  {m}m
                </MiniButton>
              ))}
            </div>
            <div className="mt-3">
              <textarea value={study.note || ''} onChange={(e) => updateDaily('study', { note: e.target.value })}
                rows={2} placeholder="What did you learn today?"
                className="w-full p-3 rounded-lg border border-stone-200 focus:border-stone-500 focus:outline-none text-sm" />
            </div>
          </div>
        )}
      </Card>

      {/* Today's workout */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell size={14} className="text-red-600" />
              <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Today's workout</div>
            </div>
            <p className="font-serif text-lg leading-tight">{todaysWorkout.name}</p>
            {todaysWorkout.note && (
              <p className="text-xs text-stone-600 mt-1 italic">{todaysWorkout.note}</p>
            )}
            <p className="text-[11px] text-stone-500 mt-1">Tap "Body" tab to log details.</p>
          </div>
          <button onClick={() => updateDaily('workout', { done: !workout.done })}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              workout.done ? 'bg-red-600 text-white scale-110' : 'bg-stone-100 hover:bg-stone-200 text-stone-400'
            }`}>
            <Check size={22} strokeWidth={3} />
          </button>
        </div>

        {isSunday && longRun && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-amber-700" />
              <div className="text-[10px] uppercase tracking-widest text-amber-800 font-bold">This Sunday's long run</div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl font-bold text-amber-900">{longRun.target}</span>
              <span className="text-amber-800 text-sm">km · continuous · easy pace</span>
            </div>
            {longRun.note && <p className="text-xs text-amber-800 mt-1 italic">{longRun.note}</p>}
          </div>
        )}

        {isTuesday && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
            🌅 Tuesday morning before office — 30–40 min easy run + quick mobility. Conversational pace only.
          </div>
        )}
      </Card>

      {/* Nutrition quick track */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Apple size={14} className="text-green-700" />
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Nutrition · hybrid athlete targets</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Protein (g / 170)</Label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {[100, 125, 150, 170, 200].map(p => (
                <MiniButton key={p} small active={nutrition.protein === p} onClick={() => updateDaily('nutrition', { protein: p })}>{p}g</MiniButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Carbs (g / 280)</Label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {[150, 200, 250, 280, 320].map(c => (
                <MiniButton key={c} small active={nutrition.carbs === c} onClick={() => updateDaily('nutrition', { carbs: c })}>{c}g</MiniButton>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <Label>Water (L / 3.5)</Label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {[1, 2, 3, 3.5, 4].map(w => (
                <MiniButton key={w} small active={nutrition.water === w} onClick={() => updateDaily('nutrition', { water: w })}>{w}L</MiniButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Meals hit (of 5)</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(m => (
                <button key={m} onClick={() => updateDaily('nutrition', { mealsHit: m })}
                  className={`w-9 h-9 rounded-lg font-semibold text-sm transition-colors ${
                    (nutrition.mealsHit || 0) >= m ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-stone-500 mt-3 italic">
          Slow recomp: ~2,400 kcal training days, ~2,200 rest days. Carbs go up around runs. Pre-long-run: half banana + black coffee 30 min before.
        </p>
      </Card>

      {/* Reading */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <BookMarked size={14} className="text-indigo-600" />
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Reading</div>
        </div>

        <input type="text" value={currentBook} onChange={(e) => updateBook(e.target.value)}
          placeholder="What are you reading? (book title)"
          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-stone-500 mb-3" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-sm">Did you read today?</div>
            <div className="text-xs text-stone-500 mt-0.5">
              {reading.read ? `${reading.minutes || 0} min` : 'Even 5 minutes counts toward the habit.'}
            </div>
          </div>
          <button onClick={() => updateDaily('reading', { read: !reading.read, minutes: reading.minutes || 15 })}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              reading.read ? 'bg-indigo-600 text-white scale-110' : 'bg-stone-100 hover:bg-stone-200 text-stone-400'
            }`}>
            <Check size={22} strokeWidth={3} />
          </button>
        </div>

        {reading.read && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {[5, 15, 30, 45, 60].map(m => (
              <MiniButton key={m} small active={reading.minutes === m} onClick={() => updateDaily('reading', { read: true, minutes: m })}>
                {m}m
              </MiniButton>
            ))}
          </div>
        )}
      </Card>

      {/* Streak feedback */}
      {studyStreak === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900 text-sm">Study streak is at zero.</p>
            <p className="text-xs text-orange-800 mt-1">Everyone restarts sometimes. The only wrong move is skipping today too.</p>
          </div>
        </div>
      )}
      {studyStreak >= 7 && studyStreak < 21 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <Zap size={18} className="text-green-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 text-sm">{studyStreak} days in a row studying.</p>
            <p className="text-xs text-green-800 mt-1">The habit is forming. Week 3 is when it starts feeling automatic.</p>
          </div>
        </div>
      )}
      {studyStreak >= 21 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Trophy size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">{studyStreak} days. This is who you are now.</p>
            <p className="text-xs text-amber-800 mt-1">You've moved from doing the habit to being the habit. Protect it.</p>
          </div>
        </div>
      )}

      {/* Personal goals */}
      <Card>
        <h3 className="font-serif text-lg font-bold">Personal to-dos</h3>
        <p className="text-xs text-stone-500 mt-0.5">Your own goals on top of the plan.</p>

        <div className="mt-3 space-y-2">
          {customGoals.length === 0 && (
            <p className="text-sm text-stone-400 italic py-3 text-center">No personal goals yet.</p>
          )}
          {customGoals.map(g => (
            <div key={g.id} className="flex items-center gap-3 group">
              <button onClick={() => toggleCustomGoal(g.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                  g.done ? 'bg-stone-900 border-stone-900' : 'border-stone-300 hover:border-stone-600'
                }`}>
                {g.done && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm ${g.done ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{g.text}</span>
              <button onClick={() => removeCustomGoal(g.id)}
                className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { addCustomGoal(newGoal); setNewGoal(''); } }}
            placeholder="Add a goal…"
            className="flex-1 px-3 py-2 rounded-full border border-stone-200 text-sm focus:outline-none focus:border-stone-500" />
          <button onClick={() => { addCustomGoal(newGoal); setNewGoal(''); }}
            className="px-3 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-orange-600 flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </Card>
    </div>
  );
}

export default TodayView;

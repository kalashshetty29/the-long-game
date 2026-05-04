import React from 'react';
import { Flame, Trophy, BookOpen, Dumbbell, BookMarked, Download, Upload, Sparkles, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { Card, StreakCard, StatCard } from './_shared';

function ProgressView({ studyStreak, workoutStreak, readingStreak, dailyLog, completedWeeksCount, daysSinceStart, checkpoints, customGoals, exportData, importData }) {
  const studyDays = Object.values(dailyLog).filter(d => d.study?.studied).length;
  const workoutDays = Object.values(dailyLog).filter(d => d.workout?.done).length;
  const readingDays = Object.values(dailyLog).filter(d => d.reading?.read).length;
  const studyMinutes = Object.values(dailyLog).reduce((sum, d) => sum + (d.study?.minutes || 0), 0);
  const readingMinutes = Object.values(dailyLog).reduce((sum, d) => sum + (d.reading?.minutes || 0), 0);

  const weighIns = Object.entries(dailyLog)
    .filter(([, d]) => d.weighIn?.weight)
    .map(([date, d]) => ({ date, weight: parseFloat(d.weighIn.weight), waist: parseFloat(d.weighIn.waist) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const firstWeight = weighIns[0]?.weight;
  const lastWeight = weighIns[weighIns.length - 1]?.weight;
  const weightChange = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null;

  const studyProgressPct = Math.round((completedWeeksCount / TOTAL_WEEKS) * 100);
  const totalDays = (daysSinceStart || 0) + 1;
  const studyConsistency = totalDays > 0 ? Math.round((studyDays / totalDays) * 100) : 0;
  const workoutConsistency = totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0;

  const checkpointsDone = Object.values(checkpoints).filter(Boolean).length;

  // ---- running stats ----
  const runs = Object.entries(dailyLog)
    .filter(([, d]) => d.runLog?.distance && parseFloat(d.runLog.distance) > 0)
    .map(([date, d]) => ({
      date,
      distance: parseFloat(d.runLog.distance),
      pace: d.runLog.pace,
      walks: d.runLog.walks,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const longestRun = runs.length > 0 ? Math.max(...runs.map(r => r.distance)) : 0;
  const totalKm = runs.reduce((sum, r) => sum + r.distance, 0).toFixed(1);
  const totalRuns = runs.length;
  const continuousRuns = runs.filter(r => r.walks === 'None').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold">Progress</h2>
        <p className="text-sm text-stone-600">The numbers don't lie.</p>
      </div>

      {/* Overall study progress ring */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-36 h-36 shrink-0">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#f5f5f4" strokeWidth="12" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#1c1917" strokeWidth="12"
                strokeLinecap="round" strokeDasharray={`${(studyProgressPct / 100) * 440} 440`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-serif text-4xl font-bold">{studyProgressPct}</div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500">% complete</div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-[10px] uppercase tracking-widest text-stone-500">Day {totalDays} of 365</div>
            <h3 className="font-serif text-xl font-bold mt-1">
              {studyProgressPct < 10 && "The start is the hardest. You're doing it."}
              {studyProgressPct >= 10 && studyProgressPct < 30 && "Past the beginning. Habits are forming."}
              {studyProgressPct >= 30 && studyProgressPct < 60 && "The middle is where most quit. You won't."}
              {studyProgressPct >= 60 && studyProgressPct < 90 && "Finish line is visible. Keep going."}
              {studyProgressPct >= 90 && "Almost there. What a year."}
            </h3>
          </div>
        </div>
      </Card>

      {/* Three streak cards */}
      <div className="grid grid-cols-3 gap-3">
        <StreakCard icon={BookOpen} label="Study" streak={studyStreak} days={studyDays} color="orange" />
        <StreakCard icon={Dumbbell} label="Workout" streak={workoutStreak} days={workoutDays} color="red" />
        <StreakCard icon={BookMarked} label="Reading" streak={readingStreak} days={readingDays} color="indigo" />
      </div>

      {/* Detailed stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Study hours" value={Math.round(studyMinutes / 60)} suffix="hrs" />
        <StatCard label="Reading hours" value={Math.round(readingMinutes / 60)} suffix="hrs" />
        <StatCard label="Weeks done" value={completedWeeksCount} suffix={`/ ${TOTAL_WEEKS}`} />
        <StatCard label="Checkpoints" value={checkpointsDone} suffix="/ 12" />
        <StatCard label="Study consistency" value={studyConsistency} suffix="%" color="text-green-700" />
        <StatCard label="Workout consistency" value={workoutConsistency} suffix="%" color="text-green-700" />
      </div>

      {/* Body progress */}
      {weighIns.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-stone-600" />
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Body progress</div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase text-stone-500">Start</div>
              <div className="font-serif text-2xl font-bold">{firstWeight} kg</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-stone-500">Current</div>
              <div className="font-serif text-2xl font-bold">{lastWeight} kg</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-stone-500">Change</div>
              <div className={`font-serif text-2xl font-bold ${parseFloat(weightChange) < 0 ? 'text-green-700' : 'text-stone-700'}`}>
                {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
              </div>
            </div>
          </div>
          <p className="text-[11px] text-stone-500">Slow recomp · {weighIns.length} weigh-ins logged</p>
        </Card>
      )}

      {/* Running progression */}
      {totalRuns > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-amber-700" />
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Running</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase text-stone-500">Longest run</div>
              <div className="font-serif text-2xl font-bold text-amber-900">{longestRun}<span className="text-sm">km</span></div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-stone-500">Total km</div>
              <div className="font-serif text-2xl font-bold">{totalKm}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-stone-500">Runs logged</div>
              <div className="font-serif text-2xl font-bold">{totalRuns}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-stone-500">Continuous</div>
              <div className="font-serif text-2xl font-bold text-green-700">{continuousRuns}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-600 mt-2">
            <span>Goal: 10K continuous in week 11–12</span>
            <span className="font-semibold">Half marathon: week 46</span>
          </div>
          {longestRun >= 10 && (
            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-900">
              🎉 You hit 10K continuous. The hardest part of the journey is done. Now you build endurance toward 21K.
            </div>
          )}
        </Card>
      )}

      {/* Backup & restore */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Download size={14} className="text-stone-600" />
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Backup & restore</div>
        </div>
        <p className="text-sm text-stone-700">
          Export a full copy of your data as a JSON file. Do this once a month during your Sunday review — keep it in Google Drive or on your laptop as insurance.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button onClick={exportData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
            <Download size={14} /> Export backup
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-200 cursor-pointer transition-colors">
            <Upload size={14} /> Import backup
            <input type="file" accept="application/json" onChange={importData} className="hidden" />
          </label>
        </div>
        <p className="text-[11px] text-stone-500 mt-3 italic">
          Importing replaces your current data. Use carefully.
        </p>
      </Card>

      {/* Closing quote */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 text-center">
        <p className="font-serif italic text-sm md:text-base leading-relaxed">
          "The first 10K is harder than the next 11.<br />
          The first month is harder than the next eleven.<br />
          Show up. The compounding takes care of the rest."
        </p>
      </div>
    </div>
  );
}

export default ProgressView;

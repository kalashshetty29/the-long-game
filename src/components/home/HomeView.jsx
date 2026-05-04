import React from 'react'
import { Check, X } from 'lucide-react'
import FourRings, { RING_COLORS, RING_LABELS } from './FourRings'
import { getTimeOfDay } from '../../lib/time-of-day'
import { computeUpcomingDebits } from '../../lib/upcoming-debits'
import { computeLastWeekSummary } from '../../lib/week-summary'
import { WORKOUTS, getLongRunTarget } from '../../lib/life-data'

// Default daily targets — these can later be made user-configurable in Settings.
const DAILY_TARGETS = {
  caloriesTarget: 2200,
  studyMinutesTarget: 100,
  readingMinutesTarget: 30,
  // moveTarget is per-day from the workout schedule (e.g. long run 5km on Sundays)
}

export default function HomeView({ life, finance, navigate, showToast }) {
  const tod = getTimeOfDay()
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Today's data from life space
  const todayEntry = life?.derived?.todayEntry || {}
  const dayOfWeek = today.getDay()
  const workout = todayEntry.workout || {}
  const study = todayEntry.study || {}
  const reading = todayEntry.reading || {}
  const nutrition = todayEntry.nutrition || {}

  // Compute ring values
  const rings = computeRingValues({ life, todayEntry, dayOfWeek })

  // Streaks
  const studyStreak = life?.derived?.studyStreak ?? 0
  const workoutStreak = life?.derived?.workoutStreak ?? 0
  const readingStreak = life?.derived?.readingStreak ?? 0

  // Upcoming debits
  const upcoming = computeUpcomingDebits(finance?.data, { lookaheadDays: 30 })

  // Last week
  const week = computeLastWeekSummary(life?.state?.dailyLog || {})

  // Today's session info
  const sessionInfo = getTodaysSession({ life, dayOfWeek })

  return (
    <>
      {/* TOD Hero */}
      <div className={`rounded-xl px-4 py-3 ${tod.bgClass} text-paper-50`}>
        <div className="text-[9px] uppercase tracking-[0.14em] opacity-60 font-medium">{tod.label}</div>
        <div className="font-display text-[15px] mt-1.5 leading-snug">
          {tod.line} <span className="italic opacity-75">{tod.em}</span>
        </div>
      </div>

      {/* 4-RING HERO */}
      <button
        onClick={() => navigate('body-mind', 'today')}
        className="w-full text-left bg-white border border-paper-200 rounded-xl p-4 active:bg-paper-50 transition-colors"
      >
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-display text-[17px] font-medium">Today</div>
          <div className="text-[11px] text-ink-500">{getDayName(dayOfWeek)} · {sessionInfo.name.toLowerCase()}</div>
        </div>
        <div className="flex items-center gap-3.5">
          <FourRings values={rings} />
          <div className="flex-1 grid gap-2.5">
            <RingStat color={RING_COLORS.move}  name="Move"  value={rings.moveLabel} />
            <RingStat color={RING_COLORS.fuel}  name="Fuel"  value={rings.fuelLabel} />
            <RingStat color={RING_COLORS.build} name="Build" value={rings.buildLabel} />
            <RingStat color={RING_COLORS.read}  name="Read"  value={rings.readLabel} />
          </div>
        </div>
      </button>

      {/* STREAKS */}
      <div className="grid grid-cols-3 gap-1.5">
        <StreakTile color="amber"  num={studyStreak}   label="Study days"   onClick={() => navigate('body-mind', 'progress')} />
        <StreakTile color="red"    num={workoutStreak} label="Workout days" onClick={() => navigate('body-mind', 'progress')} />
        <StreakTile color="indigo" num={readingStreak} label="Reading days" onClick={() => navigate('body-mind', 'progress')} />
      </div>

      {/* TODAY'S SESSION */}
      <h2 className="font-display text-[16px] font-medium mt-1 ml-1">Today's session</h2>
      <SessionCard
        sessionInfo={sessionInfo}
        workout={workout}
        onLog={() => handleLogWorkout({ life, sessionInfo, showToast })}
        onSkip={() => handleSkipWorkout({ life })}
        onTap={() => navigate('body-mind', 'body')}
      />

      {/* UPCOMING */}
      <h2 className="font-display text-[16px] font-medium mt-1 ml-1">Upcoming this week</h2>
      <div className="bg-white border border-paper-200 rounded-xl px-3.5 py-1">
        {upcoming.length === 0 ? (
          <div className="text-[11px] text-ink-500 text-center py-6">Nothing scheduled in the next 30 days.</div>
        ) : (
          upcoming.slice(0, 6).map(item => (
            <UpcomingRow
              key={item.id}
              item={item}
              onTap={() => navigate('finance', item.kind === 'emi' ? 'loans' : 'budget')}
            />
          ))
        )}
      </div>

      {/* LAST WEEK */}
      <h2 className="font-display text-[16px] font-medium mt-1 ml-1">Last week</h2>
      <button
        onClick={() => navigate('body-mind', 'progress')}
        className="w-full text-left bg-white border border-paper-200 rounded-xl p-3.5 active:bg-paper-50 transition-colors"
      >
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-display text-[15px] font-medium">{week.rangeLabel}</div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-ink-500">7 days</div>
        </div>

        {/* 7-day strip */}
        <div className="grid grid-cols-7 gap-0.5 mb-3">
          {week.dots.map((d, i) => (
            <div key={i} className="text-center py-1">
              <div className="text-[9px] uppercase tracking-[0.1em] text-ink-500 font-medium">{d.letter}</div>
              <div className="flex justify-center gap-0.5 mt-1 flex-wrap max-w-[18px] mx-auto">
                {[0, 1, 2, 3].map(slot => {
                  const c = d.dots[slot]
                  return <span key={slot} className={`w-1 h-1 rounded-full ${dotBg(c)}`} />
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-paper-100">
          <WeekStat label="Workouts" value={week.totals.workouts} delta={week.deltas.workouts} />
          <WeekStat label="Study days" value={week.totals.studyDays} delta={week.deltas.studyDays} />
          <WeekStat label="Total km run" value={week.totals.totalKm} unit="km" delta={week.deltas.totalKm} />
          <WeekStat label="Reading days" value={week.totals.readingDays} delta={week.deltas.readingDays} />
        </div>

        {/* Best moment */}
        <div className="mt-2.5 px-3 py-2 bg-paper-50 rounded-lg">
          <div className="text-[9px] uppercase tracking-[0.1em] text-ink-500 font-medium">{week.best.label}</div>
          <div className="font-display italic text-[12px] mt-0.5 text-ink-900">{week.best.text}</div>
        </div>
      </button>
    </>
  )
}

// ---- Sub-components ----

function RingStat({ color, name, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium leading-tight">{name}</div>
        <div className="text-[11px] text-ink-500 tabular leading-tight mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function StreakTile({ color, num, label, onClick }) {
  const colors = {
    amber: 'text-accent-amber',
    red: 'text-accent-red',
    indigo: 'text-accent-blue',
  }
  return (
    <button
      onClick={onClick}
      className="bg-white border border-paper-200 rounded-xl px-2 py-2.5 text-center active:bg-paper-50 transition-colors"
    >
      <div className={`font-display text-[22px] font-medium leading-none tabular ${colors[color]}`}>
        {num}<span className="text-[11px] ml-0.5 opacity-80">🔥</span>
      </div>
      <div className="text-[9px] uppercase tracking-[0.1em] text-ink-500 font-medium mt-1">{label}</div>
    </button>
  )
}

function SessionCard({ sessionInfo, workout, onLog, onSkip, onTap }) {
  // If already logged today, show Done state
  if (workout?.done) {
    return (
      <div className="bg-white border border-paper-200 rounded-xl p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent-green text-white flex items-center justify-center flex-shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
          <div>
            <div className="text-[12px] font-medium text-accent-green">Done · {sessionInfo.name}</div>
            <div className="text-[11px] text-ink-700 mt-0.5 tabular">
              {workout.distance ? `${workout.distance} km` : ''}
              {workout.minutes ? ` · ${workout.minutes} min` : ''}
              {workout.distance && workout.minutes ? ` · ${formatPace(workout.distance, workout.minutes)} pace` : ''}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (workout?.skipped) {
    return (
      <div className="bg-white border border-paper-200 rounded-xl p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-ink-500 text-white flex items-center justify-center flex-shrink-0">
            <X size={14} strokeWidth={3} />
          </div>
          <div>
            <div className="text-[12px] font-medium text-ink-500">Rest day</div>
            <div className="text-[11px] text-ink-500 mt-0.5">Recovery is part of the plan</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onTap}
      className="bg-white border border-paper-200 rounded-xl p-3.5 cursor-pointer active:bg-paper-50 transition-colors"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-[0.12em] text-ink-500 font-medium">{sessionInfo.kicker}</div>
          <div className="font-display text-[18px] font-medium mt-1 leading-tight">{sessionInfo.name}</div>
          <div className="text-[11px] text-ink-700 mt-1 leading-snug">{sessionInfo.note}</div>
        </div>
        {sessionInfo.targetLabel && (
          <span className="bg-paper-50 border border-paper-200 rounded-full px-2.5 py-1 text-[11px] tabular font-medium text-ink-700 flex-shrink-0">
            {sessionInfo.targetLabel}
          </span>
        )}
      </div>
      {!sessionInfo.isRest && (
        <div className="flex gap-1.5 mt-3" onClick={e => e.stopPropagation()}>
          <button
            onClick={onSkip}
            className="flex-1 py-2 rounded-full border border-paper-200 bg-white text-[11px] font-medium text-ink-700 active:bg-paper-50"
          >
            Rest day
          </button>
          <button
            onClick={onLog}
            className="flex-1 py-2 rounded-full bg-ink-900 text-white text-[11px] font-medium active:bg-ink-700"
          >
            Log workout
          </button>
        </div>
      )}
    </div>
  )
}

function UpcomingRow({ item, onTap }) {
  return (
    <div
      onClick={onTap}
      className="flex items-center gap-2.5 py-2.5 border-b border-paper-100 last:border-b-0 cursor-pointer active:bg-paper-50 -mx-1 px-1 rounded transition-colors"
    >
      <div className={`w-9 h-9 flex-shrink-0 rounded-lg border flex flex-col items-center justify-center ${
        item.isImminent
          ? 'bg-accent-amber/10 border-accent-amber'
          : 'bg-paper-50 border-paper-200'
      }`}>
        <div className={`font-display text-[14px] font-semibold leading-none ${
          item.isImminent ? 'text-accent-amber' : 'text-ink-900'
        }`}>{item.dayNum}</div>
        <div className={`text-[8px] uppercase tracking-[0.1em] mt-0.5 ${
          item.isImminent ? 'text-accent-amber' : 'text-ink-500'
        }`}>{item.monthShort}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{item.name}</div>
        <div className="text-[11px] text-ink-500 mt-0.5">{item.whenLabel}</div>
      </div>
      <span className={`text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full font-medium ${
        item.kind === 'emi'
          ? 'bg-accent-red/10 text-accent-red'
          : 'bg-paper-100 text-ink-700'
      }`}>
        {item.tagLabel}
      </span>
    </div>
  )
}

function WeekStat({ label, value, unit, delta }) {
  const isUp = (delta ?? 0) >= 0
  const showDelta = delta !== undefined && delta !== null && delta !== 0
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.1em] text-ink-500 font-medium">{label}</div>
      <div className="font-display text-[17px] font-medium mt-0.5 tabular">
        {value}{unit ? <span className="text-[11px] text-ink-500 ml-0.5">{unit}</span> : null}
      </div>
      {showDelta && (
        <div className={`text-[10px] tabular mt-0.5 ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
          {isUp ? '+' : ''}{delta}{unit ? ` ${unit}` : ''} vs prior
        </div>
      )}
    </div>
  )
}

// ---- Helpers ----

function dotBg(color) {
  switch (color) {
    case 'red': return 'bg-accent-red'
    case 'green': return 'bg-accent-green'
    case 'blue': return 'bg-accent-blue'
    case 'amber': return 'bg-accent-amber'
    default: return 'bg-paper-200'
  }
}

function getDayName(dayOfWeek) {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
}

function formatPace(distance, minutes) {
  if (!distance || !minutes || distance <= 0) return ''
  const minPerKm = minutes / Number(distance)
  const m = Math.floor(minPerKm)
  const s = Math.round((minPerKm - m) * 60)
  return `${m}:${String(s).padStart(2, '0')}/km`
}

function computeRingValues({ life, todayEntry, dayOfWeek }) {
  // Move ring — based on workout (distance vs target)
  const workout = todayEntry.workout || {}
  const moveTarget = getMoveTarget({ life, dayOfWeek })
  const moveDone = workout.distance ? Number(workout.distance) : 0
  const moveProgress = moveTarget > 0 ? Math.min(1, moveDone / moveTarget) : (workout.done ? 1 : 0)

  // Fuel ring — calories
  const nutrition = todayEntry.nutrition || {}
  const calories = nutrition.calories ? Number(nutrition.calories) : 0
  const fuelProgress = Math.min(1, calories / DAILY_TARGETS.caloriesTarget)

  // Build ring — study minutes
  const study = todayEntry.study || {}
  const studyMinutes = study.minutes ? Number(study.minutes) : 0
  const buildProgress = Math.min(1, studyMinutes / DAILY_TARGETS.studyMinutesTarget)

  // Read ring — reading minutes
  const reading = todayEntry.reading || {}
  const readingMinutes = reading.minutes ? Number(reading.minutes) : 0
  const readProgress = Math.min(1, readingMinutes / DAILY_TARGETS.readingMinutesTarget)

  return {
    move: moveProgress,
    fuel: fuelProgress,
    build: buildProgress,
    read: readProgress,
    moveLabel: moveTarget > 0 ? `${moveDone} / ${moveTarget} km` : (workout.done ? 'Done' : 'Rest day'),
    fuelLabel: `${formatNum(calories)} / ${formatNum(DAILY_TARGETS.caloriesTarget)} cal`,
    buildLabel: `${studyMinutes} / ${DAILY_TARGETS.studyMinutesTarget} min`,
    readLabel: `${readingMinutes} / ${DAILY_TARGETS.readingMinutesTarget} min`,
  }
}

function getMoveTarget({ life, dayOfWeek }) {
  // For Sunday, use long run target from progression
  // For other days, return 0 (move ring fills based on workout.done)
  if (dayOfWeek !== 0) return 0
  const week = life?.derived?.currentWeek || 1
  const longRun = getLongRunTarget(week)
  return longRun?.target || 5
}

function getTodaysSession({ life, dayOfWeek }) {
  const w = WORKOUTS[dayOfWeek]
  const isSunday = dayOfWeek === 0
  const week = life?.derived?.currentWeek || 1
  const longRun = isSunday ? getLongRunTarget(week) : null

  if (w?.type === 'rest') {
    return {
      kicker: 'Recovery',
      name: w.name || 'Rest day',
      note: w.note || 'Recovery is part of the plan',
      targetLabel: null,
      isRest: true,
      label: 'rest',
    }
  }
  return {
    kicker: `${getDayName(dayOfWeek)} · ${w?.type || 'today'}`,
    name: w?.name || 'Workout',
    note: w?.note || '',
    targetLabel: longRun ? `${longRun.target} km` : null,
    isRest: false,
    label: w?.type || 'session',
  }
}

function formatNum(n) {
  return Math.round(n).toLocaleString('en-IN')
}

// ---- Action handlers ----

function handleLogWorkout({ life, sessionInfo, showToast }) {
  // For now, just mark as done. The detailed time/distance entry happens in BodyView.
  if (!life?.actions?.updateDaily) return
  life.actions.updateDaily('workout', { done: true })
  if (showToast) {
    showToast({
      title: 'Move goal hit 🎯',
      detail: `${sessionInfo.name} logged · streak extended`,
    })
  }
}

function handleSkipWorkout({ life }) {
  if (!life?.actions?.updateDaily) return
  life.actions.updateDaily('workout', { skipped: true })
}

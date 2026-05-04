// Compute last week's summary for the Home page.
// Reads life.dailyLog and produces:
//   - 7-day strip with what was done each day
//   - Aggregate totals
//   - Comparison vs prior week (deltas)
//   - "Best moment" — the most notable single day

const HABIT_KEYS = ['workout', 'study', 'reading', 'nutrition']
const DOT_COLORS = {
  workout: 'red',
  nutrition: 'green',
  study: 'blue',
  reading: 'amber',
}

export function computeLastWeekSummary(dailyLog = {}) {
  const today = new Date()
  // Start of "last week" = 7 days ago, going back from yesterday
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const weekStart = new Date(yesterday)
  weekStart.setDate(yesterday.getDate() - 6)

  // Prior week (the 7 days before that)
  const priorEnd = new Date(weekStart)
  priorEnd.setDate(weekStart.getDate() - 1)
  const priorStart = new Date(priorEnd)
  priorStart.setDate(priorEnd.getDate() - 6)

  // Build 7-day strip
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const entry = dailyLog[key] || {}
    days.push({
      date: d,
      letter: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      didWorkout: !!entry.workout?.done,
      didStudy: !!entry.study?.studied,
      didReading: !!entry.reading?.read,
      didNutrition: !!entry.nutrition?.logged,
      runKm: entry.workout?.distance ? Number(entry.workout.distance) : 0,
      runMinutes: entry.workout?.minutes ? Number(entry.workout.minutes) : 0,
      studyMinutes: entry.study?.minutes ? Number(entry.study.minutes) : 0,
      readingMinutes: entry.reading?.minutes ? Number(entry.reading.minutes) : 0,
      raw: entry,
    })
  }

  const dots = days.map(d => {
    const arr = []
    if (d.didWorkout) arr.push(DOT_COLORS.workout)
    if (d.didNutrition) arr.push(DOT_COLORS.nutrition)
    if (d.didStudy) arr.push(DOT_COLORS.study)
    if (d.didReading) arr.push(DOT_COLORS.reading)
    return { letter: d.letter, dots: arr }
  })

  // Aggregate
  const totals = {
    workouts: days.filter(d => d.didWorkout).length,
    studyDays: days.filter(d => d.didStudy).length,
    readingDays: days.filter(d => d.didReading).length,
    totalKm: round1(days.reduce((s, d) => s + d.runKm, 0)),
  }

  // Prior week aggregates
  const priorDays = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(priorStart)
    d.setDate(priorStart.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const entry = dailyLog[key] || {}
    priorDays.push({
      didWorkout: !!entry.workout?.done,
      didStudy: !!entry.study?.studied,
      didReading: !!entry.reading?.read,
      runKm: entry.workout?.distance ? Number(entry.workout.distance) : 0,
    })
  }
  const priorTotals = {
    workouts: priorDays.filter(d => d.didWorkout).length,
    studyDays: priorDays.filter(d => d.didStudy).length,
    readingDays: priorDays.filter(d => d.didReading).length,
    totalKm: round1(priorDays.reduce((s, d) => s + d.runKm, 0)),
  }

  // Deltas
  const deltas = {
    workouts: totals.workouts - priorTotals.workouts,
    studyDays: totals.studyDays - priorTotals.studyDays,
    readingDays: totals.readingDays - priorTotals.readingDays,
    totalKm: round1(totals.totalKm - priorTotals.totalKm),
  }

  // Best moment — pick the longest run if any, else the most-studied day, else
  // the highest activity day overall.
  const bestRunDay = days
    .filter(d => d.runKm > 0)
    .sort((a, b) => b.runKm - a.runKm)[0]

  let best = null
  if (bestRunDay) {
    best = {
      label: 'Best moment',
      text: `${bestRunDay.date.toLocaleDateString('en-US', { weekday: 'long' })}'s ${bestRunDay.runKm} km run`,
    }
  } else {
    const longestStudy = days.filter(d => d.studyMinutes > 0)
      .sort((a, b) => b.studyMinutes - a.studyMinutes)[0]
    if (longestStudy) {
      best = {
        label: 'Most-focused day',
        text: `${longestStudy.date.toLocaleDateString('en-US', { weekday: 'long' })} · ${longestStudy.studyMinutes} min studied`,
      }
    } else {
      best = {
        label: 'Quiet week',
        text: 'No standout moment yet — every show-up still counts',
      }
    }
  }

  // Date range label
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const rangeLabel = `${fmt(weekStart)} – ${fmt(yesterday)}`

  return {
    rangeLabel,
    dots,
    totals,
    priorTotals,
    deltas,
    best,
  }
}

function round1(n) {
  return Math.round(n * 10) / 10
}

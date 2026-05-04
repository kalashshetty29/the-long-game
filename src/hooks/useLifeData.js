import { useEffect, useState, useCallback, useMemo } from 'react'
import { loadData, saveData, onAuthChange } from '../lib/storage'
import { PLAN, getQuoteForDay } from '../lib/life-data'

// Initial state shape — matches the original tracker_v2.jsx
const DEFAULT_LIFE_STATE = {
  startDate: null,
  completedWeeks: {},
  dailyLog: {},
  customGoals: [],
  checkpoints: {},
  reflections: {},
  currentBook: '',
  bookHistory: [],
}

export function useLifeData() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load + reload on auth change
  useEffect(() => {
    let mounted = true

    async function reload() {
      if (!mounted) return
      setLoading(true)
      const stored = await loadData('life')
      if (mounted) {
        const merged = stored ? { ...DEFAULT_LIFE_STATE, ...stored } : DEFAULT_LIFE_STATE
        setState(merged)
        setLoading(false)
      }
    }

    reload()
    const unsubscribe = onAuthChange(() => reload())
    return () => { mounted = false; if (unsubscribe) unsubscribe() }
  }, [])

  // Auto-save (debounced)
  useEffect(() => {
    if (!state || loading) return
    setSaving(true)
    const t = setTimeout(async () => {
      await saveData(state, 'life')
      setSaving(false)
    }, 400)
    return () => clearTimeout(t)
  }, [state, loading])

  const save = useCallback((next) => {
    setState(prev => typeof next === 'function' ? next(prev) : next)
  }, [])

  // ---- Derived data ----
  const derived = useMemo(() => {
    if (!state) return null
    const today = new Date()
    const todayKey = today.toISOString().slice(0, 10)
    const dayOfWeek = today.getDay()

    const daysSinceStart = state.startDate
      ? Math.floor((today - new Date(state.startDate)) / (1000 * 60 * 60 * 24))
      : null

    const currentWeek = daysSinceStart !== null ? Math.floor(daysSinceStart / 7) + 1 : 1
    const currentMonth = Math.min(12, Math.ceil(currentWeek / 4))
    const weekOfMonth = ((currentWeek - 1) % 4) + 1

    const currentPhase = PLAN.find(p => p.months.some(m => m.num === currentMonth)) || PLAN[0]
    const currentMonthData = currentPhase.months.find(m => m.num === currentMonth) || PLAN[0].months[0]
    const currentWeekTask = currentMonthData.weekly[weekOfMonth - 1] || currentMonthData.weekly[0]

    const quote = getQuoteForDay(daysSinceStart || 0)

    // Streaks — count back from today
    const computeStreak = (predicate) => {
      let streak = 0
      const d = new Date(today)
      while (true) {
        const key = d.toISOString().slice(0, 10)
        if (predicate(state.dailyLog[key])) {
          streak++
          d.setDate(d.getDate() - 1)
        } else break
      }
      return streak
    }

    const studyStreak = computeStreak(entry => entry?.study?.studied)
    const workoutStreak = computeStreak(entry => entry?.workout?.done)
    const readingStreak = computeStreak(entry => entry?.reading?.read)

    return {
      today, todayKey, dayOfWeek,
      daysSinceStart, currentWeek, currentMonth, weekOfMonth,
      currentPhase, currentMonthData, currentWeekTask,
      quote,
      studyStreak, workoutStreak, readingStreak,
      todayEntry: state.dailyLog[todayKey] || {},
    }
  }, [state])

  // ---- Action helpers — used by view components ----
  const actions = useMemo(() => ({
    startJourney: () => save(s => ({ ...s, startDate: new Date().toISOString() })),

    updateDaily: (section, patch) => save(s => {
      const todayKey = new Date().toISOString().slice(0, 10)
      const current = s.dailyLog[todayKey] || {}
      const newSection = { ...(current[section] || {}), ...patch }
      return {
        ...s,
        dailyLog: { ...s.dailyLog, [todayKey]: { ...current, [section]: newSection } },
      }
    }),

    toggleWeek: (monthNum, weekNum) => save(s => {
      const key = `${monthNum}-${weekNum}`
      return { ...s, completedWeeks: { ...s.completedWeeks, [key]: !s.completedWeeks[key] } }
    }),

    toggleCheckpoint: (monthNum) => save(s => {
      const key = `month-${monthNum}`
      return { ...s, checkpoints: { ...s.checkpoints, [key]: !s.checkpoints[key] } }
    }),

    updateReflection: (monthNum, text) => save(s => ({
      ...s, reflections: { ...s.reflections, [`month-${monthNum}`]: text }
    })),

    addCustomGoal: (text) => {
      if (!text.trim()) return
      const todayKey = new Date().toISOString().slice(0, 10)
      save(s => ({ ...s, customGoals: [...s.customGoals, {
        id: Date.now(), text: text.trim(), done: false, createdAt: todayKey
      }] }))
    },

    toggleCustomGoal: (id) => save(s => ({
      ...s, customGoals: s.customGoals.map(g => g.id === id ? { ...g, done: !g.done } : g)
    })),

    removeCustomGoal: (id) => save(s => ({
      ...s, customGoals: s.customGoals.filter(g => g.id !== id)
    })),

    updateBook: (title) => save(s => ({ ...s, currentBook: title })),

    exportData: () => {
      try {
        const payload = {
          exportedAt: new Date().toISOString(),
          version: 'tracker-v2',
          data: state,
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `long-game-life-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        alert('Export failed: ' + e.message)
      }
    },

    importData: (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result)
          const incoming = parsed.data || parsed
          if (!incoming.startDate) {
            alert('This does not look like a valid Life backup.')
            return
          }
          const confirmed = window.confirm(
            `Import backup from ${parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString() : 'unknown date'}? This will REPLACE your current Life data.`
          )
          if (confirmed) {
            save(incoming)
            alert('Backup restored successfully.')
          }
        } catch (err) {
          alert('Could not read that file: ' + err.message)
        }
      }
      reader.readAsText(file)
      event.target.value = ''
    },
  }), [state, save])

  return { state, derived, actions, save, loading, saving }
}

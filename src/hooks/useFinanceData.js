import { useEffect, useState, useCallback, useMemo } from 'react'
import { loadData, saveData, isCloudActive, onAuthChange } from '../lib/storage'
import {
  DEFAULT_DATA,
  computeMonthlyBudget,
  buildForeclosureSchedule,
  summarizeSchedule,
  gearPlan,
} from '../lib/finance-data'

export function useFinanceData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cloud, setCloud] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initial load + reload on auth change
  useEffect(() => {
    let mounted = true

    async function reload() {
      if (!mounted) return
      setLoading(true)
      const stored = await loadData('finance')
      const cloudActive = await isCloudActive()
      if (mounted) {
        const merged = stored ? mergeWithDefaults(stored, DEFAULT_DATA) : DEFAULT_DATA
        setData(merged)
        setCloud(cloudActive)
        setLoading(false)
      }
    }

    reload()
    const unsubscribe = onAuthChange(() => reload())
    return () => { mounted = false; if (unsubscribe) unsubscribe() }
  }, [])

  // Auto-save on change (debounced)
  useEffect(() => {
    if (!data || loading) return
    setSaving(true)
    const t = setTimeout(async () => {
      await saveData(data, 'finance')
      setSaving(false)
    }, 400)
    return () => clearTimeout(t)
  }, [data, loading])

  const update = useCallback((updater) => {
    setData(prev => typeof updater === 'function' ? updater(prev) : updater)
  }, [])

  const reset = useCallback(() => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      setData(DEFAULT_DATA)
    }
  }, [])

  // Derived state — recomputed when data changes
  const derived = useMemo(() => {
    if (!data) return null
    const budget = computeMonthlyBudget(data)
    const schedule = buildForeclosureSchedule(data, 24)
    const summary = summarizeSchedule(schedule, data)
    const gear = gearPlan(data, schedule)
    return { budget, schedule, summary, gear }
  }, [data])

  return { data, derived, update, reset, loading, cloud, saving }
}

// Shallow-merge stored data with defaults: ensures new fields appear for existing users.
// Stored values for fields that exist take precedence; missing fields fall back to defaults.
function mergeWithDefaults(stored, defaults) {
  const merged = { ...defaults }
  for (const key of Object.keys(stored)) {
    if (Array.isArray(stored[key])) {
      merged[key] = stored[key]
    } else if (stored[key] && typeof stored[key] === 'object' && !Array.isArray(defaults[key])) {
      merged[key] = { ...(defaults[key] || {}), ...stored[key] }
    } else {
      merged[key] = stored[key]
    }
  }
  return merged
}

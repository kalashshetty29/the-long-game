// Cross-space alerts engine.
// Reads the finance state and produces a small list of "urgent" signals
// to surface in the Life "Today" view. Strict bar: only things that need
// action in the next 48 hours OR are overdue.
//
// The output is rendered as a compact card in TodayView. If there are
// no urgent alerts, nothing renders — keeps the Life space clean.

import { formatINR, computeLoanOutstanding, currentPoolContribution } from './finance-data'

// How many days ahead to look for upcoming auto-debits
const LOOKAHEAD_DAYS = 2

export function computeAlerts(financeData) {
  if (!financeData) return []
  const alerts = []
  const now = new Date()
  const today = now.getDate()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysIntoMonth = today

  // --- ALERT 1: Upcoming EMI auto-debits in next 48h ---
  for (const loan of (financeData.loans || [])) {
    const debitDay = loan.autoDebitDay
    if (!debitDay) continue

    // Days until next debit
    let daysUntil
    if (debitDay >= today) {
      daysUntil = debitDay - today
    } else {
      // next month
      const remainingThisMonth = monthEnd - today
      daysUntil = remainingThisMonth + debitDay
    }

    // Only alert if outstanding > 0 (loan not foreclosed yet)
    const outstanding = computeLoanOutstanding(loan, now)
    if (outstanding <= 0) continue

    if (daysUntil <= LOOKAHEAD_DAYS) {
      const whenLabel = daysUntil === 0
        ? 'today'
        : daysUntil === 1
          ? 'tomorrow'
          : `in ${daysUntil} days`
      alerts.push({
        id: `emi-${loan.id}`,
        severity: daysUntil === 0 ? 'high' : 'medium',
        icon: '💸',
        title: `${loan.name} EMI ${whenLabel}`,
        detail: `${formatINR(loan.emi)} will auto-debit on the ${ordinal(debitDay)}.`,
      })
    }
  }

  // --- ALERT 2: Phone EMI ending this month ---
  // Surface this once around the end of the EMI's last month so the user
  // remembers to update budget after.
  const phoneExpense = (financeData.fixedExpenses || []).find(e =>
    e.id === 'phone' || (e.label && e.label.toLowerCase().includes('phone'))
  )
  if (phoneExpense?.endsOn) {
    const endDate = new Date(phoneExpense.endsOn)
    const daysUntilEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    if (daysUntilEnd >= 0 && daysUntilEnd <= 7) {
      alerts.push({
        id: 'phone-ending',
        severity: 'low',
        icon: '🎉',
        title: 'Phone EMI ends this week',
        detail: `Surplus jumps by ${formatINR(phoneExpense.amount)} from next month onwards.`,
      })
    }
  }

  // --- ALERT 3: Pool contribution overdue (mid-month, not logged) ---
  const pool = financeData.triumphPool
  if (pool) {
    const current = currentPoolContribution(financeData)
    if (current) {
      // Is the "current" contribution actually for the current calendar month?
      const currentMonthKey = new Date().toISOString().slice(0, 7)  // 'YYYY-MM'
      if (current.month === currentMonthKey && daysIntoMonth >= 14) {
        alerts.push({
          id: 'pool-overdue',
          severity: daysIntoMonth >= 25 ? 'high' : 'medium',
          icon: '🎯',
          title: `${current.label} pool transfer pending`,
          detail: `Plan: ${formatINR(current.plan)} to your savings pool.`,
        })
      }
    }
  }

  // Sort by severity (high first)
  const order = { high: 0, medium: 1, low: 2 }
  alerts.sort((a, b) => order[a.severity] - order[b.severity])

  return alerts
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

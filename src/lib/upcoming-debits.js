// Compute the list of upcoming auto-debits for the Home page.
// Combines fixedExpenses (subscriptions) + loan EMIs.
// Returns sorted by next debit date, with day/month metadata.
// AMOUNTS ARE INCLUDED in the data but the Home UI hides them — they're
// only revealed in the Budget tab.

export function computeUpcomingDebits(financeData, options = {}) {
  if (!financeData) return []
  const { lookaheadDays = 30 } = options
  const now = new Date()
  const today = now.getDate()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const items = []

  // ---- Subscriptions (fixedExpenses with debitDay) ----
  for (const exp of (financeData.fixedExpenses || [])) {
    if (!exp.debitDay) continue
    // skip phone if it's beyond its endsOn date
    if (exp.endsOn && new Date(exp.endsOn) < now) continue

    // Compute next debit date
    const debitDate = nextDebitDate(exp.debitDay, now)
    items.push({
      id: exp.id || exp.label,
      kind: 'sub',
      name: exp.label,
      amount: exp.amount,
      date: debitDate,
      tagLabel: 'Sub',
    })
  }

  // ---- Loan EMIs ----
  for (const loan of (financeData.loans || [])) {
    if (!loan.autoDebitDay) continue
    // skip if loan is already foreclosed
    const outstanding = loan.outstandingOverride
    if (outstanding != null && outstanding <= 0) continue

    const debitDate = nextDebitDate(loan.autoDebitDay, now)
    items.push({
      id: `loan-${loan.id}`,
      kind: 'emi',
      name: `${loan.name} EMI`,
      amount: loan.emi,
      date: debitDate,
      tagLabel: 'EMI',
    })
  }

  // ---- Sort ascending by date, filter to lookahead window ----
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() + lookaheadDays)

  return items
    .filter(i => i.date <= cutoff)
    .sort((a, b) => a.date - b.date)
    .map(i => decorate(i, now))
}

function nextDebitDate(debitDay, from) {
  const today = from.getDate()
  const m = from.getMonth()
  const y = from.getFullYear()

  let target
  if (debitDay >= today) {
    // this month, on debitDay
    target = new Date(y, m, debitDay)
  } else {
    // next month
    target = new Date(y, m + 1, debitDay)
  }
  return target
}

function decorate(item, now) {
  // Calendar-day diff (ignore time-of-day): both dates aligned to midnight
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate())
  const days = Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24))

  let whenLabel
  if (days <= 0) whenLabel = 'Today · auto-debit'
  else if (days === 1) whenLabel = 'Tomorrow · auto-debit'
  else if (days < 7) whenLabel = `In ${days} days`
  else if (days < 14) whenLabel = `Next week · in ${days} days`
  else whenLabel = `In ${days} days`

  return {
    ...item,
    daysUntil: days,
    isImminent: days <= 1,
    whenLabel,
    dayNum: item.date.getDate(),
    monthShort: item.date.toLocaleDateString('en-US', { month: 'short' }),
  }
}

// Pure financial calculations. No UI, no storage. Easy to reason about.

export const DEFAULT_DATA = {
  // Core
  salary: 80000,
  emergencyFund: 30000,

  // Fixed expenses (recurring monthly).
  // debitDay: which day of the month it auto-debits (used by Home upcoming list).
  // Family contribution doesn't have a fixed debit day — set null to skip Home reminder.
  fixedExpenses: [
    { id: 'family',   label: 'Family contribution (rent)', amount: 15000, debitDay: null, isLoanEmi: false, endsOn: null },
    { id: 'wifi',     label: 'WiFi',                       amount: 1179,  debitDay: 1,    isLoanEmi: false, endsOn: null },
    { id: 'netflix',  label: 'Netflix',                    amount: 649,   debitDay: 26,   isLoanEmi: false, endsOn: null },
    { id: 'spotify',  label: 'Spotify',                    amount: 179,   debitDay: 26,   isLoanEmi: false, endsOn: null },
    { id: 'icloud',   label: 'iCloud',                     amount: 75,    debitDay: 24,   isLoanEmi: false, endsOn: null },
    { id: 'phone',    label: 'Phone EMI',                  amount: 2913,  debitDay: 5,    isLoanEmi: false, endsOn: '2026-06-30' },
  ],

  // Variable / discretionary
  variableBudget: [
    { id: 'groceries',  label: 'Groceries',          amount: 4000 },
    { id: 'mobile',     label: 'Mobile recharge',    amount: 800 },
    { id: 'fuel',       label: 'Fuel',               amount: 3000 },
    { id: 'eatingout',  label: 'Eating out',         amount: 3500 },
    { id: 'misc',       label: 'Miscellaneous',      amount: 3500 },
  ],

  // Loans
  loans: [
    {
      id: 'triumph',
      name: 'Triumph Scrambler',
      principal: 315441,
      emi: 10333,
      ratePct: 11.36,                  // forward rate that fits bank's outstanding + EMI exactly
      tenureMonths: 36,
      startDate: '2025-07-01',
      autoDebitDay: 3,                 // EMI debits on 3rd of every month
      foreclosureChargePct: 4,         // verify with bank
      forecloseFirst: true,
      // BANK's actual outstanding as of May 4, 2026 (after 11 EMIs paid through May 3)
      outstandingOverride: 229066.63,
      outstandingAsOf: '2026-05-04',
      emisPaid: 11,
    },
    {
      id: 'ather',
      name: 'Ather Rizta',
      principal: 139000,
      emi: 4786,
      ratePct: 12.90,                  // back-calculated exactly from EMI / tenure / principal
      tenureMonths: 35,
      startDate: '2025-07-01',
      autoDebitDay: 5,                 // EMI debits on 5th of every month
      foreclosureChargePct: 3,         // verify with bank
      forecloseFirst: false,
      downPayment: 36312,
      // 10 EMIs paid Jul'25-Apr'26; May 5 EMI not yet debited as of May 4
      outstandingOverride: 104438,     // outstanding as of May 4, 2026 (will drop to ₹1,00,774 after May 5)
      outstandingAsOf: '2026-05-04',
      emisPaid: 10,
    }
  ],

  // Gear savings goal
  gear: {
    totalCost: 53398,
    monthlyContribution: 15000,
    alreadySaved: 0,
  },

  // Triumph foreclosure savings pool
  // Each contribution is logged month-by-month as the user actually transfers
  // to a separate savings account.
  triumphPool: {
    targetLoanId: 'triumph',
    foreclosureMonth: null,          // 'oct' | 'nov' | 'dec' | null — user picks
    plannedContributions: [
      { id: 'may26', month: '2026-05', label: 'May 2026', plan: 30154, note: 'Phone EMI active' },
      { id: 'jun26', month: '2026-06', label: 'Jun 2026', plan: 30154, note: 'Last month with phone EMI' },
      { id: 'jul26', month: '2026-07', label: 'Jul 2026', plan: 33067, note: 'Phone EMI ends → +₹2,913' },
      { id: 'aug26', month: '2026-08', label: 'Aug 2026', plan: 33067, note: '' },
      { id: 'sep26', month: '2026-09', label: 'Sep 2026', plan: 33067, note: '' },
      { id: 'oct26', month: '2026-10', label: 'Oct 2026', plan: 33067, note: 'Possible foreclose month' },
      { id: 'nov26', month: '2026-11', label: 'Nov 2026', plan: 33067, note: 'Recommended foreclose month' },
    ],
    // actuals[id] = { amount, transferDate, skipped }
    actuals: {},
  },

  // Transaction log (entries the user adds via "log expense" button)
  transactions: [],
}

// ---- Date helpers ----
export function monthsBetween(start, end) {
  const a = new Date(start), b = new Date(end)
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

export function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function formatMonthYear(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatINR(amount) {
  if (amount === 0) return '₹0'
  if (amount < 0) return `-₹${Math.abs(Math.round(amount)).toLocaleString('en-IN')}`
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

// ---- Loan math ----
export function computeLoanOutstanding(loan, asOfDate = new Date()) {
  if (loan.outstandingOverride != null && loan.outstandingOverride !== '') {
    return Number(loan.outstandingOverride)
  }
  const elapsed = Math.max(0, monthsBetween(loan.startDate, asOfDate))
  const r = loan.ratePct / 100 / 12
  if (r === 0) {
    return Math.max(0, loan.principal - loan.emi * elapsed)
  }
  // Outstanding after `elapsed` payments on a fixed-rate amortizing loan
  const balance = loan.principal * Math.pow(1 + r, elapsed) -
                  loan.emi * (Math.pow(1 + r, elapsed) - 1) / r
  return Math.max(0, balance)
}

export function loanMonthsRemaining(loan, asOfDate = new Date()) {
  const elapsed = Math.max(0, monthsBetween(loan.startDate, asOfDate))
  return Math.max(0, loan.tenureMonths - elapsed)
}

// ---- Budget totals ----
// Considers expenses that are still active as of `asOfDate` (e.g., phone EMI ends June 2026)
export function computeMonthlyBudget(data, asOfDate = new Date()) {
  const today = new Date(asOfDate)
  const fixedActive = data.fixedExpenses.filter(e => {
    if (!e.endsOn) return true
    return new Date(e.endsOn) >= today
  })
  const fixedTotal = fixedActive.reduce((s, e) => s + Number(e.amount || 0), 0)
  const loanEmiTotal = data.loans
    .filter(l => computeLoanOutstanding(l, today) > 0)
    .reduce((s, l) => s + Number(l.emi || 0), 0)
  const variableTotal = data.variableBudget.reduce((s, e) => s + Number(e.amount || 0), 0)
  const totalExpenses = fixedTotal + loanEmiTotal + variableTotal
  const surplus = Number(data.salary || 0) - totalExpenses
  return { fixedTotal, loanEmiTotal, variableTotal, totalExpenses, surplus }
}

// ---- Foreclosure schedule ----
// Simulates month-by-month: pay EMIs + extra at the priority loan, then save up to foreclose the next.
// Stops when both loans cleared OR after maxMonths months.
export function buildForeclosureSchedule(data, maxMonths = 24) {
  const today = new Date()
  today.setDate(1) // normalize to first of month
  const schedule = []

  // Working state (immutable inputs, mutable balances)
  const loans = data.loans.map(l => ({
    ...l,
    balance: computeLoanOutstanding(l, today),
    cleared: computeLoanOutstanding(l, today) <= 0,
    foreclosedAt: null,
  }))
  let cashPool = 0  // cash being saved up to foreclose loan #2

  // Sort loans: forecloseFirst goes first
  loans.sort((a, b) => (b.forecloseFirst ? 1 : 0) - (a.forecloseFirst ? 1 : 0))

  for (let m = 0; m < maxMonths; m++) {
    const monthDate = addMonths(today, m)
    const budget = computeMonthlyBudget(data, monthDate)
    const baseSurplus = budget.surplus

    const row = {
      month: m + 1,
      date: monthDate,
      surplus: baseSurplus,
      loans: loans.map(l => ({ id: l.id, name: l.name, openBalance: l.balance, action: '', closeBalance: l.balance })),
      cashPool,
      totalDebt: loans.reduce((s, l) => s + l.balance, 0),
      milestone: null,
    }

    // Each month we have:
    //   1. Pay regular EMIs on all uncleared loans (reduces balance by EMI; ignoring re-accrual for simplicity)
    //   2. Direct surplus to the priority loan (the first uncleared "forecloseFirst" one, or the next one)
    //   3. If priority loan would be cleared this month with less than the full surplus,
    //      remainder goes to the next loan's foreclosure cash pool.

    // Step 1: EMIs (already accounted in budget — but apply paydown to balances)
    loans.forEach((l, idx) => {
      if (l.balance > 0) {
        const rowEntry = row.loans[idx]
        const paid = Math.min(l.emi, l.balance)
        l.balance = Math.max(0, l.balance - paid)
        rowEntry.action = `EMI ${formatINR(paid)}`
      } else {
        const rowEntry = row.loans[idx]
        rowEntry.action = '✓ Cleared'
      }
    })

    // Step 2: extra payment toward priority uncleared loan
    let remainingSurplus = baseSurplus
    const priorityIdx = loans.findIndex(l => l.balance > 0)

    if (priorityIdx === -1) {
      // All loans cleared!
      row.loans.forEach(r => { if (r.openBalance === 0) r.action = '✓ Done' })
    } else {
      const priority = loans[priorityIdx]
      const rowEntry = row.loans[priorityIdx]

      if (priorityIdx === 0 && priority.forecloseFirst) {
        // Aggressive paydown of loan 1
        const extra = Math.min(remainingSurplus, priority.balance)
        priority.balance -= extra
        remainingSurplus -= extra
        rowEntry.action = `EMI + ${formatINR(extra)} extra`
        if (priority.balance <= 0 && extra < remainingSurplus + extra) {
          rowEntry.action = `Final: ${formatINR(extra + priority.emi)}`
        }
        if (priority.balance <= 0) {
          priority.foreclosedAt = m + 1
          row.milestone = `🎯 ${priority.name} CLEARED!`
        }
      } else {
        // Build cash pool to foreclose loan 2 in one shot
        cashPool += remainingSurplus
        remainingSurplus = 0
        const targetCash = priority.balance * (1 + priority.foreclosureChargePct / 100)
        if (cashPool >= targetCash) {
          // Foreclose this month
          const charge = priority.balance * (priority.foreclosureChargePct / 100)
          cashPool -= (priority.balance + charge)
          priority.balance = 0
          priority.foreclosedAt = m + 1
          rowEntry.action = `🎯 FORECLOSED!`
          row.milestone = `🎯 ${priority.name} FORECLOSED!`
        } else {
          rowEntry.action = `Saving (${formatINR(cashPool)})`
        }
      }
    }

    // Update row close balances
    row.loans.forEach((r, idx) => { r.closeBalance = loans[idx].balance })
    row.cashPool = cashPool
    row.totalDebt = loans.reduce((s, l) => s + l.balance, 0)

    schedule.push(row)

    // If everyone's cleared, add a couple more rows for visual confirmation then stop
    if (loans.every(l => l.balance <= 0)) {
      if (schedule.length > 0 && row.totalDebt === 0 && schedule.filter(r => r.totalDebt === 0).length >= 2) {
        break
      }
    }
  }

  return schedule
}

// ---- Summary stats derived from schedule ----
export function summarizeSchedule(schedule, data) {
  const debtFreeMonth = schedule.findIndex(r => r.totalDebt === 0)
  const debtFreeDate = debtFreeMonth >= 0 ? schedule[debtFreeMonth].date : null

  const loan1ClearedMonth = schedule.findIndex(r => r.loans[0]?.closeBalance === 0)
  const loan2ClearedMonth = schedule.findIndex(r => r.loans[1]?.closeBalance === 0)

  // Estimate interest saved
  const totalInterestSaved = data.loans.reduce((sum, l) => {
    const out = computeLoanOutstanding(l, new Date())
    const monthsLeft = loanMonthsRemaining(l)
    const futureInterest = Math.max(0, l.emi * monthsLeft - out)
    const charge = out * (l.foreclosureChargePct / 100)
    return sum + Math.max(0, futureInterest - charge)
  }, 0)

  return {
    debtFreeMonth,
    debtFreeDate,
    loan1ClearedMonth,
    loan2ClearedMonth,
    loan1ClearedDate: loan1ClearedMonth >= 0 ? schedule[loan1ClearedMonth].date : null,
    loan2ClearedDate: loan2ClearedMonth >= 0 ? schedule[loan2ClearedMonth].date : null,
    totalInterestSaved,
  }
}

// ---- Gear plan ----
export function gearPlan(data, schedule) {
  const summary = summarizeSchedule(schedule, data)
  const remaining = Math.max(0, data.gear.totalCost - data.gear.alreadySaved)
  const monthsToFund = data.gear.monthlyContribution > 0
    ? Math.ceil(remaining / data.gear.monthlyContribution)
    : null
  const startMonth = summary.debtFreeMonth >= 0 ? summary.debtFreeMonth + 1 : null
  const readyDate = (startMonth != null && monthsToFund != null)
    ? addMonths(new Date(), startMonth + monthsToFund)
    : null
  return { remaining, monthsToFund, readyDate }
}

// ---- Triumph foreclosure pool ----
// Calculates outstanding at any future month using the loan's stored rate + EMI,
// anchored on the bank's actual outstanding (outstandingOverride).
export function projectLoanBalance(loan, monthsAhead) {
  const r = loan.ratePct / 100 / 12
  const emi = loan.emi
  let bal = (loan.outstandingOverride != null ? Number(loan.outstandingOverride) : loan.principal)
  for (let i = 0; i < monthsAhead; i++) {
    const interest = bal * r
    const principal = emi - interest
    bal = Math.max(0, bal - principal)
  }
  return bal
}

// Pool summary: how much saved, target, and live shortfall/surplus for selected month
export function summarizePool(data) {
  const pool = data.triumphPool
  if (!pool) return null
  const loan = data.loans.find(l => l.id === pool.targetLoanId)
  if (!loan) return null

  // Total saved = sum of actual contributions (skipped = 0)
  const totalSaved = Object.values(pool.actuals || {}).reduce((s, a) => {
    return s + (a.skipped ? 0 : Number(a.amount || 0))
  }, 0)

  // Foreclosure month → number of EMIs that will have been paid by then
  // Today is May 4 2026. May EMI already debited (#11). After Jun EMI = 12, etc.
  // 'oct' means foreclose AFTER Oct EMI auto-debits = 16 EMIs paid total
  const monthMap = {
    'oct': { emisAhead: 5, label: 'Oct 2026', monthsToSaveTotal: 5 },  // May, Jun, Jul, Aug, Sep contributions
    'nov': { emisAhead: 6, label: 'Nov 2026', monthsToSaveTotal: 6 },
    'dec': { emisAhead: 7, label: 'Dec 2026', monthsToSaveTotal: 7 },
    'jan': { emisAhead: 8, label: 'Jan 2027', monthsToSaveTotal: 8 },
  }
  const selected = pool.foreclosureMonth ? monthMap[pool.foreclosureMonth] : monthMap['nov']

  const projectedOutstanding = projectLoanBalance(loan, selected.emisAhead)
  const charge = projectedOutstanding * (loan.foreclosureChargePct / 100)
  const target = projectedOutstanding + charge

  const diff = totalSaved - target
  return {
    totalSaved,
    target,
    projectedOutstanding,
    charge,
    foreclosureMonth: pool.foreclosureMonth || 'nov',
    foreclosureLabel: selected.label,
    diff,
    isCovered: diff >= 0,
    pctSaved: target > 0 ? Math.min(100, (totalSaved / target) * 100) : 0,
  }
}

// Helper: which contribution is "current" (the next one not yet logged)?
export function currentPoolContribution(data) {
  const pool = data.triumphPool
  if (!pool) return null
  for (const c of pool.plannedContributions) {
    if (!pool.actuals?.[c.id]) return c
  }
  return null
}

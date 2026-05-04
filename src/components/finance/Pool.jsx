import { useState } from 'react'
import { formatINR, summarizePool, currentPoolContribution } from '../../lib/finance-data'

const MONTH_OPTIONS = [
  { id: 'oct', label: 'Oct 2026' },
  { id: 'nov', label: 'Nov 2026' },
  { id: 'dec', label: 'Dec 2026' },
  { id: 'jan', label: 'Jan 2027' },
]

export default function Pool({ data, update }) {
  const summary = summarizePool(data)
  const current = currentPoolContribution(data)
  const pool = data.triumphPool

  const [actualInput, setActualInput] = useState('')

  if (!summary || !pool) return null

  const targetLoan = data.loans.find(l => l.id === pool.targetLoanId)

  function setForeclosureMonth(monthId) {
    update(d => ({
      ...d,
      triumphPool: { ...d.triumphPool, foreclosureMonth: monthId }
    }))
  }

  function confirmContribution() {
    if (!current) return
    const amount = actualInput.trim() === '' ? current.plan : Number(actualInput)
    if (isNaN(amount) || amount < 0) return
    update(d => ({
      ...d,
      triumphPool: {
        ...d.triumphPool,
        actuals: {
          ...d.triumphPool.actuals,
          [current.id]: {
            amount,
            transferDate: new Date().toISOString().slice(0, 10),
            skipped: false,
          }
        }
      }
    }))
    setActualInput('')
  }

  function skipContribution() {
    if (!current) return
    update(d => ({
      ...d,
      triumphPool: {
        ...d.triumphPool,
        actuals: {
          ...d.triumphPool.actuals,
          [current.id]: {
            amount: 0,
            transferDate: new Date().toISOString().slice(0, 10),
            skipped: true,
          }
        }
      }
    }))
    setActualInput('')
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="px-1">
        <h2 className="font-display text-2xl text-ink-900">{targetLoan.name} pool</h2>
        <p className="text-sm text-ink-500 mt-1">Move surplus here each month, then foreclose.</p>
      </div>

      {/* Hero */}
      <div className="card p-5 bg-accent-green/5 border-accent-green/20">
        <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent-green mb-1">Pool balance</div>
        <div className="font-display font-semibold text-3xl tabular text-ink-900">
          {formatINR(summary.totalSaved)}
        </div>
        <div className="text-xs text-accent-green tabular mt-1">
          target {formatINR(summary.target)} by {summary.foreclosureLabel}
        </div>
        <div className="h-2.5 bg-accent-green/15 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-accent-green transition-all duration-500" style={{ width: `${summary.pctSaved}%` }} />
        </div>
        <div className="flex justify-between text-xs text-accent-green mt-2 tabular">
          <span>{summary.pctSaved.toFixed(0)}% saved</span>
          <span>
            {summary.isCovered
              ? `surplus ${formatINR(summary.diff)}`
              : `${formatINR(Math.max(0, summary.target - summary.totalSaved))} to go`}
          </span>
        </div>
      </div>

      {/* Foreclosure month picker */}
      <div className="card p-4 bg-ink-900 text-paper-50">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-paper-200/60 mb-3">
          Foreclosure target
        </div>
        <div className="flex gap-2 flex-wrap">
          {MONTH_OPTIONS.map(opt => {
            const selected = (pool.foreclosureMonth || 'nov') === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setForeclosureMonth(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-paper-50 text-ink-900'
                    : 'bg-paper-50/10 text-paper-50/80 border border-paper-50/15'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-paper-50/15 space-y-1">
          <Row label="Outstanding then" value={formatINR(summary.projectedOutstanding)} />
          <Row label={`Charge (${targetLoan.foreclosureChargePct}%)`} value={formatINR(summary.charge)} />
          <Row label="Total to pay" value={formatINR(summary.target)} bold />
        </div>
        <div className={`mt-3 pt-3 border-t border-paper-50/15`}>
          <div className="text-[10px] uppercase tracking-wider text-paper-200/60 mb-1">
            {summary.isCovered ? 'Surplus after foreclosure' : 'Shortfall — find from elsewhere'}
          </div>
          <div className={`font-mono tabular text-2xl font-medium ${summary.isCovered ? 'text-accent-green' : 'text-accent-red'}`}>
            {summary.isCovered ? formatINR(summary.diff) : formatINR(-summary.diff)}
          </div>
        </div>
      </div>

      {/* Contributions list */}
      <div className="card p-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500 mb-3">
          Monthly contributions
        </div>

        {/* Current month action card */}
        {current && (
          <div className="mb-3 p-4 rounded-2xl bg-accent-amber/10 border border-accent-amber/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-amber text-white flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink-900">{current.label}</div>
                <div className="text-xs text-accent-amber">Pending — log this month's transfer</div>
              </div>
              <div className="font-mono text-xs tabular text-accent-amber">{formatINR(current.plan)} plan</div>
            </div>

            <input
              type="number"
              inputMode="numeric"
              placeholder={String(current.plan)}
              value={actualInput}
              onChange={e => setActualInput(e.target.value)}
              className="w-full bg-white border border-accent-amber/40 rounded-xl px-3 py-2 font-mono tabular text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-amber/30"
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={skipContribution}
                className="flex-1 py-2 rounded-xl text-xs font-medium border border-accent-amber/40 text-accent-amber active:scale-[0.98] transition-transform"
              >
                Skip month
              </button>
              <button
                onClick={confirmContribution}
                className="flex-1 py-2 rounded-xl text-xs font-medium bg-ink-900 text-paper-50 active:scale-[0.98] transition-transform"
              >
                Confirm transfer
              </button>
            </div>
            <div className="text-[10px] text-accent-amber/80 mt-2">
              Leave blank to use the planned amount
            </div>
          </div>
        )}

        {/* All contributions history */}
        <div className="space-y-0">
          {pool.plannedContributions.map(c => {
            const actual = pool.actuals?.[c.id]
            const isCurrent = current?.id === c.id
            if (isCurrent) return null  // already shown above

            if (actual) {
              const diff = actual.amount - c.plan
              return (
                <div key={c.id} className="flex items-center gap-3 py-3 border-b border-paper-200 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    actual.skipped ? 'bg-paper-200 text-ink-500' : 'bg-accent-green text-white'
                  }`}>
                    {actual.skipped
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 9l6 6M15 9l-6 6"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900">{c.label}</div>
                    <div className={`text-xs ${
                      actual.skipped ? 'text-ink-500' :
                      diff >= 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}>
                      {actual.skipped ? 'Skipped' :
                       diff === 0 ? 'On plan' :
                       diff > 0 ? `+${formatINR(diff)} ahead of plan` :
                       `${formatINR(-diff)} short of plan`}
                    </div>
                  </div>
                  <div className={`font-mono tabular text-sm ${actual.skipped ? 'text-ink-300' : 'text-ink-900 font-medium'}`}>
                    {formatINR(actual.amount)}
                  </div>
                </div>
              )
            }

            // Future
            return (
              <div key={c.id} className="flex items-center gap-3 py-3 border-b border-paper-200 last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-paper-100 text-ink-500 border border-dashed border-paper-200">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-500">{c.label}</div>
                  <div className="text-xs text-ink-500">{c.note || 'Future contribution'}</div>
                </div>
                <div className="font-mono tabular text-sm text-ink-500">{formatINR(c.plan)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between items-baseline py-0.5 text-xs">
      <span className="text-paper-200/70">{label}</span>
      <span className={`font-mono tabular ${bold ? 'font-medium' : ''}`}>{value}</span>
    </div>
  )
}

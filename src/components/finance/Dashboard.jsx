import { formatINR, formatMonthYear } from '../../lib/finance-data'

function KpiTile({ label, value, accent, sublabel }) {
  const accentClasses = {
    red: 'text-accent-red',
    green: 'text-accent-green',
    amber: 'text-accent-amber',
    blue: 'text-accent-blue',
    ink: 'text-ink-900',
  }
  return (
    <div className="card p-4">
      <div className="label-tiny mb-2">{label}</div>
      <div className={`font-display font-semibold text-2xl tabular ${accentClasses[accent] || 'text-ink-900'}`}>
        {value}
      </div>
      {sublabel && <div className="text-xs text-ink-500 mt-1">{sublabel}</div>}
    </div>
  )
}

export default function Dashboard({ data, derived }) {
  const { budget, schedule, summary, gear } = derived

  const monthsToDebtFree = summary.debtFreeMonth >= 0 ? summary.debtFreeMonth + 1 : null
  const debtFreeDate = summary.debtFreeDate ? formatMonthYear(summary.debtFreeDate) : '—'
  const totalDebt = data.loans.reduce((s, l) => {
    const m = schedule[0]?.loans.find(rl => rl.id === l.id)
    return s + (m?.openBalance || 0)
  }, 0)

  return (
    <div className="space-y-5 pb-8">
      {/* Hero countdown */}
      <div className="bg-ink-900 text-paper-50 rounded-3xl p-6 -mx-1">
        <div className="label-tiny text-paper-200/70 mb-2">Debt-free in</div>
        <div className="flex items-baseline gap-2">
          <div className="font-display font-light text-7xl tabular leading-none">
            {monthsToDebtFree ?? '—'}
          </div>
          <div className="font-display text-2xl text-paper-200/80">months</div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-paper-200/60">By</span>
          <span className="font-medium tabular">{debtFreeDate}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-paper-200/60">Total debt remaining</span>
          <span className="font-mono tabular text-accent-red font-medium">{formatINR(totalDebt)}</span>
        </div>
      </div>

      {/* Section: This month */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display text-xl text-ink-900">This Month</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KpiTile label="Income"   value={formatINR(data.salary)} accent="blue" />
          <KpiTile label="Expenses" value={formatINR(budget.totalExpenses)} accent="amber" />
          <KpiTile
            label="Surplus"
            value={formatINR(budget.surplus)}
            accent={budget.surplus > 0 ? 'green' : 'red'}
            sublabel="goes to loan foreclosure"
          />
          <KpiTile label="Emergency Fund" value={formatINR(data.emergencyFund)} accent="ink" />
        </div>
      </div>

      {/* Section: Loans */}
      <div>
        <h2 className="font-display text-xl text-ink-900 mb-3 px-1">Loans</h2>
        <div className="space-y-3">
          {data.loans.map((loan, idx) => {
            const open = schedule[0]?.loans[idx]?.openBalance || 0
            const original = loan.principal
            const cleared = Math.max(0, original - open)
            const pct = original > 0 ? (cleared / original) * 100 : 0
            return (
              <div key={loan.id} className="card p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-medium text-ink-900">{loan.name}</div>
                  <div className="font-mono tabular text-sm text-ink-700">{formatINR(open)}</div>
                </div>
                <div className="h-2 bg-paper-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-green transition-all duration-500"
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
                  <span>{pct.toFixed(0)}% paid off</span>
                  <span>{loan.ratePct}% interest</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section: Goals */}
      <div>
        <h2 className="font-display text-xl text-ink-900 mb-3 px-1">Goals</h2>
        <div className="card divide-y divide-paper-200">
          <GoalRow
            icon="🎯"
            title={`Foreclose ${data.loans[0]?.name || 'Loan 1'}`}
            target={summary.loan1ClearedDate ? formatMonthYear(summary.loan1ClearedDate) : '—'}
            status={summary.loan1ClearedMonth >= 0 ? 'on-track' : 'pending'}
          />
          <GoalRow
            icon="🎯"
            title={`Foreclose ${data.loans[1]?.name || 'Loan 2'}`}
            target={summary.loan2ClearedDate ? formatMonthYear(summary.loan2ClearedDate) : '—'}
            status={summary.loan2ClearedMonth >= 0 ? 'on-track' : 'pending'}
          />
          <GoalRow
            icon="🏍️"
            title="Touring Gear"
            target={gear.readyDate ? formatMonthYear(gear.readyDate) : '—'}
            status={gear.readyDate ? 'waiting' : 'pending'}
          />
        </div>
      </div>

      {/* Interest saved badge */}
      {summary.totalInterestSaved > 0 && (
        <div className="card p-4 bg-paper-100 border-paper-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="label-tiny text-accent-green mb-1">By foreclosing</div>
              <div className="font-display text-lg text-ink-900">You'll save approximately</div>
            </div>
            <div className="font-display font-semibold text-2xl tabular text-accent-green">
              {formatINR(summary.totalInterestSaved)}
            </div>
          </div>
          <div className="text-xs text-ink-500 mt-2">in interest payments, after foreclosure charges</div>
        </div>
      )}
    </div>
  )
}

function GoalRow({ icon, title, target, status }) {
  const statusBadge = {
    'on-track': <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green uppercase tracking-wider">Active</span>,
    'waiting': <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-paper-200 text-ink-500 uppercase tracking-wider">Waiting</span>,
    'pending': <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-paper-200 text-ink-500 uppercase tracking-wider">—</span>,
  }
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-ink-900">{title}</div>
        <div className="text-xs text-ink-500 tabular">Target: {target}</div>
      </div>
      {statusBadge[status]}
    </div>
  )
}

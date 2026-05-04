import { formatINR, formatMonthYear } from '../../lib/finance-data'

export default function Gear({ data, derived, update }) {
  const { gear } = derived
  const g = data.gear

  function updateGear(patch) {
    update(d => ({ ...d, gear: { ...d.gear, ...patch } }))
  }

  const pct = g.totalCost > 0 ? Math.min(100, (g.alreadySaved / g.totalCost) * 100) : 0

  return (
    <div className="space-y-5 pb-8">
      <div className="px-1">
        <h2 className="font-display text-2xl text-ink-900">Touring Gear</h2>
        <p className="text-sm text-ink-500 mt-1">Activates after both loans are foreclosed.</p>
      </div>

      {/* Hero progress */}
      <div className="card p-6">
        <div className="label-tiny mb-2">Progress</div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-display font-semibold text-3xl tabular text-ink-900">
            {formatINR(g.alreadySaved)}
          </div>
          <div className="text-sm text-ink-500 tabular">
            of {formatINR(g.totalCost)}
          </div>
        </div>
        <div className="h-3 bg-paper-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-green transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
          <span>{pct.toFixed(0)}% saved</span>
          <span>{formatINR(gear.remaining)} to go</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="card divide-y divide-paper-200">
        <Field
          label="Total gear cost"
          value={g.totalCost}
          onChange={v => updateGear({ totalCost: Number(v) })}
        />
        <Field
          label="Already saved"
          value={g.alreadySaved}
          onChange={v => updateGear({ alreadySaved: Number(v) })}
        />
        <Field
          label="Monthly contribution (after loans cleared)"
          value={g.monthlyContribution}
          onChange={v => updateGear({ monthlyContribution: Number(v) })}
        />
      </div>

      {/* Forecast */}
      <div className="card p-4 bg-paper-100/50">
        <div className="label-tiny mb-3">Forecast</div>
        <div className="space-y-2 text-sm">
          <Row label="Months needed to fund" value={gear.monthsToFund != null ? `${gear.monthsToFund}` : '—'} />
          <Row label="Gear ready by" value={gear.readyDate ? formatMonthYear(gear.readyDate) : '—'} highlight />
        </div>
      </div>

      {/* Phased buying schedule */}
      <div>
        <h3 className="label-tiny mb-3 px-1">Phased buying schedule</h3>
        <div className="space-y-2">
          <PhaseCard
            phase="Phase 1"
            title="Safety must-haves"
            cost={17000}
            items="Boots · Bike service · Tool kit"
            tone="red"
          />
          <PhaseCard
            phase="Phase 2"
            title="Touring essentials"
            cost={14499}
            items="Tail bag · Tank bag · Navigation · Hydration"
            tone="amber"
          />
          <PhaseCard
            phase="Phase 3"
            title="Comfort upgrades"
            cost={21899}
            items="Aux lights · Risers · Intercom · Thigh bag"
            tone="green"
          />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div className="p-4">
      <div className="label-tiny mb-1.5">{label}</div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-mono">₹</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-field pl-8"
        />
      </div>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={`font-mono tabular ${highlight ? 'font-medium text-accent-green' : 'text-ink-900'}`}>{value}</span>
    </div>
  )
}

function PhaseCard({ phase, title, cost, items, tone }) {
  const tones = {
    red: 'bg-accent-red/5 border-accent-red/20',
    amber: 'bg-accent-amber/5 border-accent-amber/20',
    green: 'bg-accent-green/5 border-accent-green/20',
  }
  return (
    <div className={`card p-4 border ${tones[tone]}`}>
      <div className="flex items-baseline justify-between mb-1">
        <span className="label-tiny">{phase}</span>
        <span className="font-mono tabular text-sm text-ink-900">{formatINR(cost)}</span>
      </div>
      <div className="font-medium text-ink-900 text-sm">{title}</div>
      <div className="text-xs text-ink-500 mt-1">{items}</div>
    </div>
  )
}

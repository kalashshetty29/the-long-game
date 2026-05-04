import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatINR, formatMonthYear, computeLoanOutstanding } from '../../lib/finance-data'

export default function Loans({ data, derived, update }) {
  const { schedule, summary } = derived
  const [expandedLoan, setExpandedLoan] = useState(null)

  function updateLoan(loanId, patch) {
    update(d => ({
      ...d,
      loans: d.loans.map(l => l.id === loanId ? { ...l, ...patch } : l)
    }))
  }

  // Chart data — total debt over time
  const chartData = schedule.map(row => ({
    month: formatMonthYear(row.date).replace(' ', "'"),
    total: Math.round(row.totalDebt),
    loan1: Math.round(row.loans[0]?.closeBalance || 0),
    loan2: Math.round(row.loans[1]?.closeBalance || 0),
  }))

  return (
    <div className="space-y-5 pb-8">
      <div className="px-1">
        <h2 className="font-display text-2xl text-ink-900">Loans</h2>
        <p className="text-sm text-ink-500 mt-1">Tap a loan to edit details. Changes update the schedule live.</p>
      </div>

      {/* Foreclosure schedule chart */}
      <div className="card p-4">
        <div className="label-tiny mb-3">Total debt over time</div>
        <div className="h-48 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: '#737373' }}
                axisLine={{ stroke: '#e8e6df' }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#737373' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                width={40}
              />
              <Tooltip
                formatter={(v) => formatINR(v)}
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fafaf7',
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono'
                }}
                labelStyle={{ color: '#bcbcbc' }}
              />
              <Line type="monotone" dataKey="total" stroke="#1a1a1a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="loan1" stroke="#c2410c" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="loan2" stroke="#b45309" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-ink-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-ink-900"/> Total</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent-red"/> Loan 1</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent-amber"/> Loan 2</span>
        </div>
      </div>

      {/* Loan list */}
      {data.loans.map((loan, idx) => {
        const open = computeLoanOutstanding(loan)
        const isExpanded = expandedLoan === loan.id
        return (
          <div key={loan.id} className="card overflow-hidden">
            <button
              className="w-full p-4 flex items-baseline justify-between active:bg-paper-100 transition-colors"
              onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
            >
              <div className="text-left">
                <div className="font-medium text-ink-900">{loan.name}</div>
                <div className="text-xs text-ink-500 mt-0.5">EMI {formatINR(loan.emi)} · {loan.ratePct}%</div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular text-ink-900 font-medium">{formatINR(open)}</div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider">outstanding</div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-paper-200 p-4 space-y-3 bg-paper-50/50">
                <Field
                  label="Loan name"
                  value={loan.name}
                  type="text"
                  onChange={v => updateLoan(loan.id, { name: v })}
                />
                <Field
                  label="EMI per month"
                  value={loan.emi}
                  type="number"
                  prefix="₹"
                  onChange={v => updateLoan(loan.id, { emi: Number(v) })}
                />
                <Field
                  label="Original principal"
                  value={loan.principal}
                  type="number"
                  prefix="₹"
                  onChange={v => updateLoan(loan.id, { principal: Number(v) })}
                />
                <Field
                  label="Interest rate"
                  value={loan.ratePct}
                  type="number"
                  step="0.01"
                  suffix="%"
                  onChange={v => updateLoan(loan.id, { ratePct: Number(v) })}
                />
                <Field
                  label="Tenure"
                  value={loan.tenureMonths}
                  type="number"
                  suffix="months"
                  onChange={v => updateLoan(loan.id, { tenureMonths: Number(v) })}
                />
                <Field
                  label="Start date"
                  value={loan.startDate}
                  type="date"
                  onChange={v => updateLoan(loan.id, { startDate: v })}
                />
                <Field
                  label="Foreclosure charge"
                  value={loan.foreclosureChargePct}
                  type="number"
                  step="0.1"
                  suffix="%"
                  onChange={v => updateLoan(loan.id, { foreclosureChargePct: Number(v) })}
                />
                <Field
                  label="Outstanding (override)"
                  value={loan.outstandingOverride ?? ''}
                  type="number"
                  prefix="₹"
                  placeholder="Leave blank to auto-calculate"
                  onChange={v => updateLoan(loan.id, { outstandingOverride: v === '' ? null : Number(v) })}
                />
                <label className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    checked={loan.forecloseFirst}
                    onChange={e => {
                      // Make this the only "foreclose first" loan
                      update(d => ({
                        ...d,
                        loans: d.loans.map(l => ({
                          ...l,
                          forecloseFirst: l.id === loan.id ? e.target.checked : false
                        }))
                      }))
                    }}
                    className="w-5 h-5 accent-ink-900"
                  />
                  <span className="text-sm text-ink-700">Foreclose this loan first (priority)</span>
                </label>
              </div>
            )}
          </div>
        )
      })}

      {/* Schedule preview */}
      <div className="card p-4">
        <div className="label-tiny mb-3">Foreclosure schedule</div>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {schedule.slice(0, 12).map((row, i) => (
            <div key={i} className="flex items-baseline gap-3 py-1.5 px-2 rounded-lg odd:bg-paper-100/50">
              <div className="font-mono tabular text-xs text-ink-500 w-16 shrink-0">
                {formatMonthYear(row.date)}
              </div>
              <div className="flex-1 min-w-0">
                {row.milestone ? (
                  <div className="text-sm font-medium text-accent-green truncate">{row.milestone}</div>
                ) : (
                  <div className="text-xs text-ink-700 truncate">
                    {row.loans.map(l => l.action).filter(a => a && a !== '✓ Done').join(' · ') || 'All clear'}
                  </div>
                )}
              </div>
              <div className="font-mono tabular text-xs text-ink-700 shrink-0">
                {formatINR(row.totalDebt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, type, onChange, step, prefix, suffix, placeholder }) {
  return (
    <div>
      <div className="label-tiny mb-1.5">{label}</div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-mono pointer-events-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          step={step}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-16' : ''}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

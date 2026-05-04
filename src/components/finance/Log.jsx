import { useState, useMemo } from 'react'
import { formatINR } from '../../lib/finance-data'

const CATEGORIES = [
  { id: 'groceries',  label: 'Groceries',  emoji: '🛒' },
  { id: 'fuel',       label: 'Fuel',       emoji: '⛽' },
  { id: 'eatingout',  label: 'Eating out', emoji: '🍽️' },
  { id: 'mobile',     label: 'Mobile',     emoji: '📱' },
  { id: 'misc',       label: 'Misc',       emoji: '📦' },
  { id: 'gear',       label: 'Gear',       emoji: '🏍️' },
  { id: 'other',      label: 'Other',      emoji: '✏️' },
]

export default function Log({ data, update }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('groceries')
  const [note, setNote] = useState('')

  function addTransaction(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    const tx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      category,
      amount: Number(amount),
      note: note.trim(),
    }
    update(d => ({
      ...d,
      transactions: [tx, ...(d.transactions || [])],
    }))
    setAmount('')
    setNote('')
  }

  function deleteTransaction(id) {
    update(d => ({
      ...d,
      transactions: (d.transactions || []).filter(t => t.id !== id),
    }))
  }

  const transactions = data.transactions || []

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups = {}
    transactions.forEach(t => {
      const key = new Date(t.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return groups
  }, [transactions])

  // This month total
  const now = new Date()
  const thisMonthKey = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const thisMonthTotal = (groupedByMonth[thisMonthKey] || []).reduce((s, t) => s + t.amount, 0)

  // Per-category totals this month
  const categoryTotals = useMemo(() => {
    const totals = {}
    ;(groupedByMonth[thisMonthKey] || []).forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount
    })
    return totals
  }, [groupedByMonth, thisMonthKey])

  return (
    <div className="space-y-5 pb-8">
      <div className="px-1">
        <h2 className="font-display text-2xl text-ink-900">Log</h2>
        <p className="text-sm text-ink-500 mt-1">Track every rupee. Two taps and done.</p>
      </div>

      {/* Quick add form */}
      <form onSubmit={addTransaction} className="card p-4 space-y-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-mono text-2xl">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="input-field pl-10 text-3xl font-display tabular"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`p-2.5 rounded-xl border transition-all text-center ${
                category === cat.id
                  ? 'bg-ink-900 text-paper-50 border-ink-900'
                  : 'bg-paper-50 border-paper-200 text-ink-700 active:bg-paper-100'
              }`}
            >
              <div className="text-lg">{cat.emoji}</div>
              <div className="text-[10px] mt-0.5 font-medium tracking-wide">{cat.label}</div>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="input-field text-sm"
        />

        <button type="submit" className="btn-primary w-full py-3 text-base">
          Log expense
        </button>
      </form>

      {/* This month summary */}
      <div className="card p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="label-tiny">{thisMonthKey} so far</div>
          <div className="font-display font-semibold text-xl tabular text-ink-900">
            {formatINR(thisMonthTotal)}
          </div>
        </div>
        {Object.keys(categoryTotals).length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-paper-200">
            {Object.entries(categoryTotals)
              .sort(([,a],[,b]) => b - a)
              .map(([cat, total]) => {
                const meta = CATEGORIES.find(c => c.id === cat) || { emoji: '·', label: cat }
                const budgetLine = data.variableBudget.find(v => v.id === cat)
                const budgetAmt = budgetLine?.amount
                const overBudget = budgetAmt && total > budgetAmt
                return (
                  <div key={cat} className="flex items-center justify-between text-sm py-1">
                    <span className="flex items-center gap-2">
                      <span>{meta.emoji}</span>
                      <span className="text-ink-700">{meta.label}</span>
                    </span>
                    <span className={`font-mono tabular ${overBudget ? 'text-accent-red' : 'text-ink-700'}`}>
                      {formatINR(total)}{budgetAmt && <span className="text-ink-500"> / {formatINR(budgetAmt)}</span>}
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div>
        <h3 className="label-tiny mb-3 px-1">History</h3>
        {transactions.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-sm text-ink-500">No transactions yet. Log your first expense above.</p>
          </div>
        ) : (
          Object.entries(groupedByMonth).map(([month, txns]) => (
            <div key={month} className="card mb-3 overflow-hidden">
              <div className="px-4 py-2.5 bg-paper-100 flex items-baseline justify-between">
                <span className="label-tiny">{month}</span>
                <span className="font-mono tabular text-xs text-ink-700">
                  {formatINR(txns.reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
              {txns.map((t, i) => {
                const meta = CATEGORIES.find(c => c.id === t.category) || { emoji: '·', label: t.category }
                return (
                  <div
                    key={t.id}
                    className={`px-4 py-3 flex items-center gap-3 ${i < txns.length - 1 ? 'border-b border-paper-200' : ''}`}
                  >
                    <div className="text-xl">{meta.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink-900 truncate">{t.note || meta.label}</div>
                      <div className="text-[10px] text-ink-500 tabular">
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span className="font-mono tabular text-sm text-ink-900">{formatINR(t.amount)}</span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-ink-300 active:text-accent-red px-1"
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

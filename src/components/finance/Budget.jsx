import { useState } from 'react'
import { formatINR } from '../../lib/finance-data'

export default function Budget({ data, derived, update }) {
  const { budget } = derived

  function updateExpense(category, id, patch) {
    update(d => ({
      ...d,
      [category]: d[category].map(e => e.id === id ? { ...e, ...patch } : e)
    }))
  }

  function deleteExpense(category, id) {
    if (!confirm('Delete this expense line?')) return
    update(d => ({
      ...d,
      [category]: d[category].filter(e => e.id !== id)
    }))
  }

  function addExpense(category) {
    const newId = `custom-${Date.now()}`
    update(d => ({
      ...d,
      [category]: [...d[category], {
        id: newId,
        label: 'New expense',
        amount: 0,
        ...(category === 'fixedExpenses' ? { isLoanEmi: false, endsOn: null } : {})
      }]
    }))
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="px-1">
        <h2 className="font-display text-2xl text-ink-900">Budget</h2>
        <p className="text-sm text-ink-500 mt-1">Edit your income and recurring expenses.</p>
      </div>

      {/* Income */}
      <div className="card p-4">
        <div className="label-tiny mb-2">Monthly income (in-hand)</div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-mono">₹</span>
          <input
            type="number"
            value={data.salary}
            onChange={e => update(d => ({ ...d, salary: Number(e.target.value) }))}
            className="input-field pl-8 text-xl font-medium"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="Fixed" value={budget.fixedTotal + budget.loanEmiTotal} />
        <SummaryTile label="Variable" value={budget.variableTotal} />
        <SummaryTile
          label="Surplus"
          value={budget.surplus}
          accent={budget.surplus > 0 ? 'green' : 'red'}
        />
      </div>

      {/* Fixed expenses */}
      <ExpenseList
        title="Fixed expenses"
        subtitle="Bills, subscriptions, loan EMIs"
        category="fixedExpenses"
        expenses={data.fixedExpenses}
        onUpdate={updateExpense}
        onDelete={deleteExpense}
        onAdd={() => addExpense('fixedExpenses')}
        showEndDate
      />

      {/* Loan EMIs (read-only display, editable in Loans tab) */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="label-tiny">Loan EMIs</div>
            <div className="text-xs text-ink-500 mt-0.5">Edit in the Loans tab</div>
          </div>
        </div>
        {data.loans.map(l => (
          <div key={l.id} className="flex items-baseline justify-between py-2 border-t border-paper-200 first:border-t-0">
            <span className="text-sm text-ink-700">{l.name}</span>
            <span className="font-mono tabular text-sm text-ink-900">{formatINR(l.emi)}</span>
          </div>
        ))}
      </div>

      {/* Variable expenses */}
      <ExpenseList
        title="Variable budget"
        subtitle="Discretionary monthly limits"
        category="variableBudget"
        expenses={data.variableBudget}
        onUpdate={updateExpense}
        onDelete={deleteExpense}
        onAdd={() => addExpense('variableBudget')}
      />

      {/* Emergency fund */}
      <div className="card p-4">
        <div className="label-tiny mb-2">Emergency fund (current balance)</div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-mono">₹</span>
          <input
            type="number"
            value={data.emergencyFund}
            onChange={e => update(d => ({ ...d, emergencyFund: Number(e.target.value) }))}
            className="input-field pl-8"
          />
        </div>
        <p className="text-xs text-ink-500 mt-2">Target: 3 months of expenses (~₹{Math.round(budget.totalExpenses * 3 / 1000)}k)</p>
      </div>
    </div>
  )
}

function SummaryTile({ label, value, accent = 'ink' }) {
  const colors = {
    green: 'text-accent-green',
    red: 'text-accent-red',
    ink: 'text-ink-900',
  }
  return (
    <div className="card p-3">
      <div className="label-tiny">{label}</div>
      <div className={`font-display font-semibold text-base tabular mt-1 ${colors[accent]}`}>
        {formatINR(value)}
      </div>
    </div>
  )
}

function ExpenseList({ title, subtitle, category, expenses, onUpdate, onDelete, onAdd, showEndDate }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex items-baseline justify-between">
        <div>
          <div className="label-tiny">{title}</div>
          <div className="text-xs text-ink-500 mt-0.5">{subtitle}</div>
        </div>
        <button
          onClick={onAdd}
          className="text-xs font-medium text-ink-700 px-3 py-1.5 rounded-full bg-paper-100 active:scale-95 transition-transform"
        >
          + Add
        </button>
      </div>
      <div className="border-t border-paper-200">
        {expenses.length === 0 && (
          <div className="p-4 text-center text-sm text-ink-500">No expenses yet</div>
        )}
        {expenses.map((expense, i) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            category={category}
            onUpdate={onUpdate}
            onDelete={onDelete}
            showEndDate={showEndDate}
            isLast={i === expenses.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function ExpenseRow({ expense, category, onUpdate, onDelete, showEndDate, isLast }) {
  const [editing, setEditing] = useState(false)
  const isPhoneEmi = expense.id === 'phone'

  return (
    <div className={`p-4 ${!isLast ? 'border-b border-paper-200' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEditing(!editing)}
          className="flex-1 text-left active:opacity-60 transition-opacity"
        >
          <div className="text-sm text-ink-900 truncate">
            {expense.label}
            {isPhoneEmi && <span className="ml-2 text-[10px] text-accent-amber">⚠ ends Jun '26</span>}
          </div>
        </button>
        <span className="font-mono tabular text-sm text-ink-900">{formatINR(expense.amount)}</span>
      </div>

      {editing && (
        <div className="mt-3 space-y-2 pt-3 border-t border-paper-200">
          <input
            type="text"
            value={expense.label}
            onChange={e => onUpdate(category, expense.id, { label: e.target.value })}
            className="input-field text-sm"
            placeholder="Label"
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 font-mono">₹</span>
            <input
              type="number"
              value={expense.amount}
              onChange={e => onUpdate(category, expense.id, { amount: Number(e.target.value) })}
              className="input-field pl-8 text-sm"
            />
          </div>
          {showEndDate && (
            <div>
              <div className="text-xs text-ink-500 mb-1">Ends on (optional)</div>
              <input
                type="date"
                value={expense.endsOn || ''}
                onChange={e => onUpdate(category, expense.id, { endsOn: e.target.value || null })}
                className="input-field text-sm"
              />
            </div>
          )}
          <button
            onClick={() => onDelete(category, expense.id)}
            className="text-xs text-accent-red font-medium px-3 py-1.5 active:scale-95 transition-transform"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

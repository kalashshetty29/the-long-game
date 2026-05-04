import { useEffect, useState } from 'react'
import { formatINR } from '../../lib/finance-data'
import { onAuthChange, signOut } from '../../lib/storage'

export default function Settings({ data, cloud, reset, saving }) {
  const [authUser, setAuthUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthChange((user) => setAuthUser(user))
    return () => { if (unsub) unsub() }
  }, [])

  async function handleSignOut() {
    if (!confirm('Sign out? You can sign back in any time. Local data will remain on this device.')) return
    try {
      await signOut()
      // Clear the skip-signin flag so they get the sign-in screen next time
      localStorage.removeItem('long-game-skip-signin')
      window.location.reload()
    } catch (e) {
      alert('Sign out failed: ' + (e?.message || 'unknown error'))
    }
  }

  function exportData() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-tracker-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="px-1">
        <h2 className="font-display text-2xl text-ink-900">Settings</h2>
        <p className="text-sm text-ink-500 mt-1">Your data, your rules.</p>
      </div>

      {/* Cloud sync status */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${cloud ? 'bg-accent-green' : 'bg-ink-300'}`} />
          <div className="flex-1">
            <div className="text-sm font-medium text-ink-900">
              {cloud ? 'Cloud sync active' : 'Local storage only'}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              {cloud
                ? 'Data syncs to Firebase across all your devices'
                : 'Data stays on this device. Add Firebase config to enable sync.'}
            </div>
          </div>
        </div>
        {saving && (
          <div className="text-xs text-ink-500 mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            Saving…
          </div>
        )}
      </div>

      {/* Account section — visible when signed in */}
      {authUser && (
        <div className="card p-4">
          <div className="label-tiny mb-3">Account</div>
          <div className="flex items-center gap-3">
            {authUser.photoURL ? (
              <img src={authUser.photoURL} alt="" className="w-9 h-9 rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-paper-200 flex items-center justify-center flex-shrink-0 text-ink-700 font-medium text-sm">
                {(authUser.displayName || authUser.email || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-900 truncate">{authUser.displayName || 'Signed in'}</div>
              <div className="text-xs text-ink-500 truncate">{authUser.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full py-2 rounded-full border border-paper-200 text-sm text-ink-700 hover:bg-paper-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="card p-4">
        <div className="label-tiny mb-3">Your data</div>
        <div className="space-y-2 text-sm">
          <Stat label="Fixed expenses" value={`${data.fixedExpenses.length} items`} />
          <Stat label="Variable budget lines" value={`${data.variableBudget.length} items`} />
          <Stat label="Loans tracked" value={`${data.loans.length}`} />
          <Stat label="Transactions logged" value={`${(data.transactions || []).length}`} />
        </div>
      </div>

      {/* Actions */}
      <div className="card divide-y divide-paper-200">
        <button
          onClick={exportData}
          className="w-full p-4 text-left active:bg-paper-100 transition-colors"
        >
          <div className="text-sm font-medium text-ink-900">Export backup</div>
          <div className="text-xs text-ink-500 mt-0.5">Download all your data as JSON</div>
        </button>
        <button
          onClick={reset}
          className="w-full p-4 text-left active:bg-paper-100 transition-colors"
        >
          <div className="text-sm font-medium text-accent-red">Reset to defaults</div>
          <div className="text-xs text-ink-500 mt-0.5">Erase all data and start over</div>
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-ink-500 text-center px-4 leading-relaxed">
        <p>Built for personal finance. No tracking, no ads, no telemetry.</p>
        <p className="mt-2 font-mono">v1.0</p>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-mono tabular text-ink-900">{value}</span>
    </div>
  )
}

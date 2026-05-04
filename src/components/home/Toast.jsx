import React, { useEffect } from 'react'
import { Check } from 'lucide-react'

// Goal-completion toast. Auto-dismisses after duration ms.
// Render at top of app; controlled via parent's toast state.

export default function Toast({ toast, onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [toast, onDismiss, duration])

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-3 right-3 max-w-md mx-auto z-50 bg-ink-900 text-paper-50 rounded-xl px-3.5 py-3 flex items-center gap-2.5 shadow-lg"
      style={{ animation: 'slideDown 0.25s ease-out' }}
    >
      <div className="w-7 h-7 rounded-full bg-accent-green flex items-center justify-center flex-shrink-0">
        <Check size={14} strokeWidth={3} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">{toast.title}</div>
        {toast.detail && (
          <div className="text-[11px] opacity-70 mt-0.5 tabular">{toast.detail}</div>
        )}
      </div>
    </div>
  )
}

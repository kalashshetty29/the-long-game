import React, { useState } from 'react'
import { signInWithGoogle } from '../../lib/storage'

export default function SignIn({ onSignedIn, onContinueLocal }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setError(null)
    setLoading(true)
    try {
      const user = await signInWithGoogle()
      if (onSignedIn) onSignedIn(user)
    } catch (e) {
      console.error('Sign in failed:', e)
      // Common Firebase error codes - friendlier messages
      const code = e?.code || ''
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Try again.')
      } else if (code === 'auth/popup-blocked') {
        setError('Browser blocked the popup. Allow popups for this site and try again.')
      } else if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.')
      } else {
        setError(e?.message || 'Sign in failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-50 px-6 py-12">
      <div className="max-w-sm w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-500 font-medium mb-3">
          Welcome back
        </div>
        <h1 className="font-display text-[36px] font-semibold tracking-tight leading-[1.05] text-ink-900">
          The <span className="italic font-normal text-ink-500">Long</span> Game.
        </h1>
        <p className="text-ink-700 leading-relaxed mt-5 text-sm">
          Sign in to keep your data synced across devices. Your check-ins, plan progress, and finances stay tied to your Google account — only you can read them.
        </p>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="mt-7 w-full bg-ink-900 text-white py-3 rounded-full font-medium hover:bg-ink-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="text-sm">Opening Google sign-in…</span>
          ) : (
            <>
              <GoogleIcon />
              <span className="text-sm">Continue with Google</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-[12px] text-accent-red">
            {error}
          </div>
        )}

        {onContinueLocal && (
          <button
            onClick={onContinueLocal}
            className="mt-3 w-full text-ink-500 py-2 text-[12px] hover:text-ink-700 transition-colors"
          >
            Continue without sign-in (this device only)
          </button>
        )}

        <p className="mt-8 text-[11px] text-ink-500 leading-relaxed">
          Your data is stored in your private Firebase document. Anthropic and the app developer don't have access to it.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

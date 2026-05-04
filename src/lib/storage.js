// Unified storage + auth layer.
//
// Order of operations:
//   1. Try to init Firebase (using firebase-config.js).
//   2. If Firebase is configured, set up Auth and listen for sign-in state.
//   3. Once a user is signed in, route reads/writes through Firestore at
//      users/{uid}/spaces/{namespace}.
//   4. If Firebase isn't configured (firebase-config.js empty), fall back to
//      localStorage entirely — no auth required, single-device experience.
//
// localStorage is always written first (instant feedback) and used as a fallback
// during reads if Firestore is offline or fails.
//
// All app code uses the same async API — load(namespace) / save(data, namespace) —
// regardless of which backend is active.

import { firebaseConfig } from './firebase-config'

const LS_PREFIX = 'long-game-v1'

// Module state
let firebaseApp = null
let firestore = null
let auth = null
let currentUser = null
const authListeners = new Set()  // callbacks for auth state changes

// ---- Firebase initialization ----

async function initFirebase() {
  // If config is missing or empty, run in localStorage-only mode
  if (!firebaseConfig || !firebaseConfig.apiKey) return false
  try {
    const { initializeApp } = await import('firebase/app')
    const { getFirestore } = await import('firebase/firestore')
    const { getAuth, onAuthStateChanged } = await import('firebase/auth')

    firebaseApp = initializeApp(firebaseConfig)
    firestore = getFirestore(firebaseApp)
    auth = getAuth(firebaseApp)

    // Listen for sign-in/sign-out
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      authListeners.forEach(cb => cb(user))
    })

    return true
  } catch (e) {
    console.error('[storage] Firebase init failed, falling back to localStorage', e)
    return false
  }
}

const ready = initFirebase()

// ---- Auth API ----

export async function signInWithGoogle() {
  await ready
  if (!auth) throw new Error('Firebase not configured')
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const provider = new GoogleAuthProvider()
  // Force account picker every time (prevents accidentally using wrong Google account)
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOut() {
  await ready
  if (!auth) return
  const { signOut: fbSignOut } = await import('firebase/auth')
  await fbSignOut(auth)
}

export function onAuthChange(callback) {
  authListeners.add(callback)
  // Immediately fire with current state if already known
  if (currentUser !== null) callback(currentUser)
  return () => authListeners.delete(callback)
}

export async function getCurrentUser() {
  await ready
  return currentUser
}

// ---- Storage API ----

async function getDocRef(namespace) {
  if (!firestore || !currentUser) return null
  const { doc } = await import('firebase/firestore')
  return doc(firestore, 'users', currentUser.uid, 'spaces', namespace)
}

export async function loadData(namespace = 'finance') {
  const useFirebase = await ready

  // Try Firestore first if a user is signed in
  if (useFirebase && currentUser) {
    try {
      const { getDoc } = await import('firebase/firestore')
      const ref = await getDocRef(namespace)
      if (ref) {
        const snap = await getDoc(ref)
        if (snap.exists()) return snap.data()
      }
    } catch (e) {
      console.error(`[storage] Firestore load failed for ${namespace}, trying localStorage`, e)
    }
  }

  // localStorage fallback (also used if not signed in)
  const raw = localStorage.getItem(`${LS_PREFIX}-${namespace}`)
  if (raw) {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

export async function saveData(data, namespace = 'finance') {
  // Always save locally first (instant, works offline)
  try {
    localStorage.setItem(`${LS_PREFIX}-${namespace}`, JSON.stringify(data))
  } catch (e) {
    console.error('[storage] localStorage write failed', e)
  }

  // Then sync to Firestore if signed in
  const useFirebase = await ready
  if (useFirebase && currentUser) {
    try {
      const { setDoc } = await import('firebase/firestore')
      const ref = await getDocRef(namespace)
      if (ref) await setDoc(ref, data, { merge: true })
    } catch (e) {
      console.error(`[storage] Firestore save failed for ${namespace}`, e)
    }
  }
}

export async function isCloudActive() {
  const useFirebase = await ready
  return useFirebase && !!currentUser
}

export async function isFirebaseConfigured() {
  return await ready
}

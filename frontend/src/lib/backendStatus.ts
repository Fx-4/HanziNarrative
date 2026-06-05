/**
 * Centralized backend warm-up utility.
 *
 * Koyeb free tier goes to sleep after inactivity. When the app starts and the
 * backend is sleeping, all requests fail with a Network Error. Instead of each
 * request retrying independently, this module:
 *   1. Pings /health until the backend responds (shared singleton Promise).
 *   2. Exposes reactive status so the UI can show a "Server starting…" banner.
 *   3. All axios interceptor retries share the same poll loop — no duplicate pings.
 */

import { API_URL } from '@/lib/env'

export type BackendStatus = 'unknown' | 'warming' | 'ready' | 'failed'

let _promise: Promise<void> | null = null
let _status: BackendStatus = 'unknown'
const _listeners = new Set<(status: BackendStatus) => void>()

function _notify() {
  _listeners.forEach(l => l(_status))
}

async function _poll(): Promise<void> {
  // First attempt — if it succeeds immediately, no banner is shown.
  try {
    const r = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(6000) })
    if (r.ok) { _status = 'ready'; _notify(); return }
  } catch { /* first ping failed — backend sleeping */ }

  // Backend sleeping: show banner and keep retrying (up to ~60 s).
  _status = 'warming'
  _notify()

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 4000))
    try {
      const r = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(6000) })
      if (r.ok) { _status = 'ready'; _notify(); return }
    } catch { /* still waking */ }
  }

  _status = 'failed'
  _notify()
  throw new Error('Backend unreachable after 60 s')
}

/** Returns a shared Promise that resolves when /health responds 200. */
export function ensureBackendReady(): Promise<void> {
  if (!_promise) _promise = _poll()
  return _promise
}

/** Current status — read synchronously (e.g. for initial useState value). */
export function getBackendStatus(): BackendStatus {
  return _status
}

/**
 * Subscribe to status changes. Returns an unsubscribe function.
 * The listener is called immediately with the current status.
 */
export function subscribeBackendStatus(listener: (s: BackendStatus) => void): () => void {
  _listeners.add(listener)
  listener(_status)                     // emit current state immediately
  return () => _listeners.delete(listener)
}

/** Reset (mainly for testing / manual retry). */
export function resetBackendStatus(): void {
  _promise = null
  _status = 'unknown'
  _notify()
}

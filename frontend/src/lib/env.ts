/**
 * Centralized environment utilities.
 *
 * Auto-upgrades http → https when the page is served over HTTPS so that
 * API requests are never blocked as mixed content by the browser.
 */

const _raw = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_URL: string =
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? _raw.replace(/^http:\/\//, 'https://')
    : _raw

/**
 * Base URL for pre-generated static course TTS (Supabase Storage public bucket),
 * e.g. `https://<ref>.supabase.co/storage/v1/object/public/tts-audio`.
 *
 * Opt-in: when empty (default), the client never touches the CDN and behaves
 * exactly as before. Set it ONLY after the audio has been generated & uploaded,
 * otherwise every lookup would 404 before falling back to the backend.
 */
export const TTS_STATIC_URL: string = (import.meta.env.VITE_TTS_STATIC_URL || '').trim().replace(/\/+$/, '')

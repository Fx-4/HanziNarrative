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

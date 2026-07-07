/**
 * TTS Helper — Shared function for pages that call TTS API directly
 * (instead of going through the useTTS hook).
 *
 * Reads voice preference from localStorage so all pages respect
 * the user's male/female voice choice.
 */

import axios from 'axios'
import api from '@/services/api'
import { getVoiceName, getSpeakingRate } from '@/utils/voicePreference'
import { buildCacheKey, getAudio, saveAudio } from '@/utils/ttsCache'
import { createLogger } from '@/utils/debugLogger'

const ttsHelperLogger = createLogger('TTS')

// Browser-TTS fallback is expected behaviour (e.g. backend sleeping on free tier),
// not an error. Log it once per session at debug level so the console isn't spammed
// with one warning per word/sentence the user plays.
let _fallbackLogged = false
// Same idea for the no-fallback path: a cold Koyeb backend fails every prefetch
// request with a network error until it wakes. That's expected (callers prewarm
// via ensureBackendReady and/or retry), so log it once at debug — not once per word.
let _coldStartLogged = false

// Wraps browser SpeechSynthesis as a fake HTMLAudioElement so callers
// get a consistent interface even when the backend is unreachable.
// onended / onerror are properly fired so callers can track play state.
function createSpeechShim(text: string, lang: string): HTMLAudioElement {
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  const voices = speechSynthesis.getVoices()
  const match = voices.find(v => v.lang.startsWith('zh'))
  if (match) utter.voice = match

  // Use closure vars so property setters actually take effect
  let _onended: (() => void) | null = null
  let _onerror:  (() => void) | null = null

  const shim = {
    get onended() { return _onended },
    set onended(fn: (() => void) | null) { _onended = fn },
    get onerror()  { return _onerror },
    set onerror(fn:  (() => void) | null) { _onerror = fn },
    // Resolve at playback START (like a real HTMLAudioElement), not at the end —
    // callers assign onended AFTER play(), so resolving at the end would fire
    // the callbacks before they exist and leave "speaking" state stuck.
    play: () => {
      utter.onend   = () => { _onended?.() }
      utter.onerror = () => { _onerror?.() }
      speechSynthesis.cancel()
      speechSynthesis.speak(utter)
      return Promise.resolve()
    },
    pause: () => { speechSynthesis.cancel() },
    get currentTime() { return 0 },
    set currentTime(_: number) {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }
  return shim as unknown as HTMLAudioElement
}

interface TTSOptions {
  text: string
  speakingRate?: number
  language?: string
  /** Override voice (ignores preference). Omit to use user's stored preference. */
  voiceName?: string
  /**
   * When false, NEVER substitute the robotic browser speechSynthesis voice —
   * throw instead so the caller can retry/show state. Use for listening
   * exercises where a different voice defeats the purpose. Default true.
   */
  allowBrowserFallback?: boolean
  /** Extra retries against the backend on network error (cold start). Default 0. */
  retries?: number
}

const RETRY_DELAY_MS = 2500

/**
 * Fetch audio from backend and return a ready-to-play HTMLAudioElement.
 * Does NOT call play() — caller decides when to play.
 * Use this to pre-fetch audio before user interaction.
 */
export async function fetchTTSAudio(options: TTSOptions): Promise<HTMLAudioElement> {
  const {
    text,
    speakingRate,
    language = 'cmn-CN',
    voiceName,
    allowBrowserFallback = true,
    retries = 0,
  } = options

  const token = localStorage.getItem('access_token')
  if (!token) throw new Error('No auth token')

  const voice = voiceName || getVoiceName()
  const rate = speakingRate ?? getSpeakingRate()

  // Layer 1: IndexedDB — zero network if heard before
  const cacheKey = buildCacheKey(text, language, voice, rate)
  const cached = await getAudio(cacheKey)
  if (cached) {
    const url = URL.createObjectURL(cached)
    const audio = new Audio(url)
    audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
    audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true })
    return audio
  }

  // Layer 2: Backend (file cache → edge-tts on miss) via the shared api instance,
  // so TTS gets 401 auto-refresh + backend wake-up retry for free. Network errors
  // are additionally retried here — usually the Koyeb free tier cold start.
  let response
  const maxAttempts = 1 + Math.max(0, retries)
  let lastErr: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
    try {
      response = await api.post(
        '/tts/synthesize',
        { text, language, voice_name: voice, speaking_rate: rate },
        { responseType: 'blob' }
      )
      break
    } catch (err) {
      lastErr = err
      const isNetworkErr = axios.isAxiosError(err) && !err.response
      if (!isNetworkErr) break // real API error — retrying won't help
    }
  }

  if (!response) {
    const err = lastErr
    const isNetworkErr = axios.isAxiosError(err) && !err.response
    // Network error (backend unreachable) → silent fallback to browser TTS,
    // unless the caller demands the real (Edge) voice
    if (
      allowBrowserFallback &&
      isNetworkErr &&
      typeof speechSynthesis !== 'undefined'
    ) {
      if (!_fallbackLogged) {
        _fallbackLogged = true
        ttsHelperLogger.debug('Backend unreachable — falling back to browser TTS for this session')
      }
      return createSpeechShim(text, language)
    }
    // Cold-start network errors are expected, not bugs — log once at debug so the
    // console isn't flooded with one error per prefetched word. Only genuine
    // API/server errors (those that came back with a response) get ERROR level.
    if (isNetworkErr) {
      if (!_coldStartLogged) {
        _coldStartLogged = true
        ttsHelperLogger.debug('TTS backend unreachable (cold start) — prefetch will retry once it wakes')
      }
    } else {
      ttsHelperLogger.error('TTS synthesis failed', err)
    }
    throw err
  }

  const blob = response.data instanceof Blob
    ? response.data
    : new Blob([response.data], { type: 'audio/mpeg' })

  // Save to IndexedDB for future plays (fire-and-forget)
  saveAudio(cacheKey, blob)

  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
  audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true })

  return audio
}

/**
 * Synthesize and immediately play audio via the backend TTS API.
 * Returns the HTMLAudioElement for caller to manage (pause, cleanup).
 * Throws on failure — caller should catch and fall back to browser TTS.
 */
export async function playTTS(options: TTSOptions): Promise<HTMLAudioElement> {
  const audio = await fetchTTSAudio(options)

  try {
    await audio.play()
  } catch (playErr) {
    // NotAllowedError = browser autoplay policy blocked; mute-trick to unlock
    if ((playErr as DOMException)?.name === 'NotAllowedError') {
      audio.muted = true
      await audio.play()
      audio.muted = false
    } else {
      throw playErr
    }
  }

  return audio
}

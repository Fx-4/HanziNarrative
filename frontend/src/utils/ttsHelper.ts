/**
 * TTS Helper — Shared function for pages that call TTS API directly
 * (instead of going through the useTTS hook).
 *
 * Reads voice preference from localStorage so all pages respect
 * the user's male/female voice choice.
 */

import axios from 'axios'
import { getVoiceName, getSpeakingRate } from '@/utils/voicePreference'
import { API_URL } from '@/lib/env'

interface TTSOptions {
  text: string
  speakingRate?: number
  language?: string
  /** Override voice (ignores preference). Omit to use user's stored preference. */
  voiceName?: string
}

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
  } = options

  const token = localStorage.getItem('access_token')
  if (!token) throw new Error('No auth token')

  const voice = voiceName || getVoiceName()
  const rate = speakingRate ?? getSpeakingRate()

  const response = await axios.post(
    `${API_URL}/tts/synthesize`,
    { text, language, voice_name: voice, speaking_rate: rate },
    { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
  )

  const blob = response.data instanceof Blob
    ? response.data
    : new Blob([response.data], { type: 'audio/mpeg' })

  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  const cleanup = () => URL.revokeObjectURL(url)
  audio.addEventListener('ended', cleanup, { once: true })
  audio.addEventListener('error', cleanup, { once: true })

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

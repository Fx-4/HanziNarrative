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

interface TTSPlayOptions {
  text: string
  speakingRate?: number
  language?: string
  /** Override voice (ignores preference). Omit to use user's stored preference. */
  voiceName?: string
}

/**
 * Synthesize and play audio via the backend TTS API.
 * Returns the HTMLAudioElement for caller to manage (pause, cleanup).
 * Throws on failure — caller should catch and fall back to browser TTS.
 */
export async function playTTS(options: TTSPlayOptions): Promise<HTMLAudioElement> {
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

  const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }))
  const audio = new Audio(url)

  // Auto-revoke blob URL on finish
  const cleanup = () => URL.revokeObjectURL(url)
  audio.addEventListener('ended', cleanup, { once: true })
  audio.addEventListener('error', cleanup, { once: true })

  await audio.play()
  return audio
}

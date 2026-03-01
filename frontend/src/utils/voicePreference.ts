/**
 * Voice Preference — localStorage-persisted male/female voice selection.
 *
 * Maps gender → Google Cloud TTS voice + Edge TTS fallback voice.
 * The backend tts_provider.py handles Google→Edge mapping internally,
 * so we only need to send the Google voice name.
 */

export type VoiceGender = 'female' | 'male'

export interface VoicePreset {
  label: string
  labelCn: string
  googleVoice: string
  description: string
}

export const VOICE_PRESETS: Record<VoiceGender, VoicePreset> = {
  female: {
    label: 'Female',
    labelCn: '女声',
    googleVoice: 'cmn-CN-Chirp3-HD-Aoede',
    description: 'Natural female voice (Aoede)',
  },
  male: {
    label: 'Male',
    labelCn: '男声',
    googleVoice: 'cmn-CN-Standard-B',
    description: 'Natural male voice (narrator)',
  },
}

const STORAGE_KEY = 'tts_voice_gender'
const SPEED_KEY = 'tts_speaking_rate'

// ── Voice gender ──────────────────────────────────────────────────

export function getVoiceGender(): VoiceGender {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'male' || stored === 'female') return stored
  return 'female' // default
}

export function setVoiceGender(gender: VoiceGender): void {
  localStorage.setItem(STORAGE_KEY, gender)
  // Dispatch a custom event so all components can react
  window.dispatchEvent(new CustomEvent('voicePreferenceChanged', { detail: gender }))
}

export function getVoiceName(): string {
  const gender = getVoiceGender()
  return VOICE_PRESETS[gender].googleVoice
}

// ── Speaking rate ─────────────────────────────────────────────────

export type SpeedPreset = 'slow' | 'normal' | 'fast'

export const SPEED_VALUES: Record<SpeedPreset, { rate: number; label: string; icon: string }> = {
  slow:   { rate: 0.7, label: 'Slow',   icon: '🐢' },
  normal: { rate: 1.0, label: 'Normal', icon: '▶️' },
  fast:   { rate: 1.3, label: 'Fast',   icon: '⚡' },
}

export function getSpeakingSpeed(): SpeedPreset {
  const stored = localStorage.getItem(SPEED_KEY)
  if (stored === 'slow' || stored === 'normal' || stored === 'fast') return stored
  return 'normal'
}

export function setSpeakingSpeed(speed: SpeedPreset): void {
  localStorage.setItem(SPEED_KEY, speed)
  window.dispatchEvent(new CustomEvent('voicePreferenceChanged', { detail: speed }))
}

export function getSpeakingRate(): number {
  return SPEED_VALUES[getSpeakingSpeed()].rate
}

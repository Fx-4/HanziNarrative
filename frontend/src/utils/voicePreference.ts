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

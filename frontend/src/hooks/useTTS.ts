import { useState, useCallback, useRef, useEffect } from 'react'
import { getVoiceName, getSpeakingRate } from '@/utils/voicePreference'
import { fetchTTSAudio } from '@/utils/ttsHelper'
import { createLogger } from '@/utils/debugLogger'

const useTTSLogger = createLogger('useTTS')

interface UseTTSOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
  voiceName?: string
}

interface UseTTSReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}


export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    language = 'cmn-CN',
    rate: explicitRate,
    voiceName: explicitVoice,
  } = options

  // Use explicit voice/rate if provided, otherwise read from localStorage preference
  const [preferredVoice, setPreferredVoice] = useState(() => getVoiceName())
  const [preferredRate, setPreferredRate] = useState(() => getSpeakingRate())
  const voiceName = explicitVoice || preferredVoice
  const rate = explicitRate ?? preferredRate

  // Listen for voice preference changes (gender or speed)
  useEffect(() => {
    const handler = () => {
      setPreferredVoice(getVoiceName())
      setPreferredRate(getSpeakingRate())
    }
    window.addEventListener('voicePreferenceChanged', handler)
    return () => window.removeEventListener('voicePreferenceChanged', handler)
  }, [])

  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isSupported = true

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }, [])

  const speakFallback = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = rate
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [rate])

  const speak = useCallback(async (text: string) => {
    if (!text || !text.trim()) return
    stop()

    const token = localStorage.getItem('access_token')
    if (!token) {
      speakFallback(text)
      return
    }

    setIsSpeaking(true)

    // fetchTTSAudio layers everything: IndexedDB → static CDN → backend, with
    // browser-voice shim on network error and playbackRate for slow/fast.
    try {
      const audio = await fetchTTSAudio({ text, language, voiceName, speakingRate: rate })
      audioRef.current = audio
      audio.onended = () => setIsSpeaking(false)
      audio.onerror = () => setIsSpeaking(false)
      await audio.play()
    } catch (error) {
      useTTSLogger.error('TTS synthesis failed, falling back to browser voice', error)
      setIsSpeaking(false)
      speakFallback(text)
    }
  }, [language, rate, voiceName, stop, speakFallback])

  return { speak, stop, isSpeaking, isSupported }
}

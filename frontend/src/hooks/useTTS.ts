import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { buildCacheKey, getAudio, saveAudio } from '@/utils/ttsCache'
import { getVoiceName, getSpeakingRate } from '@/utils/voicePreference'

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

  const playBlob = useCallback((blob: Blob) => {
    const audioUrl = URL.createObjectURL(blob)
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onended = () => {
      setIsSpeaking(false)
      URL.revokeObjectURL(audioUrl)
    }
    audio.onerror = () => {
      setIsSpeaking(false)
      URL.revokeObjectURL(audioUrl)
    }
    return audio.play()
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

    // Layer 1: IndexedDB — zero network if heard before
    const cacheKey = buildCacheKey(text, language, voiceName, rate)
    const cached = await getAudio(cacheKey)
    if (cached) {
      try {
        await playBlob(cached)
        return
      } catch {
        // cached blob may be corrupt, fall through to network
      }
    }

    // Layer 2: Backend (file cache → multi-provider TTS on miss)
    try {
      const response = await axios.post(
        `${API_URL}/tts/synthesize`,
        { text, language, voice_name: voiceName, speaking_rate: rate },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      )

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })

      // Save to IndexedDB for future plays (fire-and-forget)
      saveAudio(cacheKey, audioBlob)

      await playBlob(audioBlob)
    } catch (error) {
      console.error('TTS failed, falling back to browser TTS:', error)
      setIsSpeaking(false)
      speakFallback(text)
      toast.error('TTS unavailable, using browser voice')
    }
  }, [language, rate, voiceName, stop, speakFallback, playBlob])

  return { speak, stop, isSpeaking, isSupported }
}

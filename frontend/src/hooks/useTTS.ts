import { useState, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

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
    rate = 1.0,
    voiceName = 'cmn-CN-Chirp3-HD-Aoede',
  } = options

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
  }, [language, rate])

  const speak = useCallback(async (text: string) => {
    if (!text || !text.trim()) return

    stop()

    const token = localStorage.getItem('access_token')
    if (!token) {
      speakFallback(text)
      return
    }

    setIsSpeaking(true)

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
      const audioUrl = URL.createObjectURL(audioBlob)

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

      await audio.play()
    } catch (error) {
      console.error('Google TTS failed, falling back to browser TTS:', error)
      setIsSpeaking(false)
      speakFallback(text)
      toast.error('Google TTS unavailable, using browser voice')
    }
  }, [language, rate, voiceName, stop, speakFallback])

  return { speak, stop, isSpeaking, isSupported }
}

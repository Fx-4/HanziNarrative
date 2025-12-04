import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface UseTTSOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

interface UseTTSReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    language = 'zh-CN',
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
  } = options

  const [isSpeaking, setIsSpeaking] = useState(false)

  // Check browser support
  const isSupported = typeof window !== 'undefined' &&
    ('speechSynthesis' in window || 'webkitSpeechSynthesis' in window)

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      toast.error('Text-to-Speech is not supported in your browser')
      return
    }

    if (!text || text.trim() === '') {
      return
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        setIsSpeaking(false)
        toast.error(`TTS Error: ${event.error}`)
      }

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Failed to initialize speech synthesis:', error)
      toast.error('Failed to play audio')
      setIsSpeaking(false)
    }
  }, [isSupported, language, rate, pitch, volume])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return { speak, stop, isSpeaking, isSupported }
}

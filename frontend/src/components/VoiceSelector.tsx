import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import {
  getVoiceGender, setVoiceGender, VOICE_PRESETS, type VoiceGender,
  getSpeakingSpeed, setSpeakingSpeed, SPEED_VALUES, type SpeedPreset
} from '@/utils/voicePreference'

interface VoiceSelectorProps {
  /** Compact mode for navbar — just an icon toggle */
  compact?: boolean
}

export default function VoiceSelector({ compact = false }: VoiceSelectorProps) {
  const [gender, setGender] = useState<VoiceGender>(getVoiceGender)
  const [speed, setSpeed] = useState<SpeedPreset>(getSpeakingSpeed)

  // Listen for changes from other components
  useEffect(() => {
    const handler = () => {
      setGender(getVoiceGender())
      setSpeed(getSpeakingSpeed())
    }
    window.addEventListener('voicePreferenceChanged', handler)
    return () => window.removeEventListener('voicePreferenceChanged', handler)
  }, [])

  const toggleGender = () => {
    const next: VoiceGender = gender === 'female' ? 'male' : 'female'
    setVoiceGender(next)
    setGender(next)
  }

  const cycleSpeed = () => {
    const order: SpeedPreset[] = ['slow', 'normal', 'fast']
    const idx = order.indexOf(speed)
    const next = order[(idx + 1) % order.length]
    setSpeakingSpeed(next)
    setSpeed(next)
  }

  const preset = VOICE_PRESETS[gender]
  const speedInfo = SPEED_VALUES[speed]

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {/* Voice gender toggle */}
        <motion.button
          onClick={toggleGender}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title={`Voice: ${preset.labelCn} (${preset.label}) — Click to switch`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={gender}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-0.5"
            >
              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                {gender === 'female' ? '♀' : '♂'}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Speed toggle */}
        <motion.button
          onClick={cycleSpeed}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title={`Speed: ${speedInfo.label} (${speedInfo.rate}x) — Click to cycle`}
        >
          <span className="text-xs">{speedInfo.icon}</span>
        </motion.button>
      </div>
    )
  }

  // Full toggle (used in mobile drawer or settings)
  return (
    <div className="space-y-2">
      {/* Voice gender */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 gap-0.5">
          {(['female', 'male'] as VoiceGender[]).map((g) => {
            const active = gender === g
            const p = VOICE_PRESETS[g]
            return (
              <button
                key={g}
                onClick={() => { setVoiceGender(g); setGender(g) }}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="voice-toggle"
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p.labelCn}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-4 text-center">
          {speedInfo.icon}
        </span>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 gap-0.5">
          {(['slow', 'normal', 'fast'] as SpeedPreset[]).map((s) => {
            const active = speed === s
            const si = SPEED_VALUES[s]
            return (
              <button
                key={s}
                onClick={() => { setSpeakingSpeed(s); setSpeed(s) }}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="speed-toggle"
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{si.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

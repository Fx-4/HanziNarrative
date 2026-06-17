import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLogger } from '@/utils/debugLogger'

const logger = createLogger('StudyTimer')

export const POMODORO_TIME = 25 * 60 // 25 min focus
export const SHORT_BREAK = 5 * 60 // 5 min
export const LONG_BREAK = 15 * 60 // 15 min

export type SessionType = 'focus' | 'short-break' | 'long-break'

function durationFor(type: SessionType): number {
  return type === 'focus' ? POMODORO_TIME : type === 'short-break' ? SHORT_BREAK : LONG_BREAK
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

interface StudyTimerState {
  // Pomodoro
  sessionType: SessionType
  remaining: number // seconds left in the current session
  isRunning: boolean
  sessionsCompleted: number

  // Run-segment anchors (timestamp based so background-tab throttling is accurate)
  runStartedAt: number | null
  runStartRemaining: number

  // Study-time accounting (focus seconds today)
  totalStudyTimeToday: number
  studyDate: string

  // Floating widget visibility
  showFloating: boolean

  // Actions
  start: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  tick: () => void
  setShowFloating: (v: boolean) => void
}

/** Play a short completion beep via Web Audio. Best-effort. */
function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch (e) {
    logger.debug('Chime unavailable', e)
  }
}

export const useStudyTimerStore = create<StudyTimerState>()(
  persist(
    (set, get) => ({
      sessionType: 'focus',
      remaining: POMODORO_TIME,
      isRunning: false,
      sessionsCompleted: 0,
      runStartedAt: null,
      runStartRemaining: POMODORO_TIME,
      totalStudyTimeToday: 0,
      studyDate: todayKey(),
      showFloating: true,

      start: () => {
        // Roll over study time at midnight
        const today = todayKey()
        const patch = get().studyDate === today ? {} : { studyDate: today, totalStudyTimeToday: 0 }
        set({ ...patch, isRunning: true, runStartedAt: Date.now(), runStartRemaining: get().remaining })
        logger.debug('Timer started', { sessionType: get().sessionType, remaining: get().remaining })
      },

      pause: () => set({ isRunning: false, runStartedAt: null }),

      toggle: () => (get().isRunning ? get().pause() : get().start()),

      reset: () =>
        set((s) => ({
          isRunning: false,
          runStartedAt: null,
          remaining: durationFor(s.sessionType),
          runStartRemaining: durationFor(s.sessionType),
        })),

      tick: () => {
        const s = get()
        if (!s.isRunning || s.runStartedAt == null) return

        const today = todayKey()
        const elapsed = Math.floor((Date.now() - s.runStartedAt) / 1000)
        const newRemaining = Math.max(0, s.runStartRemaining - elapsed)

        // Accumulate focus seconds (delta since last tick), with daily reset
        let totalStudyTimeToday = s.studyDate === today ? s.totalStudyTimeToday : 0
        const studyDate = today
        if (s.sessionType === 'focus' && newRemaining < s.remaining) {
          totalStudyTimeToday += s.remaining - newRemaining
        }

        if (newRemaining === 0) {
          // Session finished → advance to the next session
          const isFocus = s.sessionType === 'focus'
          const sessionsCompleted = isFocus ? s.sessionsCompleted + 1 : s.sessionsCompleted
          const nextType: SessionType = isFocus
            ? sessionsCompleted % 4 === 0
              ? 'long-break'
              : 'short-break'
            : 'focus'
          set({
            sessionType: nextType,
            remaining: durationFor(nextType),
            runStartRemaining: durationFor(nextType),
            isRunning: false,
            runStartedAt: null,
            sessionsCompleted,
            totalStudyTimeToday,
            studyDate,
          })
          playChime()
          logger.info('Session complete', { finished: s.sessionType, next: nextType })
          return
        }

        set({ remaining: newRemaining, totalStudyTimeToday, studyDate })
      },

      setShowFloating: (v) => set({ showFloating: v }),
    }),
    {
      name: 'study-timer-storage',
      // Don't persist live-running flags: after a reload we never silently resume,
      // so offline time is never counted as study time.
      partialize: (s) => ({
        sessionType: s.sessionType,
        remaining: s.remaining,
        sessionsCompleted: s.sessionsCompleted,
        totalStudyTimeToday: s.totalStudyTimeToday,
        studyDate: s.studyDate,
        showFloating: s.showFloating,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isRunning = false
          state.runStartedAt = null
          state.runStartRemaining = state.remaining
          // Reset accumulated study time if the stored day is stale
          if (state.studyDate !== todayKey()) {
            state.totalStudyTimeToday = 0
            state.studyDate = todayKey()
          }
        }
      },
    }
  )
)

// ── Single global 1 Hz ticker ────────────────────────────────────────────────
// One interval drives the store regardless of which components are mounted, so
// the timer keeps counting while the user navigates between tabs/pages.
if (typeof window !== 'undefined') {
  const w = window as unknown as { __studyTimerInterval?: ReturnType<typeof setInterval> }
  if (!w.__studyTimerInterval) {
    w.__studyTimerInterval = setInterval(() => {
      const s = useStudyTimerStore.getState()
      if (s.isRunning) s.tick()
    }, 1000)
  }
}

// ── Helpers (shared by widget + floating pill) ───────────────────────────────
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function formatStudyTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function sessionLabel(type: SessionType): string {
  return type === 'focus' ? 'Focus Time' : type === 'short-break' ? 'Short Break' : 'Long Break'
}

export function sessionGradient(type: SessionType): string {
  return type === 'focus'
    ? 'from-primary-500 to-violet-600'
    : type === 'short-break'
      ? 'from-success-500 to-success-600'
      : 'from-blue-500 to-cyan-600'
}

export function sessionAccentText(type: SessionType): string {
  return type === 'focus'
    ? 'text-primary-600 dark:text-primary-400'
    : type === 'short-break'
      ? 'text-success-600 dark:text-success-400'
      : 'text-blue-500 dark:text-blue-400'
}

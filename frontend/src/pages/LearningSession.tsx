import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getSession, getUnitWords, ALL_UNITS, Word, GrammarPoint, FillBlank, UnitDef } from '@/data/curriculum'
import { learningPathApi, learningApi, funApi } from '@/services/api'
import { fetchTTSAudio } from '@/utils/ttsHelper'
import { pinyin as toPinyin } from 'pinyin-pro'

// Single-char lookup override: 了 defaults to liǎo in isolation, but in HSK fill-
// blank options it's always the particle "le". Full-sentence toPinyin() is context-
// aware and already handles this correctly — only needed for per-char display.
const PARTICLE_PINYIN: Record<string, string> = { '了': 'le' }
import {
  Volume2, ChevronRight, CheckCircle, X, Star, Zap,
  ArrowLeft, Loader2, Trophy, RefreshCw, Info,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { createLogger } from '@/utils/debugLogger'
import TonedPinyin from '@/components/TonedPinyin'
import HanziBreakdown from '@/components/HanziBreakdown'
import GiphyAttribution from '@/components/GiphyAttribution'
import { playFeedback } from '@/utils/feedbackSfx'

const learningSessionLogger = createLogger('LearningSession')

// ── Step types ────────────────────────────────────────────────────────────────

type StepIntro = { kind: 'intro'; word: Word }
type StepGrammar = { kind: 'grammar'; point: GrammarPoint }
type StepMCQ = { kind: 'mcq'; question: string; promptZh?: string; options: string[]; correct: number; wordZh?: string; retry?: boolean }
type StepMatch = { kind: 'match'; pairs: { zh: string; en: string }[] }
type StepFill = { kind: 'fill'; fb: FillBlank; retry?: boolean }
type StepListen = { kind: 'listen'; zh: string; py: string; en: string; options: string[]; correct: number; retry?: boolean }
type Step = StepIntro | StepGrammar | StepMCQ | StepMatch | StepFill | StepListen

// ── Session save / resume ─────────────────────────────────────────────────────
const SESSION_SAVE_TTL = 2 * 60 * 60 * 1000 // 2 hours
const getSaveKey = (id: string) => `session-save-${id}`
type SessionSave = { steps: Step[]; currentIdx: number; correct: number; wrong: number; savedAt: number }

// ── Exercise generation ────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  // Fisher–Yates — uniform, unlike sort(() => Math.random() - 0.5)
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Context example lookup ────────────────────────────────────────────────────

type ContextExample = { zh: string; py: string; en: string }

/**
 * "In context" fallback for words without a handcrafted example: reuse a REAL
 * sentence from the curriculum itself — grammar examples first (curated zh/py/en),
 * then fill-blank sentences whose answer is this word. Searches the word's own
 * unit first, then the rest of its HSK level. Works for every level, no extra
 * content writing needed.
 */
function findContextExample(word: Word, unit: UnitDef): ContextExample | null {
  const levelUnits = [unit, ...ALL_UNITS.filter(u => u.hsk_level === unit.hsk_level && u.id !== unit.id && !u.locked)]

  // Pass 1: curated grammar examples containing the word
  for (const u of levelUnits) {
    for (const s of u.sessions) {
      for (const gp of s.grammarPoints ?? []) {
        const ex = gp.examples.find(e => e.zh.includes(word.zh))
        if (ex) return ex
      }
    }
  }

  // Pass 2: fill-blank sentences whose correct answer is this word
  for (const u of levelUnits) {
    for (const s of u.sessions) {
      for (const gp of s.grammarPoints ?? []) {
        for (const fb of gp.fillBlanks) {
          if (fb.options[fb.correct] === word.zh) {
            const zh = fb.sentence_zh.replace('___', word.zh)
            return {
              zh,
              py: toPinyin(zh, { toneType: 'symbol', type: 'string' }),
              en: fb.sentence_en,
            }
          }
        }
      }
    }
  }

  return null
}

function mcqFromWord(word: Word, pool: Word[], askMeaning = true): StepMCQ {
  const distractors = shuffle(pool.filter(w => w.zh !== word.zh)).slice(0, 3)
  if (askMeaning) {
    const opts = shuffle([word.en, ...distractors.map(d => d.en)])
    return { kind: 'mcq', question: `What does "${word.zh}" mean?`, promptZh: word.zh, options: opts, correct: opts.indexOf(word.en), wordZh: word.zh }
  } else {
    const opts = shuffle([word.zh, ...distractors.map(d => d.zh)])
    return { kind: 'mcq', question: `Which character means "${word.en}"?`, options: opts, correct: opts.indexOf(word.zh), wordZh: word.zh }
  }
}

function listenFromWord(word: Word, pool: Word[]): StepListen {
  const distractors = shuffle(pool.filter(w => w.zh !== word.zh)).slice(0, 3)
  const opts = shuffle([word.zh, ...distractors.map(d => d.zh)])
  return { kind: 'listen', zh: word.zh, py: word.py, en: word.en, options: opts, correct: opts.indexOf(word.zh) }
}

/**
 * Retry copy with RESHUFFLED options — without this the learner can pass the
 * retry by remembering the position of the answer instead of the answer itself.
 */
function reshuffledRetry(step: StepMCQ | StepFill | StepListen): Step {
  if (step.kind === 'fill') {
    const correctText = step.fb.options[step.fb.correct]
    const options = shuffle(step.fb.options)
    return { ...step, retry: true, fb: { ...step.fb, options, correct: options.indexOf(correctText) } }
  }
  const correctText = step.options[step.correct]
  const options = shuffle(step.options)
  return { ...step, retry: true, options, correct: options.indexOf(correctText) }
}

function generateSteps(
  type: string,
  words?: Word[],
  grammarPoints?: GrammarPoint[],
  practicePool?: Word[],
  reviewPool?: Word[],
): Step[] {
  const steps: Step[] = []

  if (type === 'vocab' && words && words.length > 0) {
    const batchSize = 4
    const batches: Word[][] = []
    for (let i = 0; i < words.length; i += batchSize) batches.push(words.slice(i, i + batchSize))

    // Every word gets an MCQ (shuffled, alternating direction) + one listening
    // question per batch (hear TTS → pick the character)
    const pushTests = (batch: Word[]) => {
      shuffle(batch).forEach((w, idx) =>
        steps.push(mcqFromWord(w, words, idx % 2 === 0))
      )
      steps.push(listenFromWord(batch[Math.floor(Math.random() * batch.length)], words))
    }

    batches.forEach((batch, bi) => {
      batch.forEach(w => steps.push({ kind: 'intro', word: w }))
      // Delayed retrieval: quiz the PREVIOUS batch after the new intros, so
      // answers come from memory instead of the card the user just saw
      if (bi > 0) pushTests(batches[bi - 1])
    })
    pushTests(batches[batches.length - 1])

    // Final match (up to 5 pairs)
    const matchWords = shuffle(words).slice(0, Math.min(5, words.length))
    steps.push({ kind: 'match', pairs: matchWords.map(w => ({ zh: w.zh, en: w.en })) })
  }

  if (type === 'grammar' && grammarPoints && grammarPoints.length > 0) {
    grammarPoints.forEach(gp => {
      steps.push({ kind: 'grammar', point: gp })
      gp.fillBlanks.forEach(fb => steps.push({ kind: 'fill', fb }))
    })
  }

  if (type === 'practice' && practicePool && practicePool.length > 0) {
    const graded: Step[] = []
    const pool = shuffle(practicePool)
    pool.slice(0, Math.min(6, pool.length)).forEach((w, idx) =>
      graded.push(mcqFromWord(w, practicePool, idx % 2 === 0))
    )
    // Listening — 2 slots
    shuffle(practicePool).slice(0, Math.min(2, practicePool.length)).forEach(w =>
      graded.push(listenFromWord(w, practicePool))
    )
    // Cumulative review: 2 questions from the previous units fight the
    // forgetting curve (interleaving across the whole level, not just this unit)
    if (reviewPool && reviewPool.length >= 4) {
      shuffle(reviewPool).slice(0, 2).forEach((w, idx) =>
        graded.push(mcqFromWord(w, reviewPool, idx % 2 === 0))
      )
    }
    steps.push(...shuffle(graded))
    const matchWords = shuffle(practicePool).slice(0, Math.min(5, practicePool.length))
    steps.push({ kind: 'match', pairs: matchWords.map(w => ({ zh: w.zh, en: w.en })) })
  }

  return steps
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IntroCard({ step, onNext, imageUrl, example }: {
  step: StepIntro
  onNext: () => void
  imageUrl?: string
  /** Handcrafted example, or automatic fallback found in the unit/level material */
  example: ContextExample | null
}) {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const [showToneHelp, setShowToneHelp] = useState(false)
  const [examplePlaying, setExamplePlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const exampleAudioRef = useRef<HTMLAudioElement | null>(null)
  const fetchPromiseRef = useRef<Promise<HTMLAudioElement> | null>(null)

  // Pre-fetch audio as soon as card mounts, auto-play if browser allows.
  // Browser-voice fallback disabled: intro audio teaches pronunciation, so
  // only the real (Edge) voice is acceptable.
  useEffect(() => {
    let cancelled = false
    const promise = fetchTTSAudio({ text: step.word.zh, allowBrowserFallback: false, retries: 1 })
    fetchPromiseRef.current = promise

    promise.then(audio => {
      if (cancelled) return
      audioRef.current = audio
      // Auto-play (fires-and-forgets; NotAllowedError is fine here)
      audio.play().catch(() => { /* autoplay blocked — user can click */ })
    }).catch(err => {
      if (!cancelled) learningSessionLogger.error('[TTS] prefetch failed:', err)
    })

    return () => {
      cancelled = true
      audioRef.current?.pause()
      audioRef.current = null
      exampleAudioRef.current?.pause()
      exampleAudioRef.current = null
      fetchPromiseRef.current = null
    }
  }, [step.word.zh])

  const play = async () => {
    if (playing) return
    setPlaying(true)
    try {
      let audio = audioRef.current
      if (!audio && fetchPromiseRef.current) {
        // Still fetching — wait for it
        audio = await fetchPromiseRef.current
        audioRef.current = audio
      }
      if (audio) {
        audio.currentTime = 0
        await audio.play()
      }
    } catch (err) {
      learningSessionLogger.error('[TTS] play failed:', err)
      toast.error(t('session.audioPlayFailed'), { duration: 2000 })
    }
    setPlaying(false)
  }

  const playExample = async () => {
    if (!example || examplePlaying) return
    setExamplePlaying(true)
    try {
      let audio = exampleAudioRef.current
      if (!audio) {
        audio = await fetchTTSAudio({ text: example.zh, retries: 1 })
        exampleAudioRef.current = audio
      }
      audio.currentTime = 0
      await audio.play()
    } catch (err) {
      learningSessionLogger.error('[TTS] example play failed:', err)
      toast.error(t('session.audioPlayFailed'), { duration: 2000 })
    }
    setExamplePlaying(false)
  }

  return (
    <motion.div key={step.word.zh} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center gap-5 py-6"
    >
      <button onClick={play} disabled={playing}
        className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-60 dark:hover:bg-primary-900/40"
      >
        {playing ? <Loader2 className="w-5 h-5 text-primary-500 animate-spin" /> : <Volume2 className="w-5 h-5 text-primary-500" />}
      </button>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={step.word.en}
          loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none' }}
          className="w-44 h-28 object-cover rounded-2xl shadow-sm"
        />
      )}

      <div>
        {/* Each character is tappable — shows that hanzi's own pinyin + meaning */}
        <p>
          <HanziBreakdown text={step.word.zh} className="font-chinese text-7xl font-bold text-gray-900 dark:text-gray-50" />
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{t('session.tapChar')}</p>
        <p className="text-lg mt-2 flex items-center justify-center gap-1.5">
          <TonedPinyin py={step.word.py} />
          <button
            type="button"
            onClick={() => setShowToneHelp(s => !s)}
            title={t('session.toneTitle')}
            className="p-1 rounded-full text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold mt-1">{step.word.en}</p>
        {step.word.note && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto italic">{step.word.note}</p>
        )}
      </div>

      {/* Tone explanation for absolute beginners — why the pinyin is colored */}
      <AnimatePresence>
        {showToneHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-xs overflow-hidden"
          >
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 text-left">
              <p className="text-xs font-bold text-sky-700 dark:text-sky-300 mb-1.5">{t('session.toneTitle')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{t('session.toneIntro')}</p>
              <ul className="space-y-1 text-xs font-semibold">
                <li className="text-red-600 dark:text-red-400">{t('session.tone1')}</li>
                <li className="text-emerald-600 dark:text-emerald-400">{t('session.tone2')}</li>
                <li className="text-blue-600 dark:text-blue-400">{t('session.tone3')}</li>
                <li className="text-violet-600 dark:text-violet-400">{t('session.tone4')}</li>
                <li className="text-gray-500 dark:text-gray-400">{t('session.tone5')}</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage in context */}
      {example && (
        <div className="w-full max-w-xs bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 rounded-2xl p-3.5 text-left">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{t('session.inContext')}</p>
            <button
              type="button"
              onClick={playExample}
              disabled={examplePlaying}
              className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors disabled:opacity-60"
            >
              {examplePlaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p><HanziBreakdown text={example.zh} className="font-chinese text-xl text-gray-900 dark:text-gray-100" /></p>
          <p className="text-xs mt-0.5"><TonedPinyin py={example.py} /></p>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">{example.en}</p>
        </div>
      )}

      {/* Fun fact — the "why" behind the word */}
      {step.word.funFact && (
        <div className="w-full max-w-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-3.5 text-left">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">💡 {t('session.funFact')}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{step.word.funFact}</p>
        </div>
      )}

      <button onClick={onNext}
        className="mt-2 w-full max-w-xs py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {t('session.continue')} <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

function GrammarCard({ step, onNext }: { step: StepGrammar; onNext: () => void }) {
  const { t } = useTranslation()
  const gp = step.point
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)
  const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({})

  // Stop any playing example when the card unmounts
  useEffect(() => () => {
    Object.values(audioCacheRef.current).forEach(a => a.pause())
  }, [])

  const playExample = async (zh: string, idx: number) => {
    if (playingIdx !== null) return
    setPlayingIdx(idx)
    try {
      let audio = audioCacheRef.current[zh]
      if (!audio) {
        audio = await fetchTTSAudio({ text: zh, retries: 1 })
        audioCacheRef.current[zh] = audio
      }
      audio.currentTime = 0
      await audio.play()
    } catch (err) {
      learningSessionLogger.error('[TTS] grammar example play failed:', err)
      toast.error(t('session.audioPlayFailed'), { duration: 2000 })
    }
    setPlayingIdx(null)
  }

  return (
    <motion.div key={gp.pattern} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center">
        <span className="text-xs font-bold text-violet-600 uppercase tracking-widest dark:text-violet-400">{t('session.grammar')}</span>
        <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50 mt-1">{gp.pattern}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{gp.explanation}</p>
      </div>

      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-4 space-y-3">
        {gp.examples.map((ex, i) => (
          <div key={i} className="border-b border-violet-100 dark:border-violet-900/40 last:border-0 pb-2 last:pb-0 flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => playExample(ex.zh, i)}
              disabled={playingIdx !== null}
              className="mt-0.5 p-2 rounded-xl bg-white dark:bg-gray-800 text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {playingIdx === i ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <p className="font-chinese text-xl text-gray-800 dark:text-gray-200">{ex.zh}</p>
              <p className="text-xs text-violet-500">{ex.py}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">{ex.en}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNext}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {t('session.gotIt')} <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

function MCQCard({ step, onCorrect, onWrong }: { step: StepMCQ; onCorrect: () => void; onWrong: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === step.correct) { setTimeout(onCorrect, 900) }
    else { setTimeout(onWrong, 900) }
  }

  return (
    <motion.div key={step.question} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="text-center">
        {step.promptZh && (
          <p className="font-chinese text-5xl font-bold text-gray-900 dark:text-gray-50 mb-3">{step.promptZh}</p>
        )}
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{step.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {step.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === step.correct
          let cls = 'border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-card text-gray-800 dark:text-gray-100'
          if (isSelected && isCorrect) cls = 'border-success-500 bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'
          else if (isSelected && !isCorrect) cls = 'border-error-400 bg-error-50 dark:bg-error-950/40 text-error-700 dark:text-error-300'
          else if (selected !== null && isCorrect) cls = 'border-success-500 bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'

          return (
            <button key={i} onClick={() => pick(i)}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-between transition-all ${cls}`}
            >
              <span className="font-chinese text-lg">{opt}</span>
              {selected !== null && isCorrect && <CheckCircle className="w-4 h-4 text-success-500" />}
              {isSelected && !isCorrect && <X className="w-4 h-4 text-error-500" />}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function MatchCard({ step, onNext, onHit, onMiss }: {
  step: StepMatch
  onNext: () => void
  onHit: (zh: string) => void
  onMiss: (zh: string) => void
}) {
  const { t } = useTranslation()
  const [leftSel, setLeftSel] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<string | null>(null)
  // Shuffle ONCE on mount — computing in render body reshuffled the column on
  // every state change, making buttons jump around after each tap
  const [rightItems] = useState(() => shuffle(step.pairs.map(p => p.en)))

  const leftItems = step.pairs.map(p => p.zh)

  const pickRight = (en: string) => {
    if (!leftSel) return
    const correctPair = step.pairs.find(p => p.zh === leftSel)
    if (correctPair?.en === en) {
      onHit(leftSel)
      const next = new Set(matched)
      next.add(leftSel); next.add(en)
      setMatched(next)
      setLeftSel(null)
      if (next.size >= step.pairs.length * 2) setTimeout(onNext, 600)
    } else {
      onMiss(leftSel)
      setFlash(leftSel)
      setTimeout(() => { setFlash(null); setLeftSel(null) }, 600)
    }
  }

  const btnCls = (val: string, side: 'l' | 'r') => {
    const zhKey = side === 'l' ? val : step.pairs.find(p => p.en === val)?.zh ?? ''
    const enKey = side === 'r' ? val : step.pairs.find(p => p.zh === val)?.en ?? ''
    if (matched.has(val)) return 'border-success-400 bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300 opacity-60'
    if (flash === zhKey || flash === enKey) return 'border-error-400 bg-error-50 dark:bg-error-950/30 text-error-600 dark:text-error-400'
    if (side === 'l' && leftSel === val) return 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
    return 'border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-card text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30'
  }

  return (
    <motion.div key="match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
        {t('session.matchInstruction')}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-2">
          {leftItems.map(zh => (
            <button key={zh} onClick={() => !matched.has(zh) && setLeftSel(zh)}
              disabled={matched.has(zh)}
              className={`w-full py-3 px-3 rounded-xl border-2 font-chinese text-xl font-bold transition-all ${btnCls(zh, 'l')}`}
            >
              {zh}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map(en => (
            <button key={en} onClick={() => !matched.has(en) && pickRight(en)}
              disabled={matched.has(en)}
              className={`w-full py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${btnCls(en, 'r')}`}
            >
              {en}
            </button>
          ))}
        </div>
      </div>
      {matched.size < step.pairs.length * 2 && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          {t('session.matched', { done: matched.size / 2, total: step.pairs.length })}
        </p>
      )}
    </motion.div>
  )
}

function FillCard({ step, onCorrect, onWrong }: { step: StepFill; onCorrect: () => void; onWrong: () => void }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)
  const fb = step.fb

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === fb.correct) setTimeout(onCorrect, 900)
    else setTimeout(onWrong, 900)
  }

  const highlighted = fb.sentence_zh.replace('___', '＿＿＿')
  // Generate pinyin for the sentence; ___ stays as-is (non-Chinese)
  const sentencePy = toPinyin(fb.sentence_zh, { toneType: 'symbol', type: 'string' })

  return (
    <motion.div key={fb.sentence_zh} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="bg-primary-50 dark:bg-primary-950/30 rounded-2xl p-4 text-center space-y-1">
        <p className="font-chinese text-2xl font-bold text-gray-900 dark:text-gray-100">{highlighted}</p>
        <p className="text-xs font-mono text-primary-500 leading-relaxed">{sentencePy}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{fb.sentence_en}</p>
      </div>
      <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">{t('session.chooseWord')}</p>
      <div className="grid grid-cols-2 gap-2">
        {fb.options.map((opt, i) => {
          const isSel = selected === i
          const isCorr = i === fb.correct
          let cls = 'border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-card text-gray-800 dark:text-gray-100'
          if (isSel && isCorr) cls = 'border-success-500 bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'
          else if (isSel && !isCorr) cls = 'border-error-400 bg-error-50 dark:bg-error-950/40 text-error-700 dark:text-error-300'
          else if (selected !== null && isCorr) cls = 'border-success-500 bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-300'
          return (
            <button key={i} onClick={() => pick(i)}
              className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 ${cls}`}
            >
              <span className="font-chinese text-xl font-bold leading-none">{opt}</span>
              <span className="text-[10px] font-mono font-normal opacity-70">
                {PARTICLE_PINYIN[opt] ?? toPinyin(opt, { toneType: 'symbol', type: 'string' })}
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function ListenCard({ step, onCorrect, onWrong }: { step: StepListen; onCorrect: () => void; onWrong: () => void }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  // loading = fetching from backend · ready = audio in hand · error = tap to retry
  const [audioState, setAudioState] = useState<'loading' | 'ready' | 'error'>('loading')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fetchPromiseRef = useRef<Promise<HTMLAudioElement> | null>(null)
  const cancelledRef = useRef(false)

  // Listening MUST use the real (Edge) voice — a robotic browser voice would
  // teach the wrong pronunciation, so browser fallback is disabled here.
  const startFetch = useCallback((autoplay: boolean) => {
    setAudioState('loading')
    const promise = fetchTTSAudio({ text: step.zh, allowBrowserFallback: false, retries: 2 })
    fetchPromiseRef.current = promise
    promise.then(audio => {
      if (cancelledRef.current) return
      audioRef.current = audio
      setAudioState('ready')
      if (autoplay) audio.play().catch(() => { /* autoplay blocked — user taps */ })
    }).catch(err => {
      if (cancelledRef.current) return
      fetchPromiseRef.current = null
      setAudioState('error')
      learningSessionLogger.error('[TTS] listen fetch failed:', err)
    })
    return promise
  }, [step.zh])

  useEffect(() => {
    cancelledRef.current = false
    audioRef.current = null
    startFetch(true)
    return () => {
      cancelledRef.current = true
      audioRef.current?.pause()
      audioRef.current = null
      fetchPromiseRef.current = null
    }
  }, [startFetch])

  const play = async () => {
    if (playing) return
    setPlaying(true)
    try {
      let audio = audioRef.current
      if (!audio) {
        // No audio yet — await the in-flight fetch, or start a new one (retry after error)
        const promise = fetchPromiseRef.current ?? startFetch(false)
        audio = await promise
        audioRef.current = audio
      }
      audio.currentTime = 0
      await audio.play()
    } catch {
      toast.error(t('session.audioNotReady'), { duration: 2500 })
    }
    setPlaying(false)
  }

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    // Longer reveal than MCQ — learner needs a beat to connect sound ↔ character
    if (i === step.correct) setTimeout(onCorrect, 1200)
    else setTimeout(onWrong, 1200)
  }

  return (
    <motion.div key={step.zh} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">{t('session.listening')}</span>
        <button onClick={play} disabled={playing}
          className="w-20 h-20 mx-auto rounded-3xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors disabled:opacity-60"
        >
          {playing || audioState === 'loading'
            ? <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
            : audioState === 'error'
              ? <RefreshCw className="w-7 h-7 text-sky-500" />
              : <Volume2 className="w-7 h-7 text-sky-500" />}
        </button>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {audioState === 'loading'
            ? t('session.preparingAudio')
            : audioState === 'error'
              ? t('session.audioError')
              : t('session.whichCharacter')}
        </p>
        {selected !== null && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <TonedPinyin py={step.py} className="font-mono" /> · {step.en}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {step.options.map((opt, i) => {
          const isSel = selected === i
          const isCorr = i === step.correct
          let cls = 'border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-card text-gray-800 dark:text-gray-100'
          if (isSel && isCorr) cls = 'border-success-500 bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'
          else if (isSel && !isCorr) cls = 'border-error-400 bg-error-50 dark:bg-error-950/40 text-error-700 dark:text-error-300'
          else if (selected !== null && isCorr) cls = 'border-success-500 bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'
          return (
            <button key={i} onClick={() => pick(i)}
              className={`py-4 rounded-xl font-chinese text-2xl font-bold transition-all ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Main Session Player ───────────────────────────────────────────────────────

export default function LearningSession() {
  const { t } = useTranslation()
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [steps, setSteps] = useState<Step[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [isNew, setIsNew] = useState(false)
  const [stepKey, setStepKey] = useState(0)
  const [noContent, setNoContent] = useState(false)
  const [combo, setCombo] = useState(0)
  const [wordImages, setWordImages] = useState<Record<string, string>>({})
  // Per-word answer tally for this session — fed into SRS on completion
  const resultsRef = useRef<Record<string, { correct: number; wrong: number }>>({})
  // Next-session navigation state
  const [nextSessionId, setNextSessionId] = useState<string | null>(null)
  const [isLastInUnit, setIsLastInUnit] = useState(false)
  const [nextUnitInfo, setNextUnitInfo] = useState<{ title: string; subtitle: string; emoji: string } | null>(null)
  // Giphy morale booster on the completion screen (hidden when backend has no key)
  const [funGif, setFunGif] = useState<string | null>(null)
  const [loadingGif, setLoadingGif] = useState(false)
  const gifMoodRef = useRef<'celebrate' | 'motivate'>('celebrate')
  // Monotonic request id: only the latest loadFunGif call may write state, so a
  // stale in-flight fetch (or a duplicate finishSession under React StrictMode /
  // slow backend) can never wipe a newer GIF
  const gifReqRef = useRef(0)
  // Guards finishSession against double execution (StrictMode / last-step re-render)
  const finishedRef = useRef(false)

  // Fetch a GIF from GIPHY (via backend) — reused for the initial reward and the
  // "another one" refresh button so the GIPHY fetch is visible/repeatable on demand
  const loadFunGif = useCallback((mood: 'celebrate' | 'motivate') => {
    gifMoodRef.current = mood
    const reqId = ++gifReqRef.current
    setLoadingGif(true)
    funApi.getGif(mood)
      .then(r => { if (reqId === gifReqRef.current && r.available && r.url) setFunGif(r.url) })
      .catch(() => { /* optional feature */ })
      .finally(() => { if (reqId === gifReqRef.current) setLoadingGif(false) })
  }, [])
  // Blocking audio preload on session start — loads all TTS up front so there's
  // no per-card wait inside the lesson
  const [preparingAudio, setPreparingAudio] = useState(false)
  const [preloadPct, setPreloadPct] = useState(0)
  const preloadCancelRef = useRef(false)

  useEffect(() => {
    if (!sessionId) return
    const found = getSession(sessionId)
    if (!found) return
    const { session, unit } = found

    let cancelled = false
    preloadCancelRef.current = false
    finishedRef.current = false

    // Fetch vocab images for intro cards (backend Pexels/Pixabay cache)
    const fetchImages = (stepsList: Step[]) => {
      const introZh = stepsList
        .filter((s): s is StepIntro => s.kind === 'intro')
        .map(s => s.word.zh)
      if (introZh.length > 0) {
        learningApi.getWordImages(introZh)
          .then(r => setWordImages(r.images))
          .catch(() => { /* images are progressive enhancement */ })
      }
    }

    // ── Resume saved mid-session progress ──────────────────────────────────
    try {
      const raw = sessionStorage.getItem(getSaveKey(sessionId))
      if (raw) {
        const save: SessionSave = JSON.parse(raw)
        const fresh = Date.now() - save.savedAt < SESSION_SAVE_TTL
        const resumable = Array.isArray(save.steps) && save.currentIdx > 0 && save.currentIdx < save.steps.length
        if (fresh && resumable) {
          setSteps(save.steps)
          setCurrentIdx(save.currentIdx)
          setCorrect(save.correct ?? 0)
          setWrong(save.wrong ?? 0)
          setStepKey(save.currentIdx)
          fetchImages(save.steps)
          toast(t('session.resume'), { duration: 2500 })
          return
        }
        sessionStorage.removeItem(getSaveKey(sessionId))
      }
    } catch {
      sessionStorage.removeItem(getSaveKey(sessionId))
    }

    // ── Fresh start ─────────────────────────────────────────────────────────
    const practicePool = getUnitWords(unit.id)
    // Cumulative review pool: words from up to 2 previous units of this level
    const levelUnits = ALL_UNITS.filter(u => u.hsk_level === unit.hsk_level && !u.locked)
    const unitIdx = levelUnits.findIndex(u => u.id === unit.id)
    const reviewPool = unitIdx > 0
      ? levelUnits
          .slice(Math.max(0, unitIdx - 2), unitIdx)
          .flatMap(u => u.sessions.flatMap(s => s.words ?? []))
      : []
    const generated = generateSteps(session.type, session.words, session.grammarPoints, practicePool, reviewPool)
    setSteps(generated)
    resultsRef.current = {}
    setCombo(0)
    fetchImages(generated)
    // Stub/empty sessions (e.g. HSK 5–6 via direct URL) generate zero steps —
    // without this flag the skeleton below would spin forever
    setNoContent(generated.length === 0)

    // ── Blocking TTS preload ──────────────────────────────────────────────
    // Fetch EVERY audio this session will play (words, example sentences,
    // listening) before showing content, so nothing loads mid-lesson. Cached
    // items resolve instantly from IndexedDB; a hard cap keeps a cold backend
    // from stalling the start forever.
    const audioTexts = [...new Set(generated.flatMap(s => {
      if (s.kind === 'intro') {
        const ex = s.word.example ?? findContextExample(s.word, unit)
        return ex ? [s.word.zh, ex.zh] : [s.word.zh]
      }
      if (s.kind === 'listen') return [s.zh]
      return []
    }))]

    const token = localStorage.getItem('access_token')
    if (audioTexts.length === 0 || !token) return

    setPreparingAudio(true)
    setPreloadPct(0)

    const finish = () => {
      if (cancelled || preloadCancelRef.current) return
      preloadCancelRef.current = true
      setPreparingAudio(false)
    }
    // Hard cap (~9 s): proceed even if a cold backend hasn't answered yet
    const capTimer = setTimeout(finish, 9000)

    let done = 0
    Promise.allSettled(
      audioTexts.map(zh =>
        fetchTTSAudio({ text: zh, allowBrowserFallback: false }).finally(() => {
          done++
          if (!cancelled) setPreloadPct(Math.round((done / audioTexts.length) * 100))
        })
      )
    ).then(() => {
      clearTimeout(capTimer)
      finish()
    })

    return () => {
      cancelled = true
      preloadCancelRef.current = true
      clearTimeout(capTimer)
    }
  }, [sessionId])

  // Let the user bail out of the preload wait and start immediately
  const skipPreload = () => {
    preloadCancelRef.current = true
    setPreparingAudio(false)
  }

  // Auto-save progress after each step (skip idx=0 — nothing to resume from start)
  useEffect(() => {
    if (!sessionId || steps.length === 0 || done || currentIdx === 0) return
    const save: SessionSave = { steps, currentIdx, correct, wrong, savedAt: Date.now() }
    try { sessionStorage.setItem(getSaveKey(sessionId), JSON.stringify(save)) }
    catch { /* storage quota */ }
  }, [currentIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear save when session is fully completed
  useEffect(() => {
    if (done && sessionId) sessionStorage.removeItem(getSaveKey(sessionId))
  }, [done, sessionId])

  const goNext = useCallback(() => {
    setCurrentIdx(i => i + 1)
    setStepKey(k => k + 1)
  }, [])

  const trackWord = useCallback((zh: string | undefined, ok: boolean) => {
    if (!zh) return
    const r = resultsRef.current[zh] ?? (resultsRef.current[zh] = { correct: 0, wrong: 0 })
    if (ok) r.correct++
    else r.wrong++
  }, [])

  /**
   * Graded-step answer handler.
   * - First attempt counts toward score/combo and the per-word SRS tally.
   * - A wrong answer re-queues a copy of the step (flagged retry) at the end
   *   of the session — the word must eventually be answered correctly.
   * - Retry attempts never touch the score.
   */
  const handleAnswer = useCallback((step: Step, ok: boolean) => {
    playFeedback(ok)
    const gradable = step.kind === 'mcq' || step.kind === 'fill' || step.kind === 'listen'
    const isRetry = gradable && step.retry === true
    if (!isRetry) {
      if (ok) {
        setCorrect(c => c + 1)
        setCombo(c => c + 1)
      } else {
        setWrong(w => w + 1)
        setCombo(0)
      }
      const zh = step.kind === 'mcq' ? step.wordZh : step.kind === 'listen' ? step.zh : undefined
      trackWord(zh, ok)
    }
    if (!ok && gradable) {
      setSteps(prev => [...prev, reshuffledRetry(step)])
    }
    goNext()
  }, [goNext, trackWord])

  // Match pairs count toward score/combo without ending the step
  const onMatchHit = useCallback((zh: string) => {
    playFeedback(true)
    setCorrect(c => c + 1)
    setCombo(c => c + 1)
    trackWord(zh, true)
  }, [trackWord])

  const onMatchMiss = useCallback((zh: string) => {
    playFeedback(false)
    setWrong(w => w + 1)
    setCombo(0)
    trackWord(zh, false)
  }, [trackWord])

  // Session complete
  useEffect(() => {
    if (steps.length > 0 && currentIdx >= steps.length && !done) {
      finishSession()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, steps.length, done])

  const finishSession = async () => {
    if (!sessionId) return
    // Run exactly once per session run — the completion effect can fire twice
    // (React StrictMode dev double-invoke, or steps.length changing on the last
    // step). A double run would submit XP twice AND race the GIF fetch to null.
    if (finishedRef.current) return
    finishedRef.current = true
    const found = getSession(sessionId)
    if (!found) return
    const { session, unit } = found

    const total = correct + wrong
    const score = total > 0 ? Math.round((correct / total) * 100) : 100

    // ── Show completion screen IMMEDIATELY (optimistic) ───────────────────────
    // Don't wait for the API — user sees stars + score instantly.
    // XP banner will pop in once the backend responds.
    setDone(true)
    sessionStorage.setItem('lp-cache-invalid', '1')

    // Meme booster — celebratory when passing, motivational otherwise.
    // (No setFunGif(null) here — loadFunGif's request-id guard handles staleness;
    // clearing first would let a duplicate finishSession wipe an already-loaded GIF.)
    loadFunGif(score >= 70 ? 'celebrate' : 'motivate')

    // Feed per-word results into SRS (fire-and-forget): a word answered
    // wrong at least once this session schedules an earlier review (SM-2 q=2)
    const resultEntries = Object.entries(resultsRef.current)
    if (resultEntries.length > 0) {
      learningApi.recordCourseResults(
        resultEntries.map(([zh, r]) => ({ zh, correct: r.wrong === 0 }))
      ).catch(() => { /* non-critical */ })
    }

    // Compute next-session navigation synchronously (no API needed)
    const currentSessionIdx = unit.sessions.findIndex(s => s.id === session.id)
    const nextInUnit = unit.sessions[currentSessionIdx + 1]
    if (nextInUnit) {
      setNextSessionId(nextInUnit.id)
      setIsLastInUnit(false)
      setNextUnitInfo(null)
    } else {
      setIsLastInUnit(true)
      const unlockedUnits = ALL_UNITS.filter(u => !u.locked)
      const currentUnitIdx = unlockedUnits.findIndex(u => u.id === unit.id)
      const nextUnit = unlockedUnits[currentUnitIdx + 1]
      if (nextUnit) {
        setNextSessionId(nextUnit.sessions[0]?.id ?? null)
        setNextUnitInfo({ title: nextUnit.title, subtitle: nextUnit.subtitle, emoji: nextUnit.emoji })
      } else {
        setNextSessionId(null)
      }
    }

    // ── Save to backend in background ─────────────────────────────────────────
    // Spinner shows on the completion screen while saving; XP pops in on resolve.
    // Retries once after 5 s to handle Koyeb cold-start / transient network blips.
    setSaving(true)
    try {
      const payload = {
        session_id: session.id,
        unit_id: unit.id,
        hsk_level: unit.hsk_level,
        score,
        base_xp: session.xp, // curriculum XP (20–35) — backend clamps; keeps UI honest
      }
      let res = null
      let lastErr: unknown
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 5000))
        try {
          res = await learningPathApi.completeSession(payload)
          break
        } catch (err) {
          lastErr = err
        }
      }
      if (!res) throw lastErr
      setXpEarned(res.xp_earned)
      setIsNew(res.is_new)
      // Seed vocab words into SRS so they appear in Review tomorrow
      if (session.words && session.words.length > 0) {
        learningApi.seedWords(session.words.map(w => w.zh)).catch(() => {})
      }
    } catch {
      toast.error(t('session.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (noContent) {
    return (
      <div className="max-w-md mx-auto px-4 pb-16 pt-16 text-center space-y-4">
        <p className="text-4xl">🔒</p>
        <p className="text-gray-700 dark:text-gray-300 font-semibold">{t('session.noContent')}</p>
        <button
          onClick={() => navigate('/path')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('session.backToCourse')}
        </button>
      </div>
    )
  }

  // ── Audio preload screen ── (steps are ready; audio is warming up)
  if (preparingAudio) {
    const meta = getSession(sessionId ?? '')
    return (
      <div className="max-w-md mx-auto px-4 pb-16 min-h-[70vh] flex flex-col items-center justify-center text-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center"
        >
          <Volume2 className="w-9 h-9 text-primary-500 animate-pulse" />
        </motion.div>
        <div>
          <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50">{t('session.preparingTitle')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">{t('session.preparingSub')}</p>
          {meta?.session?.title && (
            <p className="text-xs text-primary-500 font-bold uppercase tracking-widest mt-3">{meta.session.title}</p>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              animate={{ width: `${preloadPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{preloadPct}%</p>
        </div>
        <button
          onClick={skipPreload}
          className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {t('session.skipWait')}
        </button>
      </div>
    )
  }

  if (!sessionId || steps.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pb-16">
        {/* Progress bar header */}
        <div className="flex items-center gap-3 py-4">
          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          <Skeleton className="flex-1 h-3 rounded-full" />
          <Skeleton className="w-10 h-3 rounded" />
        </div>
        {/* Session label */}
        <Skeleton className="h-3 w-48 mx-auto mb-6 rounded-full" />

        {/* Intro-style card skeleton (most common first step) */}
        <div className="flex flex-col items-center gap-5 py-6">
          {/* Audio button */}
          <Skeleton className="w-16 h-16 rounded-2xl" />
          {/* Big character */}
          <Skeleton className="h-24 w-28 rounded-2xl" />
          {/* Pinyin */}
          <Skeleton className="h-5 w-24 rounded" />
          {/* English */}
          <Skeleton className="h-6 w-32 rounded" />
          {/* Note */}
          <Skeleton className="h-4 w-48 rounded" />
          {/* Continue button */}
          <Skeleton className="h-12 w-full max-w-xs rounded-xl mt-2" />
        </div>
      </div>
    )
  }

  const found = getSession(sessionId)
  const sessionMeta = found?.session
  const unitMeta = found?.unit

  // ── Completion screen ──
  if (done) {
    const total = correct + wrong
    const score = total > 0 ? Math.round((correct / total) * 100) : 100
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1

    return (
      <div className="max-w-md mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 pt-10"
        >
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map(n => (
              <motion.div
                key={n}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: n <= stars ? 1 : 0.4, rotate: 0, opacity: n <= stars ? 1 : 0.2 }}
                transition={{ delay: n * 0.15, type: 'spring', stiffness: 300, damping: 18 }}
              >
                <Star className={`w-12 h-12 ${n <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              </motion.div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
              {score >= 90 ? t('session.perfect') : score >= 70 ? t('session.good') : t('session.done')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{sessionMeta?.title}</p>
          </div>

          {/* Meme booster (Giphy) — only renders when the backend has a key.
              "Powered by GIPHY" attribution is required by GIPHY's API terms. */}
          {funGif && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                <img
                  src={funGif}
                  alt="celebration gif"
                  loading="lazy"
                  className="mx-auto rounded-2xl max-h-48 shadow-md"
                />
                {loadingGif && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between w-full max-w-[240px]">
                <GiphyAttribution />
                <button
                  onClick={() => loadFunGif(gifMoodRef.current)}
                  disabled={loadingGif}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGif ? 'animate-spin' : ''}`} />
                  {t('session.anotherMeme')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('session.score'),   value: `${score}%`,   color: score >= 70 ? 'text-success-600 dark:text-success-400' : 'text-orange-600 dark:text-orange-400' },
              { label: t('session.correct'), value: correct,         color: 'text-success-600 dark:text-success-400' },
              { label: t('session.wrong'),   value: wrong,           color: wrong > 0 ? 'text-error-500' : 'text-gray-500 dark:text-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 dark:bg-surface-card rounded-2xl p-3 text-center">
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* XP */}
          {isNew && xpEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl py-3 px-4"
            >
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700 dark:text-amber-400">{t('session.xpEarned', { xp: xpEarned })}</span>
            </motion.div>
          )}
          {!isNew && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('session.noRepeatXp')}</p>
          )}

          {saving && <Loader2 className="w-5 h-5 animate-spin text-primary-500 mx-auto" />}

          {/* ── Unit-complete banner (shown only when last session of unit) ── */}
          {isLastInUnit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 text-center"
            >
              <span className="text-2xl">🎊</span>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mt-1">{t('session.unitComplete')}</p>
              {nextUnitInfo && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  {t('session.nextUp', { emoji: nextUnitInfo.emoji, title: nextUnitInfo.title, subtitle: nextUnitInfo.subtitle })}
                </p>
              )}
            </motion.div>
          )}

          <div className="flex flex-col gap-2">
            {/* Primary CTA: next session (if available) */}
            {nextSessionId ? (
              <button
                onClick={() => navigate(`/path/session/${nextSessionId}`)}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                {isLastInUnit && nextUnitInfo
                  ? t('session.startUnit', { title: nextUnitInfo.title })
                  : t('session.nextSession')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/path')}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Trophy className="w-4 h-4" /> {t('session.viewAllCourses')}
              </button>
            )}

            {/* Secondary: back to course list */}
            {nextSessionId && (
              <button
                onClick={() => navigate('/path')}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                {t('session.backToCourse')}
              </button>
            )}

            {/* Tertiary: replay */}
            <button
              onClick={() => {
                if (sessionId) sessionStorage.removeItem(getSaveKey(sessionId))
                // Drop retry copies appended during the previous run
                setSteps(prev => prev.filter(s => !('retry' in s && s.retry)))
                resultsRef.current = {}
                setCombo(0)
                finishedRef.current = false
                setFunGif(null)
                setCurrentIdx(0); setCorrect(0); setWrong(0); setDone(false); setStepKey(k => k + 1)
              }}
              className="w-full py-2.5 text-gray-500 dark:text-gray-400 font-medium rounded-xl hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
            >
              {t('session.replay')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Active session ──
  const progress = steps.length > 0 ? (currentIdx / steps.length) * 100 : 0
  const step = steps[currentIdx]

  return (
    <div className="max-w-md mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => navigate('/path')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        {/* Progress bar */}
        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {/* Combo meter — momentum feedback for consecutive correct answers */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.span
              key={combo}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="text-xs font-extrabold text-amber-500 whitespace-nowrap"
            >
              🔥{combo}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-10 text-right">
          {currentIdx}/{steps.length}
        </span>
      </div>

      <div className="text-xs text-primary-500 font-bold uppercase tracking-widest text-center mb-4">
        {unitMeta?.subtitle} · {sessionMeta?.title}
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        <div key={stepKey}>
          {step?.kind === 'intro'   && (
            <IntroCard
              step={step}
              onNext={goNext}
              imageUrl={wordImages[step.word.zh]}
              example={step.word.example ?? (unitMeta ? findContextExample(step.word, unitMeta) : null)}
            />
          )}
          {step?.kind === 'grammar' && <GrammarCard step={step} onNext={goNext} />}
          {step?.kind === 'mcq'     && <MCQCard     step={step} onCorrect={() => handleAnswer(step, true)} onWrong={() => handleAnswer(step, false)} />}
          {step?.kind === 'listen'  && <ListenCard  step={step} onCorrect={() => handleAnswer(step, true)} onWrong={() => handleAnswer(step, false)} />}
          {step?.kind === 'match'   && <MatchCard   step={step} onNext={goNext} onHit={onMatchHit} onMiss={onMatchMiss} />}
          {step?.kind === 'fill'    && <FillCard    step={step} onCorrect={() => handleAnswer(step, true)} onWrong={() => handleAnswer(step, false)} />}
        </div>
      </AnimatePresence>
    </div>
  )
}


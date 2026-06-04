import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getSession, getUnitWords, Word, GrammarPoint, FillBlank } from '@/data/curriculum'
import { learningPathApi } from '@/services/api'
import { playTTS } from '@/utils/ttsHelper'
import { getVoiceName } from '@/utils/voicePreference'
import {
  Volume2, ChevronRight, CheckCircle, X, Star, Zap,
  ArrowLeft, Loader2, Trophy,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Step types ────────────────────────────────────────────────────────────────

type StepIntro = { kind: 'intro'; word: Word }
type StepGrammar = { kind: 'grammar'; point: GrammarPoint }
type StepMCQ = { kind: 'mcq'; question: string; promptZh?: string; options: string[]; correct: number }
type StepMatch = { kind: 'match'; pairs: { zh: string; en: string }[] }
type StepFill = { kind: 'fill'; fb: FillBlank }
type Step = StepIntro | StepGrammar | StepMCQ | StepMatch | StepFill

// ── Exercise generation ────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function mcqFromWord(word: Word, pool: Word[], askMeaning = true): StepMCQ {
  const distractors = shuffle(pool.filter(w => w.zh !== word.zh)).slice(0, 3)
  if (askMeaning) {
    const opts = shuffle([word.en, ...distractors.map(d => d.en)])
    return { kind: 'mcq', question: `What does "${word.zh}" mean?`, promptZh: word.zh, options: opts, correct: opts.indexOf(word.en) }
  } else {
    const opts = shuffle([word.zh, ...distractors.map(d => d.zh)])
    return { kind: 'mcq', question: `Which character means "${word.en}"?`, options: opts, correct: opts.indexOf(word.zh) }
  }
}

function generateSteps(
  type: string,
  words?: Word[],
  grammarPoints?: GrammarPoint[],
  practicePool?: Word[],
): Step[] {
  const steps: Step[] = []

  if (type === 'vocab' && words && words.length > 0) {
    const batchSize = 4
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize)
      batch.forEach(w => steps.push({ kind: 'intro', word: w }))
      // Test first 2 in batch
      batch.slice(0, 2).forEach((w, idx) =>
        steps.push(mcqFromWord(w, words, idx % 2 === 0))
      )
    }
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
    const pool = shuffle(practicePool)
    pool.slice(0, Math.min(8, pool.length)).forEach((w, idx) =>
      steps.push(mcqFromWord(w, practicePool, idx % 2 === 0))
    )
    const matchWords = shuffle(practicePool).slice(0, Math.min(5, practicePool.length))
    steps.push({ kind: 'match', pairs: matchWords.map(w => ({ zh: w.zh, en: w.en })) })
  }

  return steps
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IntroCard({ step, onNext }: { step: StepIntro; onNext: () => void }) {
  const [playing, setPlaying] = useState(false)

  const play = async () => {
    setPlaying(true)
    try { await playTTS(step.word.zh, getVoiceName()) } catch { /* silent */ }
    setPlaying(false)
  }

  return (
    <motion.div key={step.word.zh} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center gap-5 py-6"
    >
      <button onClick={play} disabled={playing}
        className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center hover:bg-indigo-100 transition-colors disabled:opacity-60"
      >
        {playing ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Volume2 className="w-5 h-5 text-indigo-500" />}
      </button>

      <div>
        <p className="font-chinese text-7xl font-bold text-gray-900 dark:text-gray-50">{step.word.zh}</p>
        <p className="text-indigo-500 text-lg mt-2">{step.word.py}</p>
        <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold mt-1">{step.word.en}</p>
        {step.word.note && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-xs mx-auto italic">{step.word.note}</p>
        )}
      </div>

      <button onClick={onNext}
        className="mt-2 w-full max-w-xs py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

function GrammarCard({ step, onNext }: { step: StepGrammar; onNext: () => void }) {
  const gp = step.point
  return (
    <motion.div key={gp.pattern} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center">
        <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Grammar</span>
        <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50 mt-1">{gp.pattern}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{gp.explanation}</p>
      </div>

      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-4 space-y-3">
        {gp.examples.map((ex, i) => (
          <div key={i} className="border-b border-violet-100 dark:border-violet-900/40 last:border-0 pb-2 last:pb-0">
            <p className="font-chinese text-xl text-gray-800 dark:text-gray-200">{ex.zh}</p>
            <p className="text-xs text-violet-500">{ex.py}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{ex.en}</p>
          </div>
        ))}
      </div>

      <button onClick={onNext}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        Got it! <ChevronRight className="w-4 h-4" />
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
          let cls = 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
          if (isSelected && isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
          else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
          else if (selected !== null && isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'

          return (
            <button key={i} onClick={() => pick(i)}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-between transition-all ${cls}`}
            >
              <span className="font-chinese text-lg">{opt}</span>
              {selected !== null && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              {isSelected && !isCorrect && <X className="w-4 h-4 text-red-500" />}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function MatchCard({ step, onNext }: { step: StepMatch; onNext: () => void }) {
  const [leftSel, setLeftSel] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [flash, setFlash] = useState<string | null>(null)

  const leftItems = step.pairs.map(p => p.zh)
  const rightItems = shuffle(step.pairs.map(p => p.en))

  const pickRight = (en: string) => {
    if (!leftSel) return
    const correctPair = step.pairs.find(p => p.zh === leftSel)
    if (correctPair?.en === en) {
      const next = new Set(matched)
      next.add(leftSel); next.add(en)
      setMatched(next)
      setLeftSel(null)
      if (next.size >= step.pairs.length * 2) setTimeout(onNext, 600)
    } else {
      setFlash(leftSel)
      setTimeout(() => { setFlash(null); setLeftSel(null) }, 600)
    }
  }

  const btnCls = (val: string, side: 'l' | 'r') => {
    const zhKey = side === 'l' ? val : step.pairs.find(p => p.en === val)?.zh ?? ''
    const enKey = side === 'r' ? val : step.pairs.find(p => p.zh === val)?.en ?? ''
    if (matched.has(val)) return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-60'
    if (flash === zhKey || flash === enKey) return 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600'
    if (side === 'l' && leftSel === val) return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
    return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
  }

  return (
    <motion.div key="match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
        Tap a character, then tap its English meaning.
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
        <p className="text-center text-xs text-gray-400">
          {matched.size / 2} / {step.pairs.length} matched
        </p>
      )}
    </motion.div>
  )
}

function FillCard({ step, onCorrect, onWrong }: { step: StepFill; onCorrect: () => void; onWrong: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const fb = step.fb

  const pick = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === fb.correct) setTimeout(onCorrect, 900)
    else setTimeout(onWrong, 900)
  }

  const highlighted = fb.sentence_zh.replace('___', '＿＿＿')

  return (
    <motion.div key={fb.sentence_zh} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 text-center space-y-1">
        <p className="font-chinese text-2xl font-bold text-gray-900 dark:text-gray-100">{highlighted}</p>
        <p className="text-xs text-gray-400 italic">{fb.sentence_en}</p>
      </div>
      <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400">Choose the correct word:</p>
      <div className="grid grid-cols-2 gap-2">
        {fb.options.map((opt, i) => {
          const isSel = selected === i
          const isCorr = i === fb.correct
          let cls = 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
          if (isSel && isCorr) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700'
          else if (isSel && !isCorr) cls = 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700'
          else if (selected !== null && isCorr) cls = 'border-emerald-500 bg-emerald-50 text-emerald-700'
          return (
            <button key={i} onClick={() => pick(i)}
              className={`py-3 rounded-xl font-chinese text-xl font-bold transition-all ${cls}`}
            >{opt}</button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Main Session Player ───────────────────────────────────────────────────────

export default function LearningSession() {
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

  useEffect(() => {
    if (!sessionId) return
    const found = getSession(sessionId)
    if (!found) return

    const { session, unit } = found
    const practicePool = getUnitWords(unit.id)
    const generated = generateSteps(session.type, session.words, session.grammarPoints, practicePool)
    setSteps(generated)
  }, [sessionId])

  const goNext = useCallback(() => {
    setCurrentIdx(i => i + 1)
    setStepKey(k => k + 1)
  }, [])

  const onCorrect = useCallback(() => {
    setCorrect(c => c + 1)
    goNext()
  }, [goNext])

  const onWrong = useCallback(() => {
    setWrong(w => w + 1)
    goNext()
  }, [goNext])

  // Session complete
  useEffect(() => {
    if (steps.length > 0 && currentIdx >= steps.length && !done) {
      finishSession()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, steps.length, done])

  const finishSession = async () => {
    if (!sessionId) return
    const found = getSession(sessionId)
    if (!found) return
    const { session, unit } = found

    const total = correct + wrong
    const score = total > 0 ? Math.round((correct / total) * 100) : 100

    setSaving(true)
    try {
      const res = await learningPathApi.completeSession({
        session_id: session.id,
        unit_id: unit.id,
        hsk_level: unit.hsk_level,
        score,
      })
      setXpEarned(res.xp_earned)
      setIsNew(res.is_new)
    } catch {
      toast.error('Gagal menyimpan progress')
    } finally {
      setSaving(false)
      setDone(true)
    }
  }

  if (!sessionId || steps.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
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
              {score >= 90 ? 'Sempurna! 🎉' : score >= 70 ? 'Bagus! 👍' : 'Selesai! 💪'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{sessionMeta?.title}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Skor',   value: `${score}%`,   color: score >= 70 ? 'text-emerald-600' : 'text-orange-600' },
              { label: 'Benar', value: correct,         color: 'text-emerald-600' },
              { label: 'Salah', value: wrong,           color: wrong > 0 ? 'text-red-500' : 'text-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
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
              <span className="font-bold text-amber-700 dark:text-amber-400">+{xpEarned} XP earned!</span>
            </motion.div>
          )}
          {!isNew && (
            <p className="text-xs text-gray-400">Session reviewed — no extra XP for repeats.</p>
          )}

          {saving && <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />}

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/path')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Trophy className="w-4 h-4" /> Kembali ke Kursus
            </button>
            <button
              onClick={() => { setCurrentIdx(0); setCorrect(0); setWrong(0); setDone(false); setStepKey(k => k + 1) }}
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Ulangi Sesi
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
            className="h-full bg-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-gray-400 font-medium w-10 text-right">
          {currentIdx}/{steps.length}
        </span>
      </div>

      <div className="text-xs text-indigo-500 font-bold uppercase tracking-widest text-center mb-4">
        {unitMeta?.subtitle} · {sessionMeta?.title}
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        <div key={stepKey}>
          {step?.kind === 'intro'   && <IntroCard   step={step} onNext={goNext} />}
          {step?.kind === 'grammar' && <GrammarCard step={step} onNext={goNext} />}
          {step?.kind === 'mcq'     && <MCQCard     step={step} onCorrect={onCorrect} onWrong={onWrong} />}
          {step?.kind === 'match'   && <MatchCard   step={step} onNext={goNext} />}
          {step?.kind === 'fill'    && <FillCard    step={step} onCorrect={onCorrect} onWrong={onWrong} />}
        </div>
      </AnimatePresence>
    </div>
  )
}

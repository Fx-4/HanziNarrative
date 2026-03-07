import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useBattleWebSocket, PlayerInfo } from '@/hooks/useBattleWebSocket'
import { toast } from 'react-hot-toast'
import {
  Swords, Users, Copy, Check, Crown, Heart, Trophy,
  Shield, Zap, LogOut, Play, ArrowRight, Star, X,
  BookOpen, Timer, Flame
} from 'lucide-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function authHeaders() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function Hearts({ lives, max = 3 }: { lives: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Heart
          key={i}
          className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

function Avatar({ player, size = 'md' }: { player: PlayerInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  return player.profile_picture ? (
    <img src={player.profile_picture} alt={player.username}
      className={`${sz} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`} />
  ) : (
    <div className={`${sz} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-800`}>
      {player.username[0].toUpperCase()}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TeamBadge({ team }: { team: 'A' | 'B' | null }) {
  if (!team) return null
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      team === 'A' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
    }`}>
      Team {team}
    </span>
  )
}

// ── HOME VIEW ────────────────────────────────────────────────────────────────
function HomeView({ onCreated, onJoined }: {
  onCreated: (code: string) => void
  onJoined: (code: string) => void
}) {
  const [mode, setMode] = useState<'battle_royale' | 'team_vs_team'>('battle_royale')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await axios.post(`${API}/battle/rooms`, { mode }, { headers: authHeaders() })
      onCreated(res.data.room_code)
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) { toast.error('Enter a 6-character room code'); return }
    onJoined(code)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Battle Arena</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">Compete in real-time HSK vocabulary battles</p>
      </div>

      {/* Mode selector */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Game Mode</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {([
            { value: 'battle_royale', label: 'Battle Royale', desc: 'Last one standing wins', icon: Swords, color: 'indigo' },
            { value: 'team_vs_team',  label: 'Team vs Team',  desc: 'Compete as a team',    icon: Users,  color: 'rose' },
          ] as const).map(({ value, label, desc, icon: Icon, color }) => (
            <button key={value} onClick={() => setMode(value)}
              className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                mode === value
                  ? color === 'indigo'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                    : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1.5 sm:mb-2 ${mode === value ? (color === 'indigo' ? 'text-indigo-600' : 'text-rose-500') : 'text-gray-400'}`} />
              <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        <button onClick={handleCreate} disabled={creating}
          className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-indigo-500/25 text-sm sm:text-base">
          {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
          Create Room
        </button>
      </div>

      {/* Join existing room */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Join a Room</p>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC123"
            className="flex-1 px-3 sm:px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-lg sm:text-xl font-mono font-bold tracking-widest bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-400 uppercase"
          />
          <button onClick={handleJoin}
            className="px-3 sm:px-5 bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl transition-all flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base">
            Join <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── LOBBY VIEW ───────────────────────────────────────────────────────────────
function LobbyView({
  gameState, currentUserId, sendMessage, onLeave
}: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number
  sendMessage: (m: Record<string, unknown>) => void
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [hskLevel, setHskLevel] = useState(1)
  const [numQ, setNumQ] = useState(10)
  const [timeLimitSec, setTimeLimitSec] = useState(15)
  const [startingLives, setStartingLivesLocal] = useState(3)
  const [qType, setQType] = useState<'mixed' | 'char_to_meaning' | 'meaning_to_char' | 'pinyin'>('mixed')
  const isHost = currentUserId === gameState.hostId

  const copyCode = async () => {
    const code = gameState.roomCode ?? ''
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback for HTTP / restricted contexts
      const el = document.createElement('textarea')
      el.value = code
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startGame = () => {
    sendMessage({
      type: 'start_game',
      hsk_level: hskLevel,
      num_questions: numQ,
      time_limit: timeLimitSec,
      lives: startingLives,
      question_type: qType,
    })
  }

  const assignTeam = (userId: number, team: 'A' | 'B') => {
    sendMessage({ type: 'assign_team', user_id: userId, team })
  }

  const kick = (userId: number) => {
    sendMessage({ type: 'kick', user_id: userId })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-3 sm:space-y-5">

      {/* Room code card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-2 sm:gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Room Code</p>
            <p className="text-2xl sm:text-4xl font-black tracking-widest text-indigo-600 dark:text-indigo-400 font-mono">
              {gameState.roomCode}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
              gameState.mode === 'battle_royale'
                ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
            }`}>
              {gameState.mode === 'battle_royale' ? '⚔️ Battle Royale' : '🤝 Team vs Team'}
            </span>
            <button onClick={copyCode}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-all">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
            Players ({gameState.players.length}/{gameState.mode === 'battle_royale' ? 5 : 6})
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Waiting…</p>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {gameState.players.map(p => (
            <div key={p.user_id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Avatar player={p} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
                  {p.user_id === gameState.hostId && (
                    <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500 flex-shrink-0" />
                  )}
                  <TeamBadge team={p.team} />
                </div>
              </div>

              {/* Team assign buttons (host + team mode) */}
              {isHost && gameState.mode === 'team_vs_team' && (
                <div className="flex gap-1">
                  <button onClick={() => assignTeam(p.user_id, 'A')}
                    className={`text-xs px-1.5 sm:px-2 py-1 rounded-lg font-semibold transition-all min-w-[28px] ${
                      p.team === 'A' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}>A</button>
                  <button onClick={() => assignTeam(p.user_id, 'B')}
                    className={`text-xs px-1.5 sm:px-2 py-1 rounded-lg font-semibold transition-all min-w-[28px] ${
                      p.team === 'B' ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                    }`}>B</button>
                </div>
              )}

              {/* Kick button */}
              {isHost && p.user_id !== currentUserId && (
                <button onClick={() => kick(p.user_id)}
                  className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all">
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>
          ))}

          {gameState.players.length === 0 && (
            <p className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">No players yet</p>
          )}
        </div>
      </div>

      {/* Game settings (host only) */}
      {isHost && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5 space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Game Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* HSK Level */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">HSK Level</label>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {[1,2,3,4,5,6].map(l => (
                  <button key={l} onClick={() => setHskLevel(l)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      hskLevel === l ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>{l}</button>
                ))}
              </div>
            </div>

            {/* Questions count */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Questions</label>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {[5,10,15,20].map(n => (
                  <button key={n} onClick={() => setNumQ(n)}
                    className={`px-3 h-9 rounded-xl text-sm font-semibold transition-all ${
                      numQ === n ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>{n}</button>
                ))}
              </div>
            </div>

            {/* Time per question */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Timer className="w-3 h-3" /> Time per Question
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {[10,15,20,30].map(s => (
                  <button key={s} onClick={() => setTimeLimitSec(s)}
                    className={`px-3 h-9 rounded-xl text-sm font-semibold transition-all ${
                      timeLimitSec === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>{s}s</button>
                ))}
              </div>
            </div>

            {/* Lives (BR only) */}
            {gameState.mode === 'battle_royale' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Lives
                </label>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {[1,2,3].map(n => (
                    <button key={n} onClick={() => setStartingLivesLocal(n)}
                      className={`px-3 h-9 rounded-xl text-sm font-semibold transition-all ${
                        startingLives === n ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}>
                      {'❤️'.repeat(n)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Question type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Question Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { value: 'mixed',           label: '🔀 Mixed',        desc: 'All types' },
                { value: 'char_to_meaning', label: '汉 → 🇬🇧',         desc: 'Char to meaning' },
                { value: 'meaning_to_char', label: '🇬🇧 → 汉',         desc: 'Meaning to char' },
                { value: 'pinyin',          label: '汉 → pīnyīn',     desc: 'Char to pinyin' },
              ] as const).map(({ value, label, desc }) => (
                <button key={value} onClick={() => setQType(value)}
                  className={`p-2 rounded-xl text-center transition-all border-2 ${
                    qType === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} disabled={gameState.players.length < 2}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-indigo-500/25 text-sm sm:text-base">
            <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Battle {gameState.players.length < 2 && '(need 2+ players)'}
          </button>
        </div>
      )}

      <button onClick={onLeave}
        className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-500 transition-all font-medium text-sm sm:text-base">
        <LogOut className="w-4 h-4" /> Leave Room
      </button>

      {gameState.error && (
        <p className="text-center text-sm text-red-500">{gameState.error}</p>
      )}
    </motion.div>
  )
}

// ── COUNTDOWN VIEW ───────────────────────────────────────────────────────────
function CountdownView({ seconds }: { seconds: number | null }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <AnimatePresence mode="wait">
        <motion.div key={seconds}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center">
          <p className="text-7xl sm:text-8xl md:text-9xl font-black text-indigo-600 dark:text-indigo-400">{seconds}</p>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400">Get ready!</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── QUESTION VIEW ────────────────────────────────────────────────────────────
function QuestionView({
  gameState, currentUserId, sendMessage
}: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number
  sendMessage: (m: Record<string, unknown>) => void
}) {
  const maxLives = gameState.startingLives
  const q = gameState.currentQuestion
  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(q?.time_limit ?? 15)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const me = gameState.players.find(p => p.user_id === currentUserId)

  // Reset when new question arrives
  useEffect(() => {
    setSelected(null)
    setTimeLeft(q?.time_limit ?? 15)
  }, [q?.index, q?.time_limit])

  // Countdown timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [q?.index])

  const handleAnswer = (idx: number) => {
    if (selected !== null || me?.eliminated) return
    setSelected(idx)
    sendMessage({ type: 'answer', answer_index: idx })
  }

  if (!q) return null
  const timerPct = (timeLeft / (q.time_limit)) * 100

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-3 sm:space-y-4">

      {/* Top bar: progress + timer */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
          <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
            Q{q.index}/{q.total}
          </span>
          <div className={`flex items-center gap-1 sm:gap-1.5 font-bold text-base sm:text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
            {timeLeft <= 5 && <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />}
            {timeLeft}s
          </div>
        </div>
        {/* Timer bar */}
        <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
            animate={{ width: `${timerPct}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
      </div>

      {/* Players mini-bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {gameState.players.map(p => (
          <div key={p.user_id}
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-xl border ${
              p.eliminated ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 opacity-50'
              : p.user_id === currentUserId ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-700'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}>
            <Avatar player={p} size="sm" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 leading-none">{p.username}</p>
              {gameState.mode === 'battle_royale' ? (
                <Hearts lives={p.lives} max={maxLives} />
              ) : (
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{p.score}p</p>
              )}
            </div>
            {gameState.answeredUserIds.includes(p.user_id) && !p.eliminated && (
              <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* My lives/score */}
      {me && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
            {gameState.mode === 'battle_royale' ? (
              <Hearts lives={me.lives} max={maxLives} />
            ) : (
              <TeamBadge team={me.team} />
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">{me.score} pts</span>
          </div>
        </div>
      )}

      {/* Question card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        {q.question_type === 'character_match' ? (
          <>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 text-center uppercase tracking-wide">What is the meaning?</p>
            <div className="text-center mb-4 sm:mb-5">
              <p className="text-6xl sm:text-7xl md:text-8xl font-bold font-chinese text-gray-900 dark:text-gray-100 leading-none">{q.chinese}</p>
              <p className="text-indigo-500 text-base sm:text-lg mt-1.5 sm:mt-2">{q.pinyin}</p>
            </div>
          </>
        ) : q.question_type === 'pinyin_match' ? (
          <>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 text-center uppercase tracking-wide">Which pronunciation?</p>
            <div className="text-center mb-4 sm:mb-5">
              <p className="text-6xl sm:text-7xl md:text-8xl font-bold font-chinese text-gray-900 dark:text-gray-100 leading-none">{q.chinese}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1.5 italic">{q.english}</p>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 text-center uppercase tracking-wide">Which character means…</p>
            <div className="text-center mb-4 sm:mb-5">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">"{q.english}"</p>
            </div>
          </>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx
            const isDisabled = selected !== null || me?.eliminated

            return (
              <motion.button key={idx}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(idx)}
                disabled={!!isDisabled}
                className={`p-2.5 sm:p-3 md:p-4 rounded-xl border-2 font-medium text-center transition-all min-h-[52px] sm:min-h-[60px] ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 ring-2 ring-indigo-300 dark:ring-indigo-700'
                    : isDisabled
                    ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
                } ${
                  q.question_type === 'multiple_choice' ? 'font-chinese text-xl sm:text-2xl md:text-3xl'
                  : q.question_type === 'pinyin_match' ? 'text-sm sm:text-base tracking-wide'
                  : 'text-xs sm:text-sm md:text-base'
                }`}>
                {opt}
              </motion.button>
            )
          })}
        </div>

        {selected !== null && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 animate-pulse">
            Waiting for others…
          </p>
        )}
        {me?.eliminated && (
          <p className="text-center text-sm text-red-500 mt-3 font-semibold">
            ☠️ You've been eliminated — watching as spectator
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── REVEAL VIEW ──────────────────────────────────────────────────────────────
function RevealView({
  gameState, currentUserId
}: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number
}) {
  const reveal = gameState.revealData
  const q = gameState.currentQuestion
  const maxLives = gameState.startingLives
  if (!reveal || !q) return null

  const me = reveal.players.find(p => p.user_id === currentUserId)
  const myResult = me?.result

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-3 sm:space-y-4">

      {/* Result banner for current player */}
      {myResult && (
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`rounded-2xl p-3 sm:p-4 text-center font-bold text-base sm:text-lg ${
            myResult === 'correct'
              ? 'bg-emerald-500 text-white'
              : myResult === 'wrong'
              ? 'bg-red-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
          {myResult === 'correct' ? '✅ Correct! +10 pts'
            : myResult === 'wrong' ? `❌ Wrong! ${gameState.mode === 'battle_royale' ? '-1 life' : 'no points'}`
            : '☠️ Eliminated'}
        </motion.div>
      )}

      {/* Correct answer */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-emerald-300 dark:border-emerald-700 p-4 sm:p-5 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 sm:mb-2">Correct Answer</p>

        {/* Main answer text */}
        <p className={`font-bold text-emerald-700 dark:text-emerald-400 ${
          q.question_type === 'multiple_choice' ? 'text-3xl sm:text-4xl font-chinese'
          : q.question_type === 'pinyin_match' ? 'text-2xl sm:text-3xl tracking-wide'
          : 'text-xl sm:text-2xl'
        }`}>
          {reveal.correctText}
        </p>

        {/* Supporting info based on question type */}
        {q.question_type === 'character_match' && (
          <p className="text-2xl sm:text-3xl font-chinese text-gray-700 dark:text-gray-300 mt-1">{q.chinese}</p>
        )}
        {q.question_type === 'pinyin_match' && (
          <p className="text-3xl sm:text-4xl font-chinese text-gray-700 dark:text-gray-300 mt-1">{q.chinese}</p>
        )}
        {q.question_type !== 'pinyin_match' && (
          <p className="text-indigo-500 mt-1 text-sm sm:text-base">{q.pinyin}</p>
        )}
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          {q.question_type === 'character_match' ? q.english
            : q.question_type === 'multiple_choice' ? q.english
            : `${q.english} · HSK ${q.hsk_level}`}
        </p>
      </div>

      {/* Player results */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 text-xs sm:text-sm">Round Results</h3>
        <div className="space-y-1.5 sm:space-y-2">
          {reveal.players.map(p => (
            <div key={p.user_id}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl ${
                p.result === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20'
                : p.result === 'wrong' ? 'bg-red-50 dark:bg-red-950/20'
                : 'bg-gray-50 dark:bg-gray-800 opacity-50'
              }`}>
              <Avatar player={p} size="sm" />
              <span className="flex-1 font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
              {gameState.mode === 'battle_royale' && <Hearts lives={p.lives} max={maxLives} />}
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 hidden sm:block">{p.score} pts</span>
              <span className="text-sm sm:text-base">
                {p.result === 'correct' ? '✅' : p.result === 'wrong' ? '❌' : '☠️'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── GAME OVER VIEW ───────────────────────────────────────────────────────────
function GameOverView({
  gameState, currentUserId, onPlayAgain, onNewGame
}: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number
  onPlayAgain: () => void
  onNewGame: () => void
}) {
  const over = gameState.gameOverData
  if (!over) return null

  const isBR = over.mode === 'battle_royale'
  const isWinner = isBR
    ? over.winner?.user_id === currentUserId
    : over.winningTeam !== 'draw' && gameState.players.find(p => p.user_id === currentUserId)?.team === over.winningTeam

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-3 sm:space-y-5">

      {/* Winner / result header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-yellow-300 dark:border-yellow-700 p-4 sm:p-6 text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-500 mb-2 sm:mb-3" />
        </motion.div>

        {isBR && over.winner ? (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Winner</p>
            <div className="flex justify-center"><Avatar player={over.winner} size="lg" /></div>
            <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">{over.winner.username}</p>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm sm:text-base">{over.winner.score} points</p>
            {isWinner && (
              <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                className="mt-2 text-yellow-500 font-bold text-base sm:text-lg">🎉 That's you!</motion.p>
            )}
          </>
        ) : (
          <>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
              {over.winningTeam === 'draw' ? '🤝 Draw!' : `Team ${over.winningTeam} Wins!`}
            </p>
            {over.teamScores && (
              <div className="flex justify-center gap-3 sm:gap-6 mt-3">
                {Object.entries(over.teamScores).map(([team, score]) => (
                  <div key={team}
                    className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold ${
                      team === 'A' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                                   : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    }`}>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wide opacity-70">Team {team}</p>
                    <p className="text-xl sm:text-2xl">{score}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Final scoreboard */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">Final Scores</h3>
        <div className="space-y-1.5 sm:space-y-2">
          {over.finalScores.map((p, rank) => (
            <div key={p.user_id}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl ${
                rank === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800'
              }`}>
              <span className="w-5 sm:w-6 text-center font-bold text-gray-400 dark:text-gray-500 text-xs sm:text-sm flex-shrink-0">
                {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`}
              </span>
              <Avatar player={p} size="sm" />
              <span className="flex-1 font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
              <TeamBadge team={p.team} />
              {p.eliminated && <span className="text-xs text-red-500">☠️</span>}
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button onClick={onPlayAgain}
          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-indigo-500/25 text-sm sm:text-base">
          <Swords className="w-4 h-4" /> Play Again
        </button>
        <button onClick={onNewGame}
          className="flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base">
          <LogOut className="w-4 h-4" /> New Game
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Battle page
// ---------------------------------------------------------------------------
export default function Battle() {
  const { user } = useAuthStore()
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const { connectionStatus, gameState, sendMessage, disconnect } = useBattleWebSocket(roomCode)

  // Sync phase from WS state
  const phase = gameState.phase

  const handleCreated = (code: string) => {
    setRoomCode(code)
  }

  const handleJoined = (code: string) => {
    setRoomCode(code)
  }

  const handleLeave = useCallback(() => {
    disconnect()
    setRoomCode(null)
  }, [disconnect])

  const handlePlayAgain = () => {
    // Stay in same room, host can re-start
  }

  const handleNewGame = () => {
    handleLeave()
  }

  // Show WS errors as toasts
  useEffect(() => {
    if (gameState.error) toast.error(gameState.error)
  }, [gameState.error])

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Swords className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Battle Arena</h1>
          {roomCode && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'failed' ? 'bg-red-500' :
                'bg-yellow-400 animate-pulse'
              }`} />
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'reconnecting' ? 'Reconnecting…' :
               connectionStatus === 'failed' ? 'Disconnected' :
               'Connecting…'} · Room {roomCode}
            </p>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* No room yet */}
        {!roomCode && (
          <motion.div key="home" exit={{ opacity: 0, y: -10 }}>
            <HomeView onCreated={handleCreated} onJoined={handleJoined} />
          </motion.div>
        )}

        {/* Lobby */}
        {roomCode && phase === 'lobby' && (
          <motion.div key="lobby" exit={{ opacity: 0 }}>
            <LobbyView
              gameState={gameState}
              currentUserId={user.id}
              sendMessage={sendMessage}
              onLeave={handleLeave}
            />
          </motion.div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <motion.div key="countdown" exit={{ opacity: 0 }}>
            <CountdownView seconds={gameState.countdownSeconds} />
          </motion.div>
        )}

        {/* Question */}
        {phase === 'question' && (
          <motion.div key={`q-${gameState.currentQuestion?.index}`} exit={{ opacity: 0 }}>
            <QuestionView
              gameState={gameState}
              currentUserId={user.id}
              sendMessage={sendMessage}
            />
          </motion.div>
        )}

        {/* Reveal */}
        {phase === 'reveal' && (
          <motion.div key="reveal" exit={{ opacity: 0 }}>
            <RevealView gameState={gameState} currentUserId={user.id} />
          </motion.div>
        )}

        {/* Game over */}
        {phase === 'game_over' && (
          <motion.div key="gameover" exit={{ opacity: 0 }}>
            <GameOverView
              gameState={gameState}
              currentUserId={user.id}
              onPlayAgain={handlePlayAgain}
              onNewGame={handleNewGame}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

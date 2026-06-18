import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useBattleWebSocket, PlayerInfo, BuffEvent } from '@/hooks/useBattleWebSocket'
import { toast } from 'react-hot-toast'
import { Swords, Users, Copy, Check, Crown, Heart, Trophy, Shield, Zap, LogOut, Play, ArrowRight, Star, X, BookOpen, Timer, Flame, Volume2 } from 'lucide-react'
import axios from 'axios'
import { playTTS } from '@/utils/ttsHelper'
import { API_URL as API } from '@/lib/env'
function authHeaders() { const t = localStorage.getItem('access_token'); return t ? { Authorization: `Bearer ${t}` } : {} }

function Hearts({ lives, max = 3 }: { lives: number; max?: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: max }).map((_, i) => <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-error-500 fill-red-500' : 'text-gray-300 dark:text-gray-600'}`} />)}</div>
}
function Avatar({ player, size = 'md' }: { player: PlayerInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  return player.profile_picture
    ? <img src={player.profile_picture} alt={player.username} className={`${sz} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`} />
    : <div className={`${sz} rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-800`}>{player.username[0].toUpperCase()}</div>
}
function TeamBadge({ team }: { team: 'A' | 'B' | null }) {
  if (!team) return null
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${team === 'A' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'}`}>Team {team}</span>
}

// ── EFFECT SYSTEM CONSTANTS ───────────────────────────────────────────────────
const BUFF_IDS = new Set(['double_points', 'shield', 'time_bonus', 'score_boost', 'extra_life', 'answer_reveal', 'steal_points', 'skip_immunity'])

const EFFECT_META: Record<string, { name: string; emoji: string; desc: string }> = {
  double_points: { name: 'Double Points', emoji: '⚡', desc: 'Next correct = +20 pts' },
  shield: { name: 'Shield', emoji: '🛡️', desc: 'Absorb next wrong answer' },
  time_bonus: { name: 'Time Bonus', emoji: '⏰', desc: '+7s on the timer' },
  score_boost: { name: 'Score Boost', emoji: '🌟', desc: '+10 instant points' },
  extra_life: { name: 'Extra Life', emoji: '💖', desc: '+1 life (BR only)' },
  answer_reveal: { name: 'Hint', emoji: '🔍', desc: 'Highlights correct option' },
  steal_points: { name: 'Steal Points', emoji: '🦊', desc: 'Steal 5pts from top player' },
  skip_immunity: { name: 'Immunity', emoji: '🌀', desc: 'Block the next debuff' },
  blind: { name: 'Blind', emoji: '🙈', desc: 'Shuffle their answer options' },
  time_cut: { name: 'Time Cut', emoji: '⏱️', desc: '-7s on their timer' },
  freeze: { name: 'Freeze', emoji: '❄️', desc: 'Lock their buttons for 4s' },
  point_leak: { name: 'Point Leak', emoji: '💸', desc: '-5pts from their score' },
  double_damage: { name: 'Double Damage', emoji: '💥', desc: 'Next wrong costs 2 lives' },
  reverse_controls: { name: 'Reverse', emoji: '🔀', desc: 'Flip their answer order' },
  answer_hidden: { name: 'Hide Option', emoji: '🫣', desc: 'Remove one of their options' },
  score_leech: { name: 'Score Leech', emoji: '🧛', desc: 'Their next correct = 0pts' },
}

const EFFECT_EMOJIS: Record<string, string> = Object.fromEntries(
  Object.entries(EFFECT_META).map(([id, m]) => [id, m.emoji])
)

function EffectBadges({ effects }: { effects: Record<string, number> }) {
  const items = Object.entries(effects).filter(([, v]) => v > 0)
  if (!items.length) return null
  return (
    <div className="flex gap-0.5 flex-wrap mt-0.5">
      {items.map(([id]) => (
        <span key={id} title={id} className={`text-[10px] px-1 rounded-full ${BUFF_IDS.has(id) ? 'bg-success-100 dark:bg-success-900/60' : 'bg-rose-100 dark:bg-rose-900/60'}`}>
          {EFFECT_EMOJIS[id] ?? '?'}
        </span>
      ))}
    </div>
  )
}

// ── EFFECT REFERENCE PANEL ────────────────────────────────────────────────────
function EffectReferencePanel() {
  const [open, setOpen] = useState(false)
  const buffs = Object.entries(EFFECT_META).filter(([id]) => BUFF_IDS.has(id))
  const debuffs = Object.entries(EFFECT_META).filter(([id]) => !BUFF_IDS.has(id))
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span>⚡</span> Power-ups Reference
        </span>
        <span className={`text-xs text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-success-600 dark:text-success-400 mb-2 flex items-center gap-1">✨ Buffs (positive)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {buffs.map(([id, meta]) => (
                    <div key={id} className="flex items-start gap-2 p-2 rounded-xl bg-success-50 dark:bg-success-950/30 border border-success-100 dark:border-success-900/50">
                      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{meta.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-success-800 dark:text-success-300">{meta.name}</p>
                        <p className="text-[10px] text-success-700 dark:text-success-400 opacity-80 leading-snug">{meta.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1">☠️ Debuffs (negative)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {debuffs.map(([id, meta]) => (
                    <div key={id} className="flex items-start gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{meta.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-rose-800 dark:text-rose-300">{meta.name}</p>
                        <p className="text-[10px] text-rose-700 dark:text-rose-400 opacity-80 leading-snug">{meta.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">Buffs/debuffs are randomly awarded after each question. Correct answers earn inventory items you can use strategically!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── INVENTORY PANEL ───────────────────────────────────────────────────────────
function InventoryPanel({ inventory, players, currentUserId, sendMessage }: {
  inventory: string[]
  players: PlayerInfo[]
  currentUserId: number
  sendMessage: (m: Record<string, unknown>) => void
}) {
  const [activeItem, setActiveItem] = useState<string | null>(null)
  if (!inventory.length) return null

  const opponents = players.filter(p => p.user_id !== currentUserId && !p.eliminated)

  const applyItem = (effectId: string, targetId: number) => {
    sendMessage({ type: 'use_effect', effect_id: effectId, target_user_id: targetId })
    setActiveItem(null)
  }

  const handleClick = (effectId: string) => {
    const isBuff = BUFF_IDS.has(effectId)
    if (isBuff) {
      applyItem(effectId, currentUserId)   // buffs → use on self
    } else {
      if (opponents.length === 1) {
        applyItem(effectId, opponents[0].user_id)  // only one opponent → auto-target
      } else {
        setActiveItem(effectId === activeItem ? null : effectId)  // show target picker
      }
    }
  }

  // Deduplicate for display (show count badges)
  const counts: Record<string, number> = {}
  for (const id of inventory) counts[id] = (counts[id] ?? 0) + 1
  const unique = Object.entries(counts)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-primary-100 dark:border-primary-900/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500 mb-2">🎒 Your Items</p>
      <div className="flex flex-wrap gap-1.5">
        {unique.map(([id, count]) => {
          const meta = EFFECT_META[id]
          const isBuff = BUFF_IDS.has(id)
          return (
            <motion.div key={id} className="relative">
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                onClick={() => handleClick(id)}
                title={meta ? `${meta.name}: ${meta.desc}` : id}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${activeItem === id
                  ? 'border-primary-500 ring-2 ring-primary-300 bg-primary-50 dark:bg-primary-950/40'
                  : isBuff
                    ? 'border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-950/30 text-success-700 dark:text-success-300'
                    : 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                  }`}>
                <span className="text-base leading-none">{meta?.emoji ?? '?'}</span>
                <span className="hidden sm:inline">{meta?.name ?? id}</span>
                {count > 1 && <span className="bg-white dark:bg-gray-800 rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-black text-gray-700 dark:text-gray-300">{count}</span>}
              </motion.button>

              {/* Target picker for debuffs */}
              <AnimatePresence>
                {activeItem === id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-full mb-1.5 left-0 z-40 bg-white dark:bg-gray-900 border-2 border-rose-300 dark:border-rose-700 rounded-xl shadow-xl p-2 min-w-[140px]">
                    <p className="text-[10px] font-bold text-rose-500 mb-1.5 uppercase tracking-wide">Target:</p>
                    <div className="space-y-1">
                      {opponents.map(op => (
                        <button key={op.user_id} onClick={() => applyItem(id, op.user_id)}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left">
                          <Avatar player={op} size="sm" />
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{op.username}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setActiveItem(null)} className="mt-1 w-full text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── BUFF EVENT BANNER ─────────────────────────────────────────────────────────
function BuffEventBanner({ event, currentUserId }: { event: BuffEvent; currentUserId: number }) {
  const isMe = event.targetUserId === currentUserId
  const bg = event.isBuff ? 'from-success-500 to-teal-600' : 'from-rose-500 to-purple-700'
  return (
    <motion.div initial={{ opacity: 0, y: -60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm rounded-2xl bg-gradient-to-r ${bg} shadow-2xl px-4 py-3 text-white`}>
      <div className="flex items-center gap-3">
        <motion.span className="text-3xl flex-shrink-0" animate={{ scale: [1, 1.4, 1] }} transition={{ delay: 0.15, duration: 0.4 }}>
          {event.effectEmoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm leading-tight">
            {event.effectName} <span className="font-normal opacity-75">→</span> <span className="font-bold">{isMe ? 'YOU' : event.targetUsername}!</span>
          </p>
          <p className="text-[11px] opacity-85 mt-0.5 leading-tight">{event.description}</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/20">{event.isBuff ? '✨ BUFF' : '☠️ DEBUFF'}</span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/25 overflow-hidden">
        <motion.div className="h-full bg-white/60 rounded-full" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 3.5, ease: 'linear', delay: 0.4 }} />
      </div>
    </motion.div>
  )
}

// ── HOME VIEW ─────────────────────────────────────────────────────────────────
function HomeView({ onCreated, onJoined }: { onCreated: (c: string) => void; onJoined: (c: string) => void }) {
  const [mode, setMode] = useState<'battle_royale' | 'team_vs_team'>('battle_royale')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const handleCreate = async () => {
    setCreating(true)
    try { const r = await axios.post(`${API}/battle/rooms`, { mode }, { headers: authHeaders() }); onCreated(r.data.room_code) }
    catch (e) { const err = e as { response?: { data?: { detail?: string } } }; toast.error(err.response?.data?.detail || 'Failed to create room') }
    finally { setCreating(false) }
  }
  const handleJoin = () => { const c = joinCode.trim().toUpperCase(); if (c.length !== 6) { toast.error('Enter a 6-character room code'); return } onJoined(c) }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Swords className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Battle Arena</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Compete in real-time HSK vocabulary battles</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Game Mode</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
          {([{ value: 'battle_royale', label: 'Battle Royale', desc: 'Last one standing wins', icon: Swords, color: 'indigo' },
          { value: 'team_vs_team', label: 'Team vs Team', desc: 'Compete as a team', icon: Users, color: 'rose' }] as const
          ).map(({ value, label, desc, icon: Icon, color }) => (
            <button key={value} onClick={() => setMode(value)} className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${mode === value ? color === 'indigo' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-surface-card bg-white'}`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1.5 ${mode === value ? color === 'indigo' ? 'text-primary-600 dark:text-primary-400' : 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`} />
              <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
        <button onClick={handleCreate} disabled={creating} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-primary-500/25 text-sm sm:text-base">
          {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
          Create Room
        </button>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Join a Room</p>
        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123"
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-xl font-mono font-bold tracking-widest bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 uppercase" />
          <button onClick={handleJoin} className="px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center gap-1.5 text-sm sm:text-base shadow-md shadow-primary-500/25">
            Join <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── LOBBY VIEW ────────────────────────────────────────────────────────────────
function LobbyView({ gameState, currentUserId, sendMessage, onLeave }: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number; sendMessage: (m: Record<string, unknown>) => void; onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [hskLevel, setHskLevel] = useState(1)
  const [numQ, setNumQ] = useState(10)
  const [timeLimitSec, setTimeLimitSec] = useState(15)
  const [startingLives, setStartingLivesLocal] = useState(3)
  const [qType, setQType] = useState<'mixed' | 'char_to_meaning' | 'meaning_to_char' | 'pinyin' | 'tone_select' | 'sentence_blank' | 'definition_match'>('mixed')
  const [buffMode, setBuffMode] = useState<'both' | 'buffs_only' | 'debuffs_only' | 'none'>('both')
  const isHost = currentUserId === gameState.hostId

  const copyCode = async () => {
    const code = gameState.roomCode ?? ''
    try { await navigator.clipboard.writeText(code) } catch { const el = document.createElement('textarea'); el.value = code; el.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el) }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const startGame = () => sendMessage({
    type: 'start_game', hsk_level: hskLevel, num_questions: numQ,
    time_limit: timeLimitSec, lives: startingLives, question_type: qType,
    buff_mode: buffMode,
  })
  const assignTeam = (uid: number, team: 'A' | 'B') => sendMessage({ type: 'assign_team', user_id: uid, team })
  const kick = (uid: number) => sendMessage({ type: 'kick', user_id: uid })

  const QTYPES = [
    { value: 'mixed', label: '🔀 Mixed', desc: 'All 6 types' },
    { value: 'char_to_meaning', label: '汉 → 🇬🇧', desc: 'Char → meaning' },
    { value: 'meaning_to_char', label: '🇬🇧 → 汉', desc: 'Meaning → char' },
    { value: 'pinyin', label: '汉 → pīn', desc: 'Char → pinyin' },
    { value: 'tone_select', label: '🎵 Tones', desc: 'Pick correct tone' },
    { value: 'sentence_blank', label: '📝 Fill Blank', desc: 'Sentence gap fill' },
    { value: 'definition_match', label: '📖 Definition', desc: 'Match the definition' },
  ] as const

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-3 sm:space-y-5">
      {/* Room code */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Room Code</p>
            <p className="text-3xl sm:text-4xl font-black tracking-widest text-primary-600 dark:text-primary-400 font-mono">{gameState.roomCode}</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${gameState.mode === 'battle_royale' ? 'bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'}`}>
              {gameState.mode === 'battle_royale' ? '⚔️ Battle Royale' : '🤝 Team vs Team'}
            </span>
            <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 transition-all">
              {copied ? <Check className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">Players ({gameState.players.length}/20)</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Waiting…</p>
        </div>
        <div className="space-y-2">
          {gameState.players.map(p => (
            <div key={p.user_id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Avatar player={p} size="sm" />
              <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
                {p.user_id === gameState.hostId && <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                <TeamBadge team={p.team} />
              </div>
              {isHost && gameState.mode === 'team_vs_team' && (
                <div className="flex gap-1">
                  <button onClick={() => assignTeam(p.user_id, 'A')} className={`text-xs px-2 py-1 rounded-lg font-semibold transition-all ${p.team === 'A' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>A</button>
                  <button onClick={() => assignTeam(p.user_id, 'B')} className={`text-xs px-2 py-1 rounded-lg font-semibold transition-all ${p.team === 'B' ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>B</button>
                </div>
              )}
              {isHost && p.user_id !== currentUserId && (
                <button onClick={() => kick(p.user_id)} className="p-1 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/30 text-gray-400 hover:text-error-500 transition-all"><X className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
          {gameState.players.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">No players yet</p>}
        </div>
      </div>

      {/* Game settings (host only) */}
      {isHost && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5 space-y-4">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Game Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">HSK Level</p>
              <div className="flex flex-wrap gap-1.5">{[1, 2, 3, 4, 5, 6].map(l => <button key={l} onClick={() => setHskLevel(l)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${hskLevel === l ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{l}</button>)}</div>
            </div>
            <div>
              <p className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Questions</p>
              <div className="flex flex-wrap gap-1.5">{[5, 10, 15, 20].map(n => <button key={n} onClick={() => setNumQ(n)} className={`px-3 h-9 rounded-xl text-sm font-semibold transition-all ${numQ === n ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{n}</button>)}</div>
            </div>
            <div>
              <p className="flex text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 items-center gap-1"><Timer className="w-3 h-3" /> Time per Question</p>
              <div className="flex flex-wrap gap-1.5">{[10, 15, 20, 30].map(s => <button key={s} onClick={() => setTimeLimitSec(s)} className={`px-3 h-9 rounded-xl text-sm font-semibold transition-all ${timeLimitSec === s ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{s}s</button>)}</div>
            </div>
            {gameState.mode === 'battle_royale' && (
              <div>
                <p className="flex text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 items-center gap-1"><Heart className="w-3 h-3" /> Lives</p>
                <div className="flex flex-wrap gap-1.5">{[1, 2, 3].map(n => <button key={n} onClick={() => setStartingLivesLocal(n)} className={`px-3 h-9 rounded-xl text-sm font-semibold transition-all ${startingLives === n ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{'❤️'.repeat(n)}</button>)}</div>
              </div>
            )}
          </div>
          <div>
            <p className="flex text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 items-center gap-1"><BookOpen className="w-3 h-3" /> Question Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {QTYPES.map(({ value, label, desc }) => (
                <button key={value} onClick={() => setQType(value)} className={`p-2 rounded-xl text-center transition-all border-2 ${qType === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                  <p className="text-xs sm:text-sm font-semibold">{label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Buff / Debuff Mode */}
          <div>
            <p className="flex text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 items-center gap-1">
              ✨ Power-ups Mode
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { value: 'both', label: '⚡+☠️ Both', desc: 'Buffs & debuffs', color: 'indigo' },
                { value: 'buffs_only', label: '✨ Buffs Only', desc: 'Positive only', color: 'emerald' },
                { value: 'debuffs_only', label: '☠️ Debuffs Only', desc: 'Negative only', color: 'rose' },
                { value: 'none', label: '🚫 None', desc: 'No power-ups', color: 'gray' },
              ] as const).map(({ value, label, desc, color }) => (
                <button key={value} onClick={() => setBuffMode(value)}
                  className={`p-2 rounded-xl text-center transition-all border-2 ${buffMode === value
                    ? color === 'indigo' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                      : color === 'emerald' ? 'border-success-500 bg-success-50 dark:bg-success-950/30 text-success-700 dark:text-success-300'
                        : color === 'rose' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                          : 'border-gray-400 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}>
                  <p className="text-xs sm:text-sm font-semibold">{label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} disabled={gameState.players.length < 2} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-primary-500/25 text-sm sm:text-base">
            <Swords className="w-4 h-4 sm:w-5 sm:h-5" /> Start Battle {gameState.players.length < 2 && '(need 2+ players)'}
          </button>
        </div>
      )}
      {/* Power-ups Reference Panel */}
      <EffectReferencePanel />

      <button onClick={onLeave} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-error-400 hover:text-error-500 transition-all font-medium text-sm sm:text-base">
        <LogOut className="w-4 h-4" /> Leave Room
      </button>
      {gameState.error && <p className="text-center text-sm text-error-500">{gameState.error}</p>}
    </motion.div>
  )
}

// ── COUNTDOWN VIEW ────────────────────────────────────────────────────────────
function CountdownView({ seconds }: { seconds: number | null }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <AnimatePresence mode="wait">
        <motion.div key={seconds} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <p className="text-8xl sm:text-9xl font-black text-primary-600 dark:text-primary-400">{seconds}</p>
          <p className="mt-4 text-xl font-semibold text-gray-600 dark:text-gray-400">Get ready!</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── QUESTION VIEW ─────────────────────────────────────────────────────────────
function QuestionView({ gameState, currentUserId, sendMessage }: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number; sendMessage: (m: Record<string, unknown>) => void
}) {
  const q = gameState.currentQuestion
  const me = gameState.players.find(p => p.user_id === currentUserId)
  const myFx = me?.active_effects ?? {}
  const maxLives = gameState.startingLives
  const baseTime = (q?.time_limit ?? 15) + (myFx['time_bonus'] ? 7 : myFx['time_cut'] ? -7 : 0)

  const [selected, setSelected] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(baseTime)
  const [frozen, setFrozen] = useState(false)
  const [opts, setOpts] = useState<{ text: string; origIdx: number }[]>([])
  const [hintIdx, setHintIdx] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const freezeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSelected(null)
    const adj = (myFx['time_bonus'] ? 7 : myFx['time_cut'] ? -7 : 0)
    setTimeLeft((q?.time_limit ?? 15) + adj)
    if (!q) return
    let o = q.options.map((text, i) => ({ text, origIdx: i }))
    if (myFx['blind']) o = [...o].sort(() => Math.random() - 0.5)
    else if (myFx['reverse_controls']) o = [...o].reverse()
    if (myFx['answer_hidden']) {
      const wrongs = o.filter(x => x.origIdx !== (q.correct_answer ?? -1))
      if (wrongs.length > 0) { const h = wrongs[Math.floor(Math.random() * wrongs.length)]; o = o.filter(x => x !== h) }
    }
    setOpts(o)
    if (myFx['freeze']) {
      setFrozen(true)
      if (freezeRef.current) clearTimeout(freezeRef.current)
      freezeRef.current = setTimeout(() => setFrozen(false), 4000)
    } else setFrozen(false)
    // answer_reveal hint: briefly show the correct option for 2.5 s
    if (hintRef.current) clearTimeout(hintRef.current)
    if (myFx['answer_reveal'] && q.correct_answer !== null) {
      setHintIdx(q.correct_answer)
      hintRef.current = setTimeout(() => setHintIdx(null), 2500)
    } else {
      setHintIdx(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.index])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [q?.index])
  useEffect(() => () => {
    if (freezeRef.current) clearTimeout(freezeRef.current)
    if (hintRef.current) clearTimeout(hintRef.current)
  }, [])

  // ── TTS helper ────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const speakChinese = useCallback(async (text: string) => {
    if (!text) return
    audioRef.current?.pause()
    audioRef.current = null

    try {
        const audio = await playTTS({ text, speakingRate: 0.85 })
        audioRef.current = audio
    } catch { /* silent — shim fallback handled inside playTTS */ }
  }, [])

  // Auto-play for tone_select (the whole point is to hear the word)
  useEffect(() => {
    if (q?.question_type === 'tone_select' && q.chinese) {
      const t = setTimeout(() => speakChinese(q.chinese), 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.index])

  const handleAnswer = (origIdx: number) => {
    if (selected !== null || me?.eliminated || frozen) return
    setSelected(origIdx); sendMessage({ type: 'answer', answer_index: origIdx })
  }

  if (!q) return null
  const timerPct = Math.max(0, timeLeft / Math.max(baseTime, 1)) * 100
  const optClass = (q.question_type === 'multiple_choice' || q.question_type === 'sentence_blank' || q.question_type === 'definition_match')
    ? 'font-chinese text-xl sm:text-2xl md:text-3xl'
    : (q.question_type === 'pinyin_match' || q.question_type === 'tone_select')
      ? 'text-sm sm:text-base tracking-wide font-mono'
      : 'text-xs sm:text-sm md:text-base'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
      {/* Timer bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Q{q.index}/{q.total}</span>
          <div className={`flex items-center gap-1 font-bold text-base sm:text-lg ${timeLeft <= 5 ? 'text-error-500' : 'text-gray-800 dark:text-gray-200'}`}>
            {frozen && <span className="text-blue-400 text-sm animate-pulse">❄️</span>}
            {timeLeft <= 5 && <Zap className="w-4 h-4 animate-pulse" />}
            {timeLeft}s
          </div>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-error-500' : myFx['time_bonus'] ? 'bg-success-500' : myFx['time_cut'] ? 'bg-orange-500' : 'bg-primary-500'}`} animate={{ width: `${timerPct}%` }} transition={{ duration: 0.25 }} />
        </div>
      </div>

      {/* Players mini-bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {gameState.players.map(p => (
          <div key={p.user_id} className={`flex items-center gap-1 px-1.5 py-1 rounded-xl border ${p.eliminated ? 'border-error-200 bg-error-50 dark:bg-error-950/20 opacity-50 dark:border-error-800' : p.user_id === currentUserId ? 'border-primary-300 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
            <Avatar player={p} size="sm" />
            <div className="hidden sm:block ml-0.5">
              <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 leading-none">{p.username}</p>
              {gameState.mode === 'battle_royale' ? <Hearts lives={p.lives} max={maxLives} /> : <p className="text-[10px] text-primary-600 font-bold dark:text-primary-400">{p.score}p</p>}
              <EffectBadges effects={p.active_effects ?? {}} />
            </div>
            {gameState.answeredUserIds.includes(p.user_id) && !p.eliminated && <Check className="w-3 h-3 text-success-500 ml-1" />}
          </div>
        ))}
      </div>

      {/* My status bar */}
      {me && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl px-3 py-2 shadow border border-gray-100 dark:border-gray-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" />
            {gameState.mode === 'battle_royale' ? <Hearts lives={me.lives} max={maxLives} /> : <TeamBadge team={me.team} />}
          </div>
          <div className="flex items-center gap-2">
            <EffectBadges effects={myFx} />
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{me.score} pts</span>
          </div>
        </div>
      )}

      {/* Inventory Panel */}
      {me && !me.eliminated && (
        <InventoryPanel
          inventory={me.inventory ?? []}
          players={gameState.players}
          currentUserId={currentUserId}
          sendMessage={sendMessage}
        />
      )}

      {/* Question card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        {/* Prompt */}
        {q.question_type === 'character_match' && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{q.prompt_label || 'What is the meaning?'}</p>
            <div className="flex items-center justify-center gap-3">
              <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl sm:text-7xl font-bold font-chinese text-gray-900 dark:text-gray-100">{q.chinese}</motion.p>
              <button onClick={() => speakChinese(q.chinese)} className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-500 hover:bg-primary-100 transition-all dark:hover:bg-primary-900/40" title="Hear pronunciation"><Volume2 className="w-5 h-5" /></button>
            </div>
            <p className="text-primary-500 text-lg mt-1.5">{q.pinyin}</p>
          </div>
        )}
        {q.question_type === 'multiple_choice' && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{q.prompt_label || 'Which character means this?'}</p>
            <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">&ldquo;{q.english}&rdquo;</motion.p>
          </div>
        )}
        {q.question_type === 'pinyin_match' && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{q.prompt_label || 'Which pronunciation is correct?'}</p>
            <div className="flex items-center justify-center gap-3">
              <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl sm:text-7xl font-bold font-chinese text-gray-900 dark:text-gray-100">{q.chinese}</motion.p>
              <button onClick={() => speakChinese(q.chinese)} className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-500 hover:bg-primary-100 transition-all dark:hover:bg-primary-900/40" title="Hear pronunciation"><Volume2 className="w-5 h-5" /></button>
            </div>
            <p className="text-gray-400 text-sm mt-1.5 italic">{q.english}</p>
          </div>
        )}
        {q.question_type === 'tone_select' && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{q.prompt_label || 'Choose the correct tone:'}</p>
            <div className="inline-flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl px-5 py-3">
              <span className="text-2xl">🎵</span>
              <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl sm:text-4xl font-bold text-amber-700 dark:text-amber-400 tracking-wider">{q.bare_syllable || q.pinyin}</motion.p>
              <button onClick={() => speakChinese(q.chinese)} className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 hover:bg-amber-200 transition-all dark:text-amber-300" title="Hear word"><Volume2 className="w-4 h-4" /></button>
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">{q.english} · {q.chinese}</p>
          </div>
        )}
        {q.question_type === 'sentence_blank' && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{q.prompt_label || 'Fill in the blank:'}</p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl sm:text-2xl font-bold font-chinese text-gray-900 dark:text-gray-100 leading-relaxed">
                {(q.display_sentence || `___ (${q.pinyin})`).split('___').map((part: string, i: number, arr: string[]) => (
                  <span key={i}>{part}{i < arr.length - 1 && <span className="mx-1 px-3 py-0.5 bg-blue-200 dark:bg-blue-700 rounded-lg text-blue-900 dark:text-blue-100">＿＿</span>}</span>
                ))}
              </motion.p>
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">{q.pinyin} · {q.english}</p>
          </div>
        )}
        {q.question_type === 'definition_match' && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{q.prompt_label || 'Which character matches this definition?'}</p>
            <div className="bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-4">
              <span className="text-2xl mb-2 block">📖</span>
              <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-base sm:text-lg font-medium text-purple-900 dark:text-purple-200 italic">
                {q.definition_clue || `"${q.english}" (${q.pinyin})`}
              </motion.p>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {opts.map(({ text, origIdx }, di) => {
            const isSel = selected === origIdx
            const isDis = selected !== null || me?.eliminated || frozen
            const isHint = hintIdx !== null && origIdx === hintIdx
            return (
              <motion.button key={`${q.index}-${di}`}
                whileHover={!isDis ? { scale: 1.02 } : {}} whileTap={!isDis ? { scale: 0.97 } : {}}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}
                onClick={() => handleAnswer(origIdx)} disabled={!!isDis}
                className={`p-2.5 sm:p-3 md:p-4 rounded-xl border-2 font-medium text-center transition-all min-h-[52px] sm:min-h-[60px] ${isSel ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 ring-2 ring-primary-300'
                  : isHint ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 ring-2 ring-yellow-300 animate-pulse'
                    : frozen ? 'border-blue-200 dark:border-blue-800 bg-blue-50/40 text-gray-400 cursor-not-allowed'
                      : isDis ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-800 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-950/20'
                  } ${optClass}`}>
                {isHint && <span className="mr-1 text-yellow-500">🔍</span>}{text}
              </motion.button>
            )
          })}
        </div>
        {selected !== null && <p className="text-center text-sm text-gray-500 mt-3 animate-pulse">Waiting for others…</p>}
        {me?.eliminated && <p className="text-center text-sm text-error-500 mt-3 font-semibold">☠️ You've been eliminated — watching as spectator</p>}
      </div>
    </motion.div>
  )
}

// ── REVEAL VIEW ───────────────────────────────────────────────────────────────
function RevealView({ gameState, currentUserId }: { gameState: ReturnType<typeof useBattleWebSocket>['gameState']; currentUserId: number }) {
  const reveal = gameState.revealData
  const q = gameState.currentQuestion
  const maxLives = gameState.startingLives
  if (!reveal || !q) return null
  const me = reveal.players.find(p => p.user_id === currentUserId)
  const myResult = me?.result
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
      {myResult && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`rounded-2xl p-3 sm:p-4 text-center font-bold text-base sm:text-lg ${myResult === 'correct' ? 'bg-success-500 text-white' : myResult === 'wrong' ? 'bg-error-500 text-white' : 'bg-gray-500 text-white'}`}>
          {myResult === 'correct' ? '✅ Correct!' : myResult === 'wrong' ? '❌ Wrong!' : '☠️ Eliminated'}
        </motion.div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-success-300 dark:border-success-700 p-4 sm:p-5 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Correct Answer</p>
        <p className={`font-bold text-success-700 dark:text-success-400 ${q.question_type === 'multiple_choice' ? 'text-3xl sm:text-4xl font-chinese' : q.question_type === 'pinyin_match' ? 'text-2xl sm:text-3xl tracking-wide' : 'text-xl sm:text-2xl'}`}>{reveal.correctText}</p>
        {q.question_type === 'character_match' && <p className="text-2xl sm:text-3xl font-chinese text-gray-700 dark:text-gray-300 mt-1">{q.chinese}</p>}
        {q.question_type === 'pinyin_match' && <p className="text-3xl sm:text-4xl font-chinese text-gray-700 dark:text-gray-300 mt-1">{q.chinese}</p>}
        {q.question_type !== 'pinyin_match' && <p className="text-primary-500 mt-1 text-sm">{q.pinyin}</p>}
        <p className="text-gray-400 text-xs mt-1">{q.english}</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-xs sm:text-sm">Round Results</h3>
        <div className="space-y-1.5">
          {reveal.players.map(p => (
            <div key={p.user_id} className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl ${p.result === 'correct' ? 'bg-success-50 dark:bg-success-950/20' : p.result === 'wrong' ? 'bg-error-50 dark:bg-error-950/20' : 'bg-gray-50 dark:bg-gray-800 opacity-50'}`}>
              <Avatar player={p} size="sm" />
              <span className="flex-1 font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
              {gameState.mode === 'battle_royale' && <Hearts lives={p.lives} max={maxLives} />}
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 hidden sm:block">{p.score} pts</span>
              <EffectBadges effects={p.active_effects ?? {}} />
              <span className="text-sm">{p.result === 'correct' ? '✅' : p.result === 'wrong' ? '❌' : '☠️'}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── GAME OVER VIEW ────────────────────────────────────────────────────────────
function GameOverView({ gameState, currentUserId, onPlayAgain, onNewGame }: {
  gameState: ReturnType<typeof useBattleWebSocket>['gameState']
  currentUserId: number; onPlayAgain: () => void; onNewGame: () => void
}) {
  const over = gameState.gameOverData
  if (!over) return null
  const isBR = over.mode === 'battle_royale'
  const isWinner = isBR ? over.winner?.user_id === currentUserId : over.winningTeam !== 'draw' && gameState.players.find(p => p.user_id === currentUserId)?.team === over.winningTeam
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-3 sm:space-y-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-yellow-300 dark:border-yellow-700 p-4 sm:p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Trophy className="w-14 h-14 mx-auto text-yellow-500 mb-3" />
        </motion.div>
        {isBR && over.winner ? (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Winner</p>
            <div className="flex justify-center"><Avatar player={over.winner} size="lg" /></div>
            <p className="mt-3 text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">{over.winner.username}</p>
            <p className="text-primary-600 dark:text-primary-400 font-semibold">{over.winner.score} points</p>
            {isWinner && <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="mt-2 text-yellow-500 font-bold text-lg">🎉 That's you!</motion.p>}
          </>
        ) : (
          <>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">{over.winningTeam === 'draw' ? '🤝 Draw!' : `Team ${over.winningTeam} Wins!`}</p>
            {over.teamScores && (
              <div className="flex justify-center gap-4 mt-3">
                {Object.entries(over.teamScores).map(([team, score]) => (
                  <div key={team} className={`px-5 py-3 rounded-xl font-bold ${team === 'A' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'}`}>
                    <p className="text-xs uppercase opacity-70">Team {team}</p>
                    <p className="text-2xl">{score}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 sm:p-5">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Final Scores</h3>
        <div className="space-y-2">
          {over.finalScores.map((p, rank) => (
            <div key={p.user_id} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl ${rank === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <span className="w-6 text-center font-bold text-gray-400 text-xs">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`}</span>
              <Avatar player={p} size="sm" />
              <span className="flex-1 font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
              <TeamBadge team={p.team} />
              {p.eliminated && <span className="text-xs text-error-500">☠️</span>}
              <span className="font-bold text-primary-600 dark:text-primary-400 text-xs sm:text-sm">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>
      {/* Play Again Voting Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-primary-100 dark:border-primary-900 p-4">
        <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🔁 Play Again? Vote to rematch!
        </p>
        <div className="space-y-2 mb-4">
          {gameState.players.map(p => {
            const hasVoted = gameState.playAgainVotes.includes(p.user_id)
            return (
              <div key={p.user_id} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${hasVoted ? 'bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <Avatar player={p} size="sm" />
                <span className="flex-1 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.username}</span>
                <span className="text-base">{hasVoted ? '✅' : '⏳'}</span>
              </div>
            )
          })}
        </div>
        {gameState.players.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{gameState.playAgainVotes.length} / {gameState.players.length} voted</span>
              <span>{Math.round(gameState.playAgainVotes.length / gameState.players.length * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-success-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${gameState.playAgainVotes.length / gameState.players.length * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onPlayAgain} disabled={gameState.playAgainVotes.includes(currentUserId)} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm">
            <Swords className="w-4 h-4" />{gameState.playAgainVotes.includes(currentUserId) ? 'Voted ✅' : 'Vote Rematch!'}
          </button>
          <button onClick={onNewGame} className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-xl transition-all text-sm">
            <LogOut className="w-4 h-4" /> Leave
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── MAIN BATTLE PAGE ──────────────────────────────────────────────────────────
export default function Battle() {
  const { user } = useAuthStore()
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const { connectionStatus, gameState, sendMessage, disconnect } = useBattleWebSocket(roomCode)
  const phase = gameState.phase

  const handleLeave = useCallback(() => { disconnect(); setRoomCode(null) }, [disconnect])
  useEffect(() => { if (gameState.error) toast.error(gameState.error) }, [gameState.error])

  if (!user) return null
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-16">
      {/* Buff/Debuff Banner (shows above everything) */}
      <AnimatePresence>
        {gameState.buffEvent && <BuffEventBanner key={gameState.buffEvent.effectId + gameState.buffEvent.targetUserId} event={gameState.buffEvent} currentUserId={user.id} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-md shadow-primary-500/30"><Swords className="w-5 h-5 text-white" /></div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Battle Arena</h1>
          {roomCode && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-success-500' : connectionStatus === 'failed' ? 'bg-error-500' : 'bg-yellow-400 animate-pulse'}`} />
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'reconnecting' ? 'Reconnecting…' : connectionStatus === 'failed' ? 'Disconnected' : 'Connecting…'} · Room {roomCode}
            </p>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!roomCode && <motion.div key="home" exit={{ opacity: 0, y: -10 }}><HomeView onCreated={setRoomCode} onJoined={setRoomCode} /></motion.div>}
        {roomCode && phase === 'lobby' && <motion.div key="lobby" exit={{ opacity: 0 }}><LobbyView gameState={gameState} currentUserId={user.id} sendMessage={sendMessage} onLeave={handleLeave} /></motion.div>}
        {phase === 'countdown' && <motion.div key="countdown" exit={{ opacity: 0 }}><CountdownView seconds={gameState.countdownSeconds} /></motion.div>}
        {phase === 'question' && <motion.div key={`q-${gameState.currentQuestion?.index}`} exit={{ opacity: 0 }}><QuestionView gameState={gameState} currentUserId={user.id} sendMessage={sendMessage} /></motion.div>}
        {phase === 'reveal' && <motion.div key="reveal" exit={{ opacity: 0 }}><RevealView gameState={gameState} currentUserId={user.id} /></motion.div>}
        {phase === 'game_over' && <motion.div key="gameover" exit={{ opacity: 0 }}><GameOverView gameState={gameState} currentUserId={user.id} onPlayAgain={() => sendMessage({ type: 'vote_play_again' })} onNewGame={handleLeave} /></motion.div>}
      </AnimatePresence>
    </div>
  )
}


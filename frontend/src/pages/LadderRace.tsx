import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Dice5, Copy, Users, Play, ArrowLeft, Trophy, Zap, Loader2, Crown, RotateCcw,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ladderApi } from '@/services/api'
import { useLadderWebSocket } from '@/hooks/useLadderWebSocket'
import Board, { tokenColor } from '@/components/ladder/Board'
import { Skeleton } from '@/components/ui/Skeleton'
import QuestionModal from '@/components/ladder/QuestionModal'
import DiceRoll from '@/components/ladder/DiceRoll'

export default function LadderRace() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const roomCode = searchParams.get('room')

  const [joinCode, setJoinCode] = useState('')
  const [boardSize, setBoardSize] = useState<50 | 100>(50)
  const [creating, setCreating] = useState(false)

  const { connectionStatus, gameState, sendMessage, disconnect } = useLadderWebSocket(roomCode)
  const myId = user?.id ?? -1
  const isHost = gameState.hostId === myId
  const isMyTurn = gameState.currentTurnUid === myId

  const currentTurnPlayer = useMemo(
    () => gameState.players.find(p => p.user_id === gameState.currentTurnUid) ?? null,
    [gameState.players, gameState.currentTurnUid],
  )

  const createRoom = async () => {
    setCreating(true)
    try {
      const res = await ladderApi.createRoom(boardSize)
      setSearchParams({ room: res.room_code })
    } catch {
      toast.error(t('ladder.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) { toast.error(t('ladder.invalidCode')); return }
    setSearchParams({ room: code })
  }

  const leaveRoom = () => {
    disconnect()
    setSearchParams({})
  }

  const copyCode = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode).then(
      () => toast.success(t('ladder.codeCopied')),
      () => toast.error(roomCode),
    )
  }

  // ── Entry screen (no room yet) ────────────────────────────────────────────
  if (!roomCode) {
    return (
      <div className="max-w-md mx-auto px-4 pb-16 pt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-5xl mb-2">🎲</div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">{t('ladder.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('ladder.tagline')}</p>
        </motion.div>

        {/* Create */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Dice5 className="w-4 h-4 text-primary-500" /> {t('ladder.createRoom')}
          </h2>
          <div className="flex gap-2">
            {([50, 100] as const).map(size => (
              <button key={size} onClick={() => setBoardSize(size)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  boardSize === size
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                {size} {t('ladder.tiles')}
                <span className="block text-[10px] font-normal opacity-70">
                  {size === 50 ? t('ladder.quickMatch') : t('ladder.longMatch')}
                </span>
              </button>
            ))}
          </div>
          <button onClick={createRoom} disabled={creating}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {t('ladder.create')}
          </button>
        </motion.div>

        {/* Join */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" /> {t('ladder.joinRoom')}
          </h2>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && joinRoom()}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-card text-gray-900 dark:text-gray-100 font-mono font-bold tracking-widest text-center uppercase focus-visible:outline-none focus-visible:border-primary-500"
            />
            <button onClick={joinRoom}
              className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-sm">
              {t('ladder.join')}
            </button>
          </div>
        </motion.div>

        {/* Fairness note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
          ⚖️ {t('ladder.fairnessNote')}
        </p>
      </div>
    )
  }

  // ── Connection states ─────────────────────────────────────────────────────
  if (connectionStatus === 'connecting' || connectionStatus === 'idle') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="aspect-square w-full max-w-md mx-auto rounded-3xl" />
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('ladder.connecting')}</p>
      </div>
    )
  }
  if (connectionStatus === 'failed' || gameState.error) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 text-center space-y-4">
        <p className="text-3xl">😵</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
          {gameState.error ?? t('ladder.connectionLost')}
        </p>
        <button onClick={leaveRoom}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('ladder.backToStart')}
        </button>
      </div>
    )
  }

  // ── Game over ─────────────────────────────────────────────────────────────
  if (gameState.phase === 'game_over' && gameState.placements) {
    const iVoted = gameState.rematchVotes.includes(myId)
    return (
      <div className="max-w-md mx-auto px-4 pb-16 pt-8 space-y-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">{t('ladder.gameOver')}</h1>
        </motion.div>

        <div className="space-y-2">
          {gameState.placements.map((p, i) => (
            <motion.div key={p.user_id}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                p.place === 1
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-surface-card border-gray-100 dark:border-gray-800'
              }`}>
              <span className="text-xl w-8 text-center">
                {p.place === 1 ? '🥇' : p.place === 2 ? '🥈' : p.place === 3 ? '🥉' : `${p.place}.`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                  {p.username} {p.user_id === myId && <span className="text-xs text-primary-500">({t('ladder.you')})</span>}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  🎯 {p.accuracy}% · HSK {p.hsk_level} · {t('ladder.tile')} {p.position}
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Zap className="w-3.5 h-3.5" /> +{p.xp_earned}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => sendMessage({ type: 'vote_rematch' })} disabled={iVoted}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            <RotateCcw className="w-4 h-4" />
            {iVoted
              ? t('ladder.waitingOthers', { count: gameState.rematchVotes.length })
              : t('ladder.rematch')}
          </button>
          <button onClick={leaveRoom}
            className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            {t('ladder.leave')}
          </button>
        </div>
      </div>
    )
  }

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (gameState.phase === 'lobby') {
    return (
      <div className="max-w-md mx-auto px-4 pb-16 pt-6 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={leaveRoom} aria-label={t('ladder.back')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/40 rounded-xl font-mono font-extrabold tracking-widest text-primary-700 dark:text-primary-300">
            {roomCode} <Copy className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-9 text-right">
            {gameState.boardSize}🎲
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-50">{t('ladder.lobbyTitle')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('ladder.lobbyHint')}</p>
        </div>

        {/* Players */}
        <div className="space-y-2">
          {gameState.players.map(p => (
            <div key={p.user_id}
              className="flex items-center gap-3 bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${tokenColor(p.user_id, gameState.players.map(x => x.user_id))}`}>
                {p.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                  {p.username}
                  {p.user_id === gameState.hostId && <Crown className="inline w-3.5 h-3.5 text-amber-400 ml-1 -mt-0.5" />}
                </p>
              </div>
              {/* Level selector (self) / level chip (others) — fairness handicap */}
              {p.user_id === myId ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6].map(lv => (
                    <button key={lv} onClick={() => sendMessage({ type: 'set_level', hsk_level: lv })}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold transition-colors ${
                        p.hsk_level === lv
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}>
                      {lv}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded-lg">
                  HSK {p.hsk_level}
                </span>
              )}
            </div>
          ))}
          {gameState.players.length < 4 && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
              {t('ladder.waitingPlayers', { count: gameState.players.length })}
            </p>
          )}
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-relaxed">
          ⚖️ {t('ladder.handicapNote')}
        </p>

        {isHost ? (
          <button
            onClick={() => sendMessage({ type: 'start_game' })}
            disabled={gameState.players.length < 2}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            <Play className="w-4 h-4" /> {t('ladder.startGame')}
          </button>
        ) : (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t('ladder.waitingHost')}</p>
        )}
      </div>
    )
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-4 space-y-4">
      {/* Turn banner */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={leaveRoom} aria-label={t('ladder.back')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className={`flex-1 text-center py-2 px-3 rounded-xl text-sm font-bold ${
          isMyTurn
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {gameState.finalRound && <span className="mr-1.5">🏁</span>}
          {isMyTurn
            ? t('ladder.yourTurn')
            : t('ladder.playerTurn', { name: currentTurnPlayer?.username ?? '…' })}
        </div>
        {connectionStatus === 'reconnecting' && (
          // Sebelumnya hanya spinner: user screen-reader tak tahu koneksinya putus.
          <span role="status" className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('ladder.reconnecting')}
          </span>
        )}
      </div>

      {/* Board */}
      {gameState.board && (
        <Board
          board={gameState.board}
          players={gameState.players}
          turnOrder={gameState.turnOrder}
          currentTurnUid={gameState.currentTurnUid}
        />
      )}

      {/* Action strip: roll / dice / status */}
      <div className="min-h-[72px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isMyTurn && gameState.awaitingRoll && (
            <motion.button
              key="roll"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              onClick={() => sendMessage({ type: 'roll' })}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-2xl flex items-center gap-2 shadow-glow transition-colors">
              <Dice5 className="w-5 h-5" /> {t('ladder.roll')}
            </motion.button>
          )}
          {!isMyTurn && gameState.awaitingRoll && (
            <motion.p key="wait-roll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm text-gray-500 dark:text-gray-400">
              {t('ladder.waitingRoll', { name: currentTurnPlayer?.username ?? '…' })}
            </motion.p>
          )}
          {gameState.dice && !gameState.question && !gameState.questionWait && !gameState.answerResult && (
            <motion.div key="dice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DiceRoll value={gameState.dice.value} />
            </motion.div>
          )}
          {gameState.questionWait && gameState.questionWait.userId !== myId && (
            <motion.div key="qwait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
              {t('ladder.answering', {
                name: gameState.questionWait.username,
                level: gameState.questionWait.hskLevel,
              })}
            </motion.div>
          )}
          {gameState.answerResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`text-center px-4 py-2 rounded-xl text-sm font-semibold ${
                gameState.answerResult.correct
                  ? 'bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-300'
                  : 'bg-error-50 dark:bg-error-950/40 text-error-700 dark:text-error-300'
              }`}>
              {gameState.answerResult.correct ? '✓' : '✗'}{' '}
              <span className="font-chinese">{gameState.answerResult.reveal}</span>
              {gameState.answerResult.fast && <span className="ml-1.5">⚡ {t('ladder.fastBonus')}</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Streak bonus toast */}
      <AnimatePresence>
        {gameState.streakBonusUid !== null && (
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-sm font-bold text-amber-600 dark:text-amber-400">
            🔥 {t('ladder.streakBonus', {
              name: gameState.players.find(p => p.user_id === gameState.streakBonusUid)?.username ?? '',
            })}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Player strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {gameState.players.map(p => (
          <div key={p.user_id}
            className={`rounded-xl border p-2 text-center ${
              p.user_id === gameState.currentTurnUid
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/40'
                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-card'
            } ${p.forfeited || !p.connected ? 'opacity-50' : ''}`}>
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${tokenColor(p.user_id, gameState.turnOrder)}`} />
            <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100 truncate">{p.username}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {t('ladder.tile')} {p.position} · HSK {p.hsk_level}
              {p.streak >= 2 && <span> · 🔥{p.streak}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* My question modal */}
      <AnimatePresence>
        {gameState.question && (
          <QuestionModal
            question={gameState.question}
            onAnswer={idx => sendMessage({ type: 'answer', index: idx })}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

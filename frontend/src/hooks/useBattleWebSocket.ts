import { useCallback, useEffect, useRef, useState } from 'react'

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  .replace(/^http/, 'ws')

// ---------------------------------------------------------------------------
// Message types mirroring backend protocol
// ---------------------------------------------------------------------------
export interface PlayerInfo {
  user_id: number
  username: string
  profile_picture: string | null
  lives: number
  score: number
  team: 'A' | 'B' | null
  answered: boolean
  eliminated: boolean
  result?: 'correct' | 'wrong' | 'eliminated'
  active_effects: Record<string, number>
  inventory: string[]
}

export interface BattleQuestion {
  id: number
  index: number
  total: number
  time_limit: number
  starting_lives: number
  // 6 question types
  question_type:
  | 'multiple_choice'
  | 'character_match'
  | 'pinyin_match'
  | 'tone_select'
  | 'sentence_blank'
  | 'definition_match'
  chinese: string
  pinyin: string
  english: string
  options: string[]
  hsk_level: number
  correct_answer: null // always null while question is live
  // Extra fields for specific types
  prompt_label?: string
  bare_syllable?: string
  display_sentence?: string
  definition_clue?: string
}

export interface BuffEvent {
  targetUserId: number
  targetUsername: string
  effectId: string
  effectName: string
  effectEmoji: string
  isBuff: boolean
  description: string
  durationRounds: number
}

export type GamePhase =
  | 'lobby'
  | 'countdown'
  | 'question'
  | 'reveal'
  | 'game_over'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed'

export interface GameState {
  phase: GamePhase
  roomCode: string | null
  mode: 'battle_royale' | 'team_vs_team' | null
  hostId: number | null
  players: PlayerInfo[]
  currentQuestion: BattleQuestion | null
  startingLives: number
  revealData: {
    correctAnswer: number
    correctText: string
    players: PlayerInfo[]
  } | null
  gameOverData: {
    mode: string
    winner?: PlayerInfo
    winningTeam?: string
    teamScores?: Record<string, number>
    finalScores: PlayerInfo[]
  } | null
  countdownSeconds: number | null
  answeredUserIds: number[]
  buffEvent: BuffEvent | null
  error: string | null
  playAgainVotes: number[]
}

const INITIAL_STATE: GameState = {
  phase: 'lobby',
  roomCode: null,
  mode: null,
  hostId: null,
  players: [],
  currentQuestion: null,
  startingLives: 3,
  revealData: null,
  gameOverData: null,
  countdownSeconds: null,
  answeredUserIds: [],
  buffEvent: null,
  error: null,
  playAgainVotes: [],
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useBattleWebSocket(roomCode: string | null) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  const stoppedRef = useRef(false)
  const retryCountRef = useRef(0)
  const buffClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!roomCode) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    stoppedRef.current = false
    retryCountRef.current = 0

    const url = `${WS_BASE}/battle/ws/${roomCode}?token=${token}`

    const openWs = () => {
      setConnectionStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting')

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        // Heartbeat: send ping every 30s to prevent idle disconnect
        const ping = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
          else clearInterval(ping)
        }, 30_000)
          ; (ws as WebSocket & { _ping?: ReturnType<typeof setInterval> })._ping = ping
      }

      ws.onclose = () => {
        const pingId = (ws as WebSocket & { _ping?: ReturnType<typeof setInterval> })._ping
        if (pingId) clearInterval(pingId)
        wsRef.current = null
        if (!stoppedRef.current && retryCountRef.current < 5) {
          // Show reconnecting (not failed) if we're about to retry
          setConnectionStatus('reconnecting')
          retryCountRef.current++
          setTimeout(openWs, 2000)
        } else {
          setConnectionStatus(stoppedRef.current ? 'idle' : 'failed')
        }
      }

      ws.onerror = () => { setConnectionStatus('failed') }

      ws.onmessage = (event) => {
        let msg: Record<string, unknown>
        try {
          msg = JSON.parse(event.data as string)
        } catch {
          return
        }

        const type = msg.type as string

        setGameState((prev) => {
          switch (type) {
            case 'lobby_update':
              return {
                ...prev,
                phase: (msg.state as GamePhase) ?? 'lobby',
                roomCode: msg.room_code as string,
                mode: msg.mode as GameState['mode'],
                hostId: msg.host_id as number,
                players: (msg.players as PlayerInfo[]) ?? [],
                error: null,
              }

            case 'countdown':
              return {
                ...prev,
                phase: 'countdown',
                countdownSeconds: msg.seconds as number,
              }

            case 'question':
              return {
                ...prev,
                phase: 'question',
                currentQuestion: msg as unknown as BattleQuestion,
                startingLives: (msg.starting_lives as number) ?? prev.startingLives,
                revealData: null,
                countdownSeconds: null,
                answeredUserIds: [],
                buffEvent: null,
                error: null,
              }

            case 'player_answered':
              return {
                ...prev,
                answeredUserIds: [...prev.answeredUserIds, msg.user_id as number],
              }

            case 'reveal':
              return {
                ...prev,
                phase: 'reveal',
                revealData: {
                  correctAnswer: msg.correct_answer as number,
                  correctText: msg.correct_text as string,
                  players: (msg.players as PlayerInfo[]) ?? [],
                },
                players: (msg.players as PlayerInfo[]) ?? prev.players,
              }

            case 'buff_event': {
              const buffEvt: BuffEvent = {
                targetUserId: msg.target_user_id as number,
                targetUsername: msg.target_username as string,
                effectId: msg.effect_id as string,
                effectName: msg.effect_name as string,
                effectEmoji: msg.effect_emoji as string,
                isBuff: msg.is_buff as boolean,
                description: msg.description as string,
                durationRounds: msg.duration_rounds as number,
              }
              // Auto-clear after 4s (will be done in component too, but state needs clearing)
              if (buffClearRef.current) clearTimeout(buffClearRef.current)
              buffClearRef.current = setTimeout(() => {
                setGameState(s => ({ ...s, buffEvent: null }))
              }, 4500)
              return {
                ...prev,
                buffEvent: buffEvt,
                players: (msg.players as PlayerInfo[]) ?? prev.players,
              }
            }

            case 'game_over':
              return {
                ...prev,
                phase: 'game_over',
                gameOverData: {
                  mode: msg.mode as string,
                  winner: msg.winner as PlayerInfo | undefined,
                  winningTeam: msg.winning_team as string | undefined,
                  teamScores: msg.team_scores as Record<string, number> | undefined,
                  finalScores: (msg.final_scores as PlayerInfo[]) ?? [],
                },
              }

            case 'kicked':
              return { ...INITIAL_STATE, error: 'You were kicked from the room' }

            case 'play_again_vote_update':
              return { ...prev, playAgainVotes: (msg.votes as number[]) ?? [] }

            case 'error':
              return { ...prev, error: msg.message as string }

            default:
              return prev
          }
        })
      }
    }

    openWs()
  }, [roomCode])

  useEffect(() => {
    if (roomCode) connect()
    return () => {
      stoppedRef.current = true
      wsRef.current?.close()
      wsRef.current = null
      if (buffClearRef.current) clearTimeout(buffClearRef.current)
    }
  }, [roomCode, connect])

  const sendMessage = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const disconnect = useCallback(() => {
    stoppedRef.current = true
    retryCountRef.current = 99
    wsRef.current?.close()
    wsRef.current = null
    setConnectionStatus('idle')
    setGameState(INITIAL_STATE)
  }, [])

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    gameState,
    sendMessage,
    disconnect,
  }
}

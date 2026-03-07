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
}

export interface BattleQuestion {
  id: number
  index: number
  total: number
  time_limit: number
  question_type: 'multiple_choice' | 'character_match'
  chinese: string
  pinyin: string
  english: string
  options: string[]
  correct_answer: null   // always null while question is live
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
  error: string | null
}

const INITIAL_STATE: GameState = {
  phase: 'lobby',
  roomCode: null,
  mode: null,
  hostId: null,
  players: [],
  currentQuestion: null,
  revealData: null,
  gameOverData: null,
  countdownSeconds: null,
  answeredUserIds: [],
  error: null,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useBattleWebSocket(roomCode: string | null) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  // stoppedRef: true = don't reconnect (unmounted or intentionally left)
  const stoppedRef = useRef(false)
  const retryCountRef = useRef(0)

  const connect = useCallback(() => {
    if (!roomCode) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    // Fresh connect: reset stop flag and retry counter
    stoppedRef.current = false
    retryCountRef.current = 0

    const url = `${WS_BASE}/battle/ws/${roomCode}?token=${token}`

    const openWs = () => {
      setConnectionStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting')

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
      }

      ws.onclose = () => {
        setConnectionStatus(stoppedRef.current ? 'idle' : 'failed')
        wsRef.current = null
        // Retry up to 2 times unless intentionally stopped
        if (!stoppedRef.current && retryCountRef.current < 2) {
          retryCountRef.current++
          setTimeout(openWs, 1500)
        }
      }

      ws.onerror = () => {
        setConnectionStatus('failed')
      }

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
                revealData: null,
                countdownSeconds: null,
                answeredUserIds: [],
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
      // Mark stopped so onclose won't retry — but don't set retryCountRef here
      // so that a fresh connect() (new roomCode) can still retry
      stoppedRef.current = true
      wsRef.current?.close()
      wsRef.current = null
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

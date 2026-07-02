import { useCallback, useEffect, useRef, useState } from 'react'

import { API_URL } from '@/lib/env'
const WS_BASE = API_URL.replace(/^http/, 'ws') // http→ws, https→wss

// ---------------------------------------------------------------------------
// Message types mirroring backend/routers/ladder.py protocol
// ---------------------------------------------------------------------------
export interface LadderPlayer {
  user_id: number
  username: string
  profile_picture: string | null
  hsk_level: number
  position: number
  streak: number
  correct_count: number
  wrong_count: number
  forfeited: boolean
  finished: boolean
  connected: boolean
}

export interface LadderBoard {
  size: number
  ladders: Record<string, number> // start tile → end tile (up)
  snakes: Record<string, number>  // start tile → end tile (down)
}

export type QuestionContext = 'main' | 'ladder' | 'snake'

export interface LadderQuestion {
  context: QuestionContext
  question_type: 'meaning_mcq' | 'char_mcq' | 'pinyin_mcq'
  prompt: string
  prompt_hint: string | null
  prompt_label: string
  options: string[]
  hsk_level: number
  time_limit: number
}

export interface AnswerResult {
  user_id: number
  context: QuestionContext
  correct: boolean
  answered: boolean
  correct_answer: number
  correct_text: string
  reveal: string
  fast: boolean
  elapsed: number
}

export interface MoveEvent {
  user_id: number
  from: number
  to: number
  dice: number
  via: { kind: 'ladder' | 'snake'; from: number; to: number } | null
}

export interface Placement extends LadderPlayer {
  place: number
  accuracy: number
  xp_earned: number
}

export type LadderPhase = 'lobby' | 'playing' | 'game_over'
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed'

export interface LadderGameState {
  phase: LadderPhase
  roomCode: string | null
  hostId: number | null
  boardSize: number
  board: LadderBoard | null
  players: LadderPlayer[]
  turnOrder: number[]
  currentTurnUid: number | null
  awaitingRoll: boolean
  dice: { userId: number; value: number } | null
  question: LadderQuestion | null // only set for THIS client (its own level)
  questionWait: { userId: number; username: string; context: QuestionContext; hskLevel: number } | null
  answerResult: AnswerResult | null
  lastMove: MoveEvent | null
  tileEvent: { userId: number; tile: 'ladder' | 'snake'; at: number; target: number } | null
  streakBonusUid: number | null
  finalRound: boolean
  placements: Placement[] | null
  rematchVotes: number[]
  error: string | null
}

const INITIAL_STATE: LadderGameState = {
  phase: 'lobby',
  roomCode: null,
  hostId: null,
  boardSize: 50,
  board: null,
  players: [],
  turnOrder: [],
  currentTurnUid: null,
  awaitingRoll: false,
  dice: null,
  question: null,
  questionWait: null,
  answerResult: null,
  lastMove: null,
  tileEvent: null,
  streakBonusUid: null,
  finalRound: false,
  placements: null,
  rematchVotes: [],
  error: null,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useLadderWebSocket(roomCode: string | null) {
  const [gameState, setGameState] = useState<LadderGameState>(INITIAL_STATE)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  const stoppedRef = useRef(false)
  const retryCountRef = useRef(0)

  const connect = useCallback(() => {
    if (!roomCode) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    stoppedRef.current = false
    retryCountRef.current = 0

    const url = `${WS_BASE}/ladder/ws/${roomCode}?token=${token}`

    const openWs = () => {
      setConnectionStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting')

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        const ping = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
          else clearInterval(ping)
        }, 30_000)
        ;(ws as WebSocket & { _ping?: ReturnType<typeof setInterval> })._ping = ping
      }

      ws.onclose = () => {
        const pingId = (ws as WebSocket & { _ping?: ReturnType<typeof setInterval> })._ping
        if (pingId) clearInterval(pingId)
        wsRef.current = null
        if (!stoppedRef.current && retryCountRef.current < 5) {
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
            case 'room_state': // full resync on join/rejoin
              return {
                ...prev,
                phase: (msg.state as LadderPhase) ?? 'lobby',
                roomCode: msg.room_code as string,
                hostId: msg.host_id as number,
                board: msg.board as LadderBoard,
                boardSize: (msg.board as LadderBoard)?.size ?? prev.boardSize,
                players: (msg.players as LadderPlayer[]) ?? [],
                turnOrder: (msg.turn_order as number[]) ?? [],
                currentTurnUid: (msg.current_turn_uid as number | null) ?? null,
              }

            case 'lobby_update':
              return {
                ...prev,
                phase: (msg.state as LadderPhase) ?? 'lobby',
                roomCode: msg.room_code as string,
                hostId: msg.host_id as number,
                boardSize: (msg.board_size as number) ?? prev.boardSize,
                players: (msg.players as LadderPlayer[]) ?? [],
                // Reset stale game data when back in lobby (rematch)
                ...(msg.state === 'lobby' ? {
                  placements: null, rematchVotes: [], dice: null, question: null,
                  questionWait: null, answerResult: null, lastMove: null,
                  tileEvent: null, finalRound: false, currentTurnUid: null,
                  awaitingRoll: false, error: null,
                } : {}),
              }

            case 'game_started':
              return {
                ...prev,
                phase: 'playing',
                board: msg.board as LadderBoard,
                boardSize: (msg.board as LadderBoard).size,
                turnOrder: (msg.turn_order as number[]) ?? [],
                players: (msg.players as LadderPlayer[]) ?? prev.players,
                placements: null,
                error: null,
              }

            case 'turn_start':
              return {
                ...prev,
                currentTurnUid: msg.user_id as number,
                awaitingRoll: true,
                dice: null,
                question: null,
                questionWait: null,
                answerResult: null,
                tileEvent: null,
                streakBonusUid: null,
                finalRound: (msg.final_round as boolean) ?? prev.finalRound,
              }

            case 'dice_result':
              return {
                ...prev,
                awaitingRoll: false,
                dice: { userId: msg.user_id as number, value: msg.dice as number },
              }

            case 'question':
              return {
                ...prev,
                question: msg as unknown as LadderQuestion,
                answerResult: null,
              }

            case 'question_wait':
              return {
                ...prev,
                questionWait: {
                  userId: msg.user_id as number,
                  username: msg.username as string,
                  context: msg.context as QuestionContext,
                  hskLevel: msg.hsk_level as number,
                },
              }

            case 'answer_result':
              return {
                ...prev,
                question: null,
                questionWait: null,
                answerResult: msg as unknown as AnswerResult,
              }

            case 'move':
              return {
                ...prev,
                lastMove: {
                  user_id: msg.user_id as number,
                  from: msg.from as number,
                  to: msg.to as number,
                  dice: msg.dice as number,
                  via: msg.via as MoveEvent['via'],
                },
                players: (msg.players as LadderPlayer[]) ?? prev.players,
              }

            case 'tile_event':
              return {
                ...prev,
                tileEvent: {
                  userId: msg.user_id as number,
                  tile: msg.tile as 'ladder' | 'snake',
                  at: msg.at as number,
                  target: msg.target as number,
                },
              }

            case 'streak_bonus':
              return { ...prev, streakBonusUid: msg.user_id as number }

            case 'turn_skipped':
              return {
                ...prev,
                awaitingRoll: false,
                players: (msg.players as LadderPlayer[]) ?? prev.players,
              }

            case 'player_finished':
              return { ...prev, players: (msg.players as LadderPlayer[]) ?? prev.players }

            case 'final_round':
              return { ...prev, finalRound: true }

            case 'game_over':
              return {
                ...prev,
                phase: 'game_over',
                placements: (msg.placements as Placement[]) ?? [],
                question: null,
                questionWait: null,
                currentTurnUid: null,
                awaitingRoll: false,
              }

            case 'rematch_vote_update':
              return { ...prev, rematchVotes: (msg.votes as number[]) ?? [] }

            case 'player_left':
            case 'player_rejoined':
              return {
                ...prev,
                hostId: (msg.host_id as number) ?? prev.hostId,
                players: (msg.players as LadderPlayer[]) ?? prev.players,
              }

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

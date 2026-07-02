import { motion } from 'framer-motion'
import { LadderBoard, LadderPlayer } from '@/hooks/useLadderWebSocket'

const TOKEN_COLORS = ['bg-indigo-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500']
const COLS = 10

/** Serpentine grid position for a 1-based tile. Returns { col, rowFromTop } (0-based). */
function tilePos(tile: number, size: number): { col: number; rowFromTop: number } {
  const rows = size / COLS
  const rowFromBottom = Math.floor((tile - 1) / COLS)
  const idxInRow = (tile - 1) % COLS
  const col = rowFromBottom % 2 === 0 ? idxInRow : COLS - 1 - idxInRow
  return { col, rowFromTop: rows - 1 - rowFromBottom }
}

/** Center of a tile as percentages of board width/height. */
function tileCenter(tile: number, size: number): { x: number; y: number } {
  const rows = size / COLS
  const { col, rowFromTop } = tilePos(tile, size)
  return { x: ((col + 0.5) / COLS) * 100, y: ((rowFromTop + 0.5) / rows) * 100 }
}

export function tokenColor(uid: number, turnOrder: number[]): string {
  const idx = turnOrder.indexOf(uid)
  return TOKEN_COLORS[(idx >= 0 ? idx : 0) % TOKEN_COLORS.length]
}

export default function Board({ board, players, turnOrder, currentTurnUid }: {
  board: LadderBoard
  players: LadderPlayer[]
  turnOrder: number[]
  currentTurnUid: number | null
}) {
  const size = board.size
  const rows = size / COLS
  const tiles = Array.from({ length: size }, (_, i) => i + 1)
  const ladderStarts = new Set(Object.keys(board.ladders).map(Number))
  const snakeStarts = new Set(Object.keys(board.snakes).map(Number))

  // Group players per tile so shared tiles fan tokens out
  const byTile = new Map<number, LadderPlayer[]>()
  players.forEach(p => {
    const t = Math.max(0, Math.min(p.position, size))
    if (t > 0) byTile.set(t, [...(byTile.get(t) ?? []), p])
  })

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: `${COLS} / ${rows}` }}>
      {/* Tiles */}
      <div
        className="absolute inset-0 grid rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {tiles.map(tile => {
          const { col, rowFromTop } = tilePos(tile, size)
          const isEven = (col + rowFromTop) % 2 === 0
          return (
            <div
              key={tile}
              style={{ gridColumnStart: col + 1, gridRowStart: rowFromTop + 1 }}
              className={`relative flex items-start justify-start p-0.5 sm:p-1 text-[8px] sm:text-[10px] font-semibold ${
                isEven
                  ? 'bg-white dark:bg-surface-card text-gray-400 dark:text-gray-500'
                  : 'bg-primary-50/60 dark:bg-primary-950/30 text-gray-400 dark:text-gray-500'
              } ${tile === size ? '!bg-amber-100 dark:!bg-amber-950/50' : ''}`}
            >
              {tile}
              {tile === size && <span className="absolute inset-0 flex items-center justify-center text-base sm:text-xl">🏁</span>}
              {ladderStarts.has(tile) && <span className="absolute bottom-0 right-0.5 text-[10px] sm:text-sm">🪜</span>}
              {snakeStarts.has(tile) && <span className="absolute bottom-0 right-0.5 text-[10px] sm:text-sm">🐍</span>}
            </div>
          )
        })}
      </div>

      {/* Ladder / snake connectors */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Object.entries(board.ladders).map(([from, to]) => {
          const a = tileCenter(Number(from), size)
          const b = tileCenter(to, size)
          return (
            <line key={`l${from}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 1.2" opacity="0.7" />
          )
        })}
        {Object.entries(board.snakes).map(([from, to]) => {
          const a = tileCenter(Number(from), size)
          const b = tileCenter(to, size)
          return (
            <line key={`s${from}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#dc2626" strokeWidth="1" strokeDasharray="1 1.5" opacity="0.6" />
          )
        })}
      </svg>

      {/* Player tokens */}
      {[...byTile.entries()].map(([tile, tilePlayers]) =>
        tilePlayers.map((p, i) => {
          const c = tileCenter(tile, size)
          const offset = (i - (tilePlayers.length - 1) / 2) * 3.2
          const isTurn = p.user_id === currentTurnUid
          return (
            <motion.div
              key={p.user_id}
              className={`absolute z-10 rounded-full border-2 border-white dark:border-gray-900 shadow-md ${tokenColor(p.user_id, turnOrder)} ${
                isTurn ? 'ring-2 ring-amber-400' : ''
              } ${p.forfeited ? 'opacity-30 grayscale' : ''}`}
              initial={false}
              animate={{ left: `${c.x + offset}%`, top: `${c.y}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}
              style={{
                width: 'clamp(10px, 3.2%, 18px)', height: 'clamp(10px, 3.2%, 18px)',
                transform: 'translate(-50%, -50%)',
              }}
              title={p.username}
            />
          )
        })
      )}
    </div>
  )
}

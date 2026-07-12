import { cn } from '@/lib/utils'

/** Single skeleton block. Add className for size + shape. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)} />
  )
}

/** Stats summary card placeholder — accent bar, title row, grid of stat blocks. */
export function StatsCardSkeleton({ blocks = 4, className }: { blocks?: number; className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-surface-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden', className)}>
      <div className="h-1.5 animate-pulse bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: blocks }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Exercise-session placeholder shown while a practice session is being
 * generated — progress bar, prompt card, and a grid of answer options.
 * Mirrors the hand-rolled skeleton on Flashcards so all Practice/Play
 * loading states look like one family.
 */
export function SessionSkeleton({ options = 4 }: { options?: number }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-2 rounded-full mb-6" />
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="h-1.5 animate-pulse bg-gray-200 dark:bg-gray-700" />
        <div className="p-8 sm:p-12 flex flex-col items-center gap-6">
          <Skeleton className="h-28 w-44 rounded-3xl" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: options }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/** Grid of tile buttons (topic pickers, mode choosers) while options load. */
export function TileGridSkeleton({ tiles = 6, className = 'grid grid-cols-2 sm:grid-cols-3 gap-2' }: { tiles?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: tiles }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}

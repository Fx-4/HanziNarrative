import { cn } from '@/lib/utils'

/** Single skeleton block. Add className for size + shape. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)} />
  )
}

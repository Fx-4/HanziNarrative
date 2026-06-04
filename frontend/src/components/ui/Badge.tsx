import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
        success: "bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-200",
        warning: "bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-200",
        error: "bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-200",
        info: "bg-info-100 text-info-800 dark:bg-info-900/40 dark:text-info-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>,
    VariantProps<typeof badgeVariants> {
  animated?: boolean
}

export function Badge({ className, variant, animated = true, ...props }: BadgeProps) {
  if (animated) {
    return (
      <motion.div
        className={cn(badgeVariants({ variant }), className)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        {...props}
      />
    )
  }

  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

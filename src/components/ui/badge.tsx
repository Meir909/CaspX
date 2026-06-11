import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/15 text-primary',
      success: 'bg-emerald-500/15 text-emerald-300',
      warning: 'bg-amber-400/15 text-amber-300',
      error: 'bg-rose-500/15 text-rose-300',
      secondary: 'bg-white/[0.06] text-slate-300',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border border-white/5 px-2.5 py-1 text-xs font-medium',
          variants[variant],
          className,
        )}
        {...props}
      />
    )
  },
)

Badge.displayName = 'Badge'

export { Badge }

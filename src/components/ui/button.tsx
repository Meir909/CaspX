import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default:
        'bg-gradient-to-r from-primary to-blue-500 text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] hover:from-blue-500 hover:to-primary',
      outline:
        'border border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.06]',
      ghost:
        'bg-white/[0.03] text-text-secondary hover:bg-white/[0.08] hover:text-white',
      destructive:
        'bg-rose-500/90 text-white hover:bg-rose-500',
      secondary:
        'bg-white/[0.04] text-white hover:bg-white/[0.08]',
    }

    const sizes = {
      default: 'h-11 px-4 py-2 text-sm',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-12 px-5 text-base',
      icon: 'h-10 w-10',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }

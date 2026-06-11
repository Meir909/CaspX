import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-12 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30',
      className,
    )}
    {...props}
  />
))

Select.displayName = 'Select'

export { Select }

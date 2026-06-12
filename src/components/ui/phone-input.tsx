import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatPhoneInput, normalizePhoneForApi } from '@/lib/forms'

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  name?: string
  id?: string
}

export function PhoneInput({
  value,
  onChange,
  className,
  placeholder = '777 777-77-77',
  name,
  id,
}: PhoneInputProps) {
  const formatted = formatPhoneInput(value)

  return (
    <div className={cn('flex h-12 items-center rounded-2xl border border-white/8 bg-white/[0.03] pr-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30', className)}>
      <div className="flex h-full items-center border-r border-white/8 px-4 text-sm font-medium text-white">
        +7
      </div>
      <Input
        id={id}
        name={name}
        value={formatted.value}
        onChange={(event) => {
          const next = formatPhoneInput(event.target.value)
          onChange(next.full)
        }}
        placeholder={placeholder}
        className="h-full border-0 bg-transparent px-4 focus:border-0 focus:ring-0"
        inputMode="numeric"
        autoComplete="tel"
      />
    </div>
  )
}

export function normalizePhoneValue(value: string) {
  return normalizePhoneForApi(value)
}

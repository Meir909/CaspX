import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/app/primitives'

export function LoadingList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SectionCard key={index}>
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-1/3 rounded-full bg-white/10" />
            <div className="h-4 w-2/3 rounded-full bg-white/10" />
            <div className="h-4 w-1/2 rounded-full bg-white/10" />
          </div>
        </SectionCard>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <SectionCard>
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-3 rounded-2xl bg-white/[0.04] p-3 text-text-secondary">
          <Inbox size={20} />
        </div>
        <div className="text-base font-medium">{title}</div>
        <div className="mt-2 max-w-[260px] text-sm leading-6 text-text-secondary">{description}</div>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </SectionCard>
  )
}

export function ErrorState({
  title = 'Не удалось загрузить данные',
  description = 'Попробуйте повторить запрос или обновить страницу.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <SectionCard>
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-3 rounded-2xl bg-rose-500/10 p-3 text-rose-300">
          <AlertCircle size={20} />
        </div>
        <div className="text-base font-medium">{title}</div>
        <div className="mt-2 max-w-[260px] text-sm leading-6 text-text-secondary">{description}</div>
        {onRetry ? (
          <Button className="mt-4" onClick={onRetry}>
            Повторить
          </Button>
        ) : null}
      </div>
    </SectionCard>
  )
}

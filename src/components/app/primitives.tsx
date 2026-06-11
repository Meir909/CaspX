import type { ReactNode } from 'react'
import { ChevronRight, Menu, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function AppLogo() {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-[1.65rem] font-semibold tracking-normal">
        Casp<span className="text-primary">X</span>
      </div>
      <div className="text-[11px] text-text-secondary">Мангистауская область</div>
    </div>
  )
}

export function UserAvatar({
  name,
  avatar,
  size = 'md',
}: {
  name?: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-2xl',
  }

  if (avatar) {
    return <img src={avatar} alt={name || 'avatar'} className={cn('rounded-[20px] object-cover', sizeClasses[size])} />
  }

  return (
    <div className={cn('flex items-center justify-center rounded-[20px] bg-primary/20 font-semibold text-primary', sizeClasses[size])}>
      {name?.charAt(0).toUpperCase() || 'U'}
    </div>
  )
}

export function PageIntro({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[1.7rem] font-semibold leading-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  value,
  label,
  delta,
  tone = 'blue',
}: {
  value: string
  label: string
  delta?: string
  tone?: 'blue' | 'violet' | 'green' | 'amber'
}) {
  const toneClasses = {
    blue: 'bg-primary/12 text-primary',
    violet: 'bg-violet-500/12 text-violet-300',
    green: 'bg-emerald-500/12 text-emerald-300',
    amber: 'bg-amber-500/12 text-amber-300',
  }

  return (
    <Card className="rounded-[22px] border-white/5 bg-[#0a1728] p-4 shadow-[0_20px_60px_rgba(2,8,23,0.35)]">
      <div className="text-[28px] font-semibold leading-none">{value}</div>
      <div className="mt-1 text-sm text-text-secondary">{label}</div>
      {delta ? (
        <div className={cn('mt-3 inline-flex rounded-full px-2 py-1 text-xs', toneClasses[tone])}>{delta}</div>
      ) : null}
    </Card>
  )
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('rounded-[22px] border-white/5 bg-[#0a1728] p-4 shadow-[0_20px_60px_rgba(2,8,23,0.35)]', className)}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-base font-medium">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </Card>
  )
}

export function RouteTimeline({
  items,
}: {
  items: Array<{ title: string; subtitle: string; color: 'blue' | 'violet' | 'amber' | 'green' | 'red' }>
}) {
  const colors = {
    blue: 'bg-primary shadow-[0_0_0_4px_rgba(37,99,235,0.15)]',
    violet: 'bg-violet-400 shadow-[0_0_0_4px_rgba(167,139,250,0.15)]',
    amber: 'bg-amber-400 shadow-[0_0_0_4px_rgba(250,204,21,0.15)]',
    green: 'bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]',
    red: 'bg-rose-400 shadow-[0_0_0_4px_rgba(251,113,133,0.15)]',
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-3">
          <div className="flex w-4 flex-col items-center">
            <div className={cn('mt-1 h-3.5 w-3.5 rounded-full', colors[item.color])} />
            {index < items.length - 1 ? <div className="mt-1 h-full w-px bg-white/10" /> : null}
          </div>
          <div className="pb-4">
            <div className="text-base font-medium">{item.title}</div>
            <div className="text-sm text-text-secondary">{item.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TruckIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-200 to-slate-400',
        compact ? 'h-20 w-24' : 'h-32 w-full',
      )}
    >
      <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-br from-slate-50 to-slate-300" />
      <div className="absolute bottom-6 left-[15%] h-10 w-[58%] rounded-xl bg-white shadow-inner" />
      <div className="absolute bottom-9 left-[10%] h-8 w-[18%] rounded-l-2xl rounded-r-lg bg-slate-700" />
      <div className="absolute bottom-[14px] left-[16%] h-5 w-5 rounded-full bg-slate-900 shadow-[0_0_0_4px_rgba(148,163,184,0.45)]" />
      <div className="absolute bottom-[14px] left-[56%] h-5 w-5 rounded-full bg-slate-900 shadow-[0_0_0_4px_rgba(148,163,184,0.45)]" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-black/5" />
    </div>
  )
}

export function BotBubble() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/25 to-primary/20 ring-1 ring-white/10">
      <div className="relative h-7 w-7 rounded-2xl bg-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
        <div className="absolute left-1.5 top-2 h-2 w-2 rounded-full bg-cyan-300" />
        <div className="absolute right-1.5 top-2 h-2 w-2 rounded-full bg-cyan-300" />
        <div className="absolute left-1/2 top-4 h-1.5 w-3 -translate-x-1/2 rounded-full bg-cyan-300/90" />
      </div>
    </div>
  )
}

export function MapCluster({
  nodes,
  showLegend = true,
}: {
  nodes: Array<{ id: string; label: string; x: number; y: number; status?: 'low' | 'medium' | 'high' }>
  showLegend?: boolean
}) {
  const colors = {
    low: 'bg-emerald-400',
    medium: 'bg-amber-400',
    high: 'bg-rose-400',
  }

  return (
    <div className="relative h-60 overflow-hidden rounded-[22px] border border-white/5 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_35%),linear-gradient(180deg,#071322_0%,#091728_100%)]">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)] [background-size:32px_32px]" />
      <svg className="absolute inset-0 h-full w-full">
        <path d="M70 135 C120 110 160 110 210 140 S290 182 342 156" fill="none" stroke="rgba(37,99,235,0.9)" strokeDasharray="6 6" strokeWidth="2.5" />
        <path d="M105 170 C165 125 230 120 295 95" fill="none" stroke="rgba(250,204,21,0.8)" strokeDasharray="6 6" strokeWidth="2.5" />
      </svg>
      {nodes.map((node) => (
        <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
          <div className={cn('h-3.5 w-3.5 rounded-full shadow-[0_0_0_4px_rgba(15,23,42,0.7)]', colors[node.status || 'medium'])} />
          <div className="mt-2 whitespace-nowrap text-xs text-slate-200">{node.label}</div>
        </div>
      ))}
      {showLegend ? (
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[11px] text-text-secondary">
          <LegendDot label="Свободно" tone="bg-emerald-400" />
          <LegendDot label="Средне" tone="bg-amber-400" />
          <LegendDot label="Перегружено" tone="bg-rose-400" />
        </div>
      ) : null}
    </div>
  )
}

function LegendDot({ label, tone }: { label: string; tone: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', tone)} />
      <span>{label}</span>
    </div>
  )
}

export function QuickMenuButton({ icon, label, active }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors',
        active ? 'border-primary/40 bg-primary/10 text-white' : 'border-white/5 bg-white/[0.03] text-text-secondary',
      )}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ProfileRow({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="mt-0.5 text-sm text-text-secondary">{description}</div>
      </div>
      <ChevronRight size={18} className="text-text-secondary" />
    </div>
  )
}

export function CarrierSummary({
  company,
  rating,
}: {
  company: string
  rating: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-lg font-semibold text-primary">AA</div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{company}</div>
        <div className="mt-1 flex items-center gap-1 text-sm text-amber-300">
          <Star size={14} fill="currentColor" />
          <span>{rating}</span>
        </div>
      </div>
    </div>
  )
}

export function MenuBadge() {
  return (
    <div className="rounded-full bg-white/5 p-2 text-text-secondary">
      <Menu size={18} />
    </div>
  )
}

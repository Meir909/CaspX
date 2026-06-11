import type { ReactNode } from 'react'
import { ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { AppLogo, SectionCard } from '@/components/app/primitives'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <AppLogo />
      </div>

      <SectionCard className="overflow-hidden border-primary/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_45%),linear-gradient(180deg,#091225_0%,#081120_100%)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight">{title}</h1>
            <p className="mt-2 max-w-[250px] text-sm leading-6 text-slate-300">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-primary/15 p-3 text-primary">
            <Truck size={20} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <InfoPill icon={<ShieldCheck size={14} />} label="Безопасно" />
          <InfoPill icon={<Sparkles size={14} />} label="Быстро" />
          <InfoPill icon={<Truck size={14} />} label="Логистика" />
        </div>
      </SectionCard>

      {children}
    </div>
  )
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
      {icon}
      <span>{label}</span>
    </div>
  )
}

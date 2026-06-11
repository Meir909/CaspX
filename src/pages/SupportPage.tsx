import { AlertTriangle, CircleHelp, MessageSquare, PhoneCall } from 'lucide-react'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { supportItems } from '@/data/mock'

const icons = {
  help: CircleHelp,
  chat: MessageSquare,
  alert: AlertTriangle,
  phone: PhoneCall,
}

export default function SupportPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Поддержка" subtitle="Быстрая связь с командой CaspX" />

      <SectionCard>
        <div className="space-y-2">
          {supportItems.map((item) => {
            const Icon = icons[item.icon]

            return (
              <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-white/[0.03] px-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-sm text-text-secondary">{item.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}

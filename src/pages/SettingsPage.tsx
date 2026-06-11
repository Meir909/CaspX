import { ChevronRight } from 'lucide-react'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { settingsItems } from '@/data/mock'

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Настройки" subtitle="Параметры приложения и пользовательские предпочтения" />

      <SectionCard>
        <div className="space-y-2">
          {settingsItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 text-sm text-text-secondary">{item.value}</div>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

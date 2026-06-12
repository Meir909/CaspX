import { AlertTriangle, CircleHelp, Mail, PhoneCall } from 'lucide-react'
import { PageIntro, SectionCard } from '@/components/app/primitives'

const supportItems = [
  {
    id: 'faq',
    title: 'Частые вопросы',
    description: 'Короткие ответы по регистрации, заказам, маршрутам и загрузке фотографий.',
    icon: CircleHelp,
  },
  {
    id: 'mail',
    title: 'Связаться с нами',
    description: 'support@caspx.kz',
    icon: Mail,
  },
  {
    id: 'issue',
    title: 'Сообщить о проблеме',
    description: 'Если экран не работает или backend вернул ошибку, напишите в поддержку.',
    icon: AlertTriangle,
  },
  {
    id: 'phone',
    title: 'Звонок в поддержку',
    description: '+7 700 123 45 67',
    icon: PhoneCall,
  },
]

export default function SupportPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Поддержка" subtitle="Быстрая связь с командой CaspX." />

      <SectionCard>
        <div className="space-y-2">
          {supportItems.map((item) => {
            const Icon = item.icon

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

import { useNavigate } from 'react-router-dom'
import { ArrowRight, Boxes, FilePlus2, Files, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { useAuthStore } from '@/store'

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const quickActions = user?.role === 'carrier' && user?.carrierStatus === 'approved'
    ? [
        { label: 'Кабинет', icon: Boxes, path: '/carrier' },
        { label: 'Заказы', icon: Files, path: '/carrier/orders' },
        { label: 'Транспорт', icon: Truck, path: '/carrier/transport' },
      ]
    : [
        { label: 'Создать', icon: FilePlus2, path: '/create-order' },
        { label: 'Мои заказы', icon: Files, path: '/orders' },
      ]

  return (
    <div className="space-y-4">
      <PageIntro
        title={user?.role === 'carrier' ? 'Рабочее место перевозчика' : 'CaspX'}
        subtitle={user?.role === 'carrier' ? 'Только живые данные и рабочие сценарии' : 'Создание и контроль заказов через backend'}
      />

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(user?.role === 'carrier' ? '/carrier/orders' : '/create-order')}
        className="w-full overflow-hidden rounded-[28px] border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),transparent_38%),linear-gradient(180deg,#091225_0%,#081120_100%)] p-5 text-left shadow-[0_24px_70px_rgba(2,8,23,0.45)]"
      >
        <div className="grid grid-cols-[1fr_128px] items-center gap-4">
          <div>
            <h2 className="text-[28px] font-semibold leading-tight">
              {user?.role === 'carrier' ? 'Открытые заказы' : 'Создать заказ'}
            </h2>
            <p className="mt-2 max-w-[220px] text-sm text-slate-300">
              {user?.role === 'carrier'
                ? 'Смотрите доступные заявки и работайте только с данными, пришедшими из backend.'
                : 'Создайте новую заявку и дальше отслеживайте ее в списке заказов.'}
            </p>
            <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
              <ArrowRight size={18} />
            </div>
          </div>
          <TruckIllustration />
        </div>
      </motion.button>

      <div className={`grid gap-2 ${quickActions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => navigate(action.path)}
              className="rounded-[18px] border border-white/5 bg-white/[0.03] px-2 py-4 text-center"
            >
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
              <div className="mt-2 text-[11px] leading-tight text-slate-200">{action.label}</div>
            </motion.button>
          )
        })}
      </div>

      <SectionCard title="Статус фронтенда">
        <div className="space-y-3 text-sm text-text-secondary">
          <p>В интерфейсе оставлены только сценарии, которые опираются на текущие backend endpoint'ы.</p>
          <p>Демо-разделы, фейковые уведомления, тестовые маршруты и искусственные подборки убраны из навигации.</p>
        </div>
      </SectionCard>

      <Button className="w-full" size="lg" onClick={() => navigate('/orders')}>
        Перейти к заказам
      </Button>
    </div>
  )
}

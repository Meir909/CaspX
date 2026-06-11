import { useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Bot, Map, Package, Ship } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  MapCluster,
  PageIntro,
  SectionCard,
  StatCard,
  TruckIllustration,
} from '@/components/app/primitives'
import { homeHighlights, loadMapNodes } from '@/data/mock'

export default function HomePage() {
  const navigate = useNavigate()

  const quickActions = [
    { label: 'Порт Актау', icon: Ship, path: '/port' },
    { label: 'Аналитика', icon: BarChart3, path: '/akimat' },
    { label: 'AI Assistant', icon: Bot, path: '/ai' },
    { label: 'Карта транзита', icon: Map, path: '/map' },
    { label: 'Мои заказы', icon: Package, path: '/orders' },
  ]

  return (
    <div className="space-y-4">
      <PageIntro title="Найти перевозчика" subtitle="Мониторинг логистики региона в одном окне" />

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/create-order')}
        className="w-full overflow-hidden rounded-[28px] border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),transparent_38%),linear-gradient(180deg,#091225_0%,#081120_100%)] p-5 text-left shadow-[0_24px_70px_rgba(2,8,23,0.45)]"
      >
        <div className="grid grid-cols-[1fr_128px] items-center gap-4">
          <div>
            <h2 className="text-[28px] font-semibold leading-tight">Найти перевозчика</h2>
            <p className="mt-2 max-w-[220px] text-sm text-slate-300">
              Оформите заявку и получите подбор перевозчиков по вашему маршруту.
            </p>
            <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
              <ArrowRight size={18} />
            </div>
          </div>
          <TruckIllustration />
        </div>
      </motion.button>

      <div className="grid grid-cols-5 gap-2">
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
              className="rounded-[18px] border border-white/5 bg-white/[0.03] px-2 py-3 text-center"
            >
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
              <div className="mt-2 text-[11px] leading-tight text-slate-200">{action.label}</div>
            </motion.button>
          )
        })}
      </div>

      <SectionCard title="Сейчас в регионе" action={<span className="text-xs text-text-secondary">Обновлено 2 мин назад</span>}>
        <div className="grid grid-cols-2 gap-3">
          {homeHighlights.map((item) => (
            <StatCard key={item.id} value={item.value} label={item.label} delta={item.delta} tone={item.tone} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Карта загруженности">
        <MapCluster nodes={loadMapNodes} />
      </SectionCard>

      <Button className="w-full" size="lg" onClick={() => navigate('/create-order')}>
        Создать новый заказ
      </Button>
    </div>
  )
}

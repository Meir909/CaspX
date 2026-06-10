import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Ship, BarChart3, Bot, Map as MapIcon, Package, Truck, Clock, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStats } from '@/hooks'

export default function HomePage() {
  const navigate = useNavigate()
  const { data: stats } = useStats()

  const quickActions = [
    { icon: <Ship size={32} />, label: 'Порт Актау', path: '/map', color: 'text-primary' },
    { icon: <BarChart3 size={32} />, label: 'Аналитика', path: '/ai', color: 'text-success' },
    { icon: <Bot size={32} />, label: 'AI Логист', path: '/ai', color: 'text-accent' },
    { icon: <MapIcon size={32} />, label: 'Карта транзита', path: '/map', color: 'text-warning' },
    { icon: <Package size={32} />, label: 'Мои заказы', path: '/orders', color: 'text-primary' }
  ]

  const statCards = [
    { label: 'Грузовики', value: stats?.trucks || 387, icon: <Truck size={24} />, color: 'text-primary' },
    { label: 'Суда', value: stats?.vessels || 26, icon: <Ship size={24} />, color: 'text-success' },
    { label: 'Активные грузы', value: stats?.activeCargos || 512, icon: <Package size={24} />, color: 'text-accent' },
    { label: 'Среднее ожидание', value: stats?.avgWaitTime || '2.1 ч', icon: <Clock size={24} />, color: 'text-warning' }
  ]

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-center cursor-pointer"
        onClick={() => navigate('/create-order')}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4">Найти перевозчика</h2>
          <p className="text-lg text-white/90 mb-6">Быстро подберем лучшего перевозчика для вашего груза</p>
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <ArrowRight size={32} className="ml-1" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-5 gap-3">
        {quickActions.map((action, i) => (
          <motion.button
            key={`${action.path}-${action.label}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-bg-card hover:bg-bg-secondary transition-colors"
          >
            <div className={action.color}>{action.icon}</div>
            <span className="text-xs text-center">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="p-5">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-3">
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Карта загруженности</h3>
              <p className="text-sm text-text-secondary">Реальное время</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/map')}>
              <Layers size={20} />
            </Button>
          </div>
          <div className="h-48 bg-bg-secondary relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-text-secondary">
                <MapIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>Открыть карту</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 w-4 h-4 bg-success rounded-full animate-pulse" />
            <div className="absolute top-12 right-12 w-4 h-4 bg-warning rounded-full animate-pulse" />
            <div className="absolute bottom-8 left-20 w-4 h-4 bg-error rounded-full animate-pulse" />
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

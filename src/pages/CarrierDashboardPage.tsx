import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Truck, Package, CheckCircle2, DollarSign, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrders, useCarriers } from '@/hooks'
import { cn } from '@/lib/utils'

export default function CarrierDashboardPage() {
  const navigate = useNavigate()
  const { data: orders } = useOrders()
  const { data: carriers } = useCarriers()

  const availableOrders = orders?.filter(o => o.status === 'searching')

  const stats = [
    { label: 'Активные заказы', value: '3', icon: <Package size={20} />, color: 'text-primary' },
    { label: 'Выполнено', value: '127', icon: <CheckCircle2 size={20} />, color: 'text-success' },
    { label: 'Заработок', value: '2.4M ₸', icon: <DollarSign size={20} />, color: 'text-accent' },
    { label: 'Рейтинг', value: '4.9', icon: <BarChart3 size={20} />, color: 'text-warning' }
  ]

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck size={24} className="text-primary" />
            Carrier Dashboard
          </h1>
          <p className="text-text-secondary">Управление перевозками</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-bg-card rounded-xl p-1">
        <button className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-medium">
          Обзор
        </button>
        <button
          onClick={() => navigate('/carrier/orders')}
          className="flex-1 py-2 rounded-xl text-text-secondary hover:text-white text-sm font-medium"
        >
          Доступные заказы
        </button>
        <button
          onClick={() => navigate('/carrier/transport')}
          className="flex-1 py-2 rounded-xl text-text-secondary hover:text-white text-sm font-medium"
        >
          Транспорт
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <CardContent className="p-0">
                <div className={cn('mb-3', stat.color)}>{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Доступные заказы{carriers ? ` · ${carriers.length} перевозчика в системе` : ''}</h2>
        <Button variant="ghost" onClick={() => navigate('/carrier/orders')}>
          Все
        </Button>
      </div>

      <div className="space-y-3">
        {availableOrders?.slice(0, 3).map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="p-5">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.from} → {order.to}</p>
                    <p className="text-sm text-text-secondary">{order.cargoType} • {order.weight} т</p>
                  </div>
                  <Badge variant="warning">Новый</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-primary">150 000 ₸</p>
                  <Button size="sm">Принять</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <Button
          onClick={() => navigate('/carrier/free-transport')}
          className="w-full"
          variant="secondary"
        >
          <Truck size={20} className="mr-2" />
          Опубликовать свободный транспорт
        </Button>
      </div>
    </div>
  )
}

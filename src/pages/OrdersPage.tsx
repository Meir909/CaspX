import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useOrders } from '@/hooks'

type OrderTab = 'all' | 'in_progress' | 'delivered' | 'cancelled'

const tabLabels: Record<OrderTab, string> = {
  all: 'Все',
  in_progress: 'В пути',
  delivered: 'Завершенные',
  cancelled: 'Отмененные',
}

const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'error' | 'secondary'> = {
  searching: 'warning',
  in_progress: 'default',
  delivered: 'success',
  cancelled: 'error',
  created: 'secondary',
  assigned: 'default',
}

const statusLabel: Record<string, string> = {
  searching: 'Идет поиск',
  in_progress: 'В пути',
  delivered: 'Завершен',
  cancelled: 'Отменен',
  created: 'Создан',
  assigned: 'Подтвержден',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders = [] } = useOrders()
  const [tab, setTab] = useState<OrderTab>('all')

  const filteredOrders = useMemo(() => {
    if (tab === 'all') return orders
    return orders.filter((order) => order.status === tab)
  }, [orders, tab])

  return (
    <div className="space-y-4">
      <PageIntro
        title="Мои заказы"
        subtitle={`${orders.length} заказа в системе`}
        action={
          <Button size="sm" onClick={() => navigate('/create-order')}>
            Новый
          </Button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(Object.keys(tabLabels) as OrderTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={
              tab === key
                ? 'rounded-full bg-primary/15 px-3 py-2 text-sm text-primary'
                : 'rounded-full bg-white/[0.04] px-3 py-2 text-sm text-text-secondary'
            }
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, index) => (
          <motion.div key={order.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
            <SectionCard>
              <button type="button" onClick={() => navigate(`/orders/${order.id}`)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">#{order.number}</div>
                    <div className="mt-1 text-sm text-text-secondary">
                      {order.from} → {order.to}
                    </div>
                  </div>
                  <Badge variant={statusBadge[order.status]}>{statusLabel[order.status]}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-text-secondary">
                  <div>{order.cargoType}</div>
                  <div className="text-right">{formatMoney(order.price)}</div>
                  <div>
                    {order.weight} т / {order.volume} м³
                  </div>
                  <div className="text-right">{new Date(order.pickupDate).toLocaleDateString('ru-RU')}</div>
                </div>
              </button>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

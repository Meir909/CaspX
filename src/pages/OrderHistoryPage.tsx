import { Badge } from '@/components/ui/badge'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { formatMoney, orders } from '@/data/mock'

export default function OrderHistoryPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="История заказов" subtitle="Архив выполненных и завершенных перевозок" />

      <div className="space-y-3">
        {orders.map((order) => (
          <SectionCard key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">
                  {order.from} → {order.to}
                </div>
                <div className="mt-1 text-sm text-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')} • {order.cargoType}
                </div>
              </div>
              <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'default'}>
                {order.status === 'delivered' ? 'Доставлен' : order.status === 'cancelled' ? 'Отменен' : 'В работе'}
              </Badge>
            </div>
            <div className="mt-4 text-sm text-text-secondary">{formatMoney(order.price)}</div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

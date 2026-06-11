import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useOrders } from '@/hooks'

export default function CarrierOrdersPage() {
  const { data: orders = [] } = useOrders()
  const availableOrders = orders.filter((order) => order.status === 'searching')

  return (
    <div className="space-y-4">
      <PageIntro title="Доступные заказы" subtitle={`${availableOrders.length} открытых заявок`} />

      <div className="space-y-3">
        {availableOrders.map((order) => (
          <SectionCard key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">
                  {order.from} → {order.to}
                </div>
                <div className="mt-1 text-sm text-text-secondary">
                  {order.weight} т • {order.volume} м³ • {order.transportType}
                </div>
              </div>
              <Badge variant="warning">Новый</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-semibold">{formatMoney(order.price)}</div>
              <Button size="sm">Принять заказ</Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useAssignOrder, useAvailableOrders } from '@/hooks'

export default function CarrierOrdersPage() {
  const ordersQuery = useAvailableOrders()
  const availableOrders = ordersQuery.data ?? []
  const assignOrder = useAssignOrder()

  return (
    <div className="space-y-4">
      <PageIntro title="Доступные заказы" subtitle={`${availableOrders.length} открытых заявок`} />

      {ordersQuery.isLoading ? (
        <LoadingList count={4} />
      ) : ordersQuery.isError ? (
        <ErrorState onRetry={() => void ordersQuery.refetch()} />
      ) : availableOrders.length === 0 ? (
        <EmptyState title="Нет открытых заявок" description="Когда заказчики создадут новые маршруты, они появятся здесь." />
      ) : (
        <div className="space-y-3">
          {availableOrders.map((order) => (
            <SectionCard key={order.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {order.from} → {order.to}
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {order.weight} т • {order.volume} м3 • {order.cargoType}
                  </div>
                </div>
                <Badge variant="warning">Новый</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold">{formatMoney(order.price)}</div>
                <Button size="sm" disabled={assignOrder.isPending} onClick={() => assignOrder.mutate(order.id)}>
                  {assignOrder.isPending && assignOrder.variables === order.id ? 'Назначаем...' : 'Принять заказ'}
                </Button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}

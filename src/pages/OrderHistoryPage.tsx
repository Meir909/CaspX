import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { useOrders } from '@/hooks'

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OrderHistoryPage() {
  const ordersQuery = useOrders()
  const completedOrders = (ordersQuery.data ?? []).filter((order) =>
    ['delivered', 'cancelled'].includes(order.status),
  )

  return (
    <div className="space-y-4">
      <PageIntro title="История заказов" subtitle="Архив выполненных и завершенных перевозок." />

      {ordersQuery.isLoading ? (
        <LoadingList count={3} />
      ) : ordersQuery.isError ? (
        <ErrorState onRetry={() => void ordersQuery.refetch()} />
      ) : completedOrders.length === 0 ? (
        <EmptyState title="Завершенных заказов пока нет" description="Когда в backend появятся доставленные или отмененные заявки, они отобразятся здесь." />
      ) : (
        <div className="space-y-3">
          {completedOrders.map((order) => (
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
                <Badge variant={order.status === 'delivered' ? 'success' : 'error'}>
                  {order.status === 'delivered' ? 'Доставлен' : 'Отменен'}
                </Badge>
              </div>
              <div className="mt-4 text-sm text-text-secondary">{formatMoney(order.price)}</div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}

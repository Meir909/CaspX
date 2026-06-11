import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useAvailableOrders, useUpdateOrder } from '@/hooks'

export default function CarrierOrdersPage() {
  const ordersQuery = useAvailableOrders()
  const availableOrders = ordersQuery.data ?? []
  const assignOrder = useUpdateOrder()

  return (
    <div className="space-y-4">
      <PageIntro title="Р”РѕСЃС‚СѓРїРЅС‹Рµ Р·Р°РєР°Р·С‹" subtitle={`${availableOrders.length} РѕС‚РєСЂС‹С‚С‹С… Р·Р°СЏРІРѕРє`} />

      {ordersQuery.isLoading ? (
        <LoadingList count={4} />
      ) : ordersQuery.isError ? (
        <ErrorState onRetry={() => void ordersQuery.refetch()} />
      ) : availableOrders.length === 0 ? (
        <EmptyState title="РќРµС‚ РѕС‚РєСЂС‹С‚С‹С… Р·Р°СЏРІРѕРє" description="РљРѕРіРґР° Р·Р°РєР°Р·С‡РёРєРё СЃРѕР·РґР°РґСѓС‚ РЅРѕРІС‹Рµ РјР°СЂС€СЂСѓС‚С‹, РѕРЅРё РїРѕСЏРІСЏС‚СЃСЏ Р·РґРµСЃСЊ." />
      ) : (
        <div className="space-y-3">
          {availableOrders.map((order) => (
            <SectionCard key={order.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {order.from} в†’ {order.to}
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {order.weight} С‚ вЂў {order.volume} Рј3 вЂў {order.cargoType}
                  </div>
                </div>
                <Badge variant="warning">РќРѕРІС‹Р№</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold">{formatMoney(order.price)}</div>
                <Button
                  size="sm"
                  disabled={assignOrder.isPending}
                  onClick={() => assignOrder.mutate({ id: order.id, data: { status: 'assigned' } })}
                >
                  {assignOrder.isPending && assignOrder.variables?.id === order.id ? 'РќР°Р·РЅР°С‡Р°РµРј...' : 'РџСЂРёРЅСЏС‚СЊ Р·Р°РєР°Р·'}
                </Button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}

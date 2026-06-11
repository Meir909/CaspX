import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, RouteTimeline, SectionCard } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useOrder } from '@/hooks'

export default function OrderDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const orderQuery = useOrder(id)
  const order = orderQuery.data

  return (
    <div className="space-y-4">
      <PageIntro
        title={order ? `Заказ №${order.number}` : 'Детали заказа'}
        subtitle={order ? `Создан ${new Date(order.createdAt).toLocaleString('ru-RU')}` : 'Параметры перевозки'}
      />

      {orderQuery.isLoading ? (
        <LoadingList count={4} />
      ) : orderQuery.isError ? (
        <ErrorState onRetry={() => void orderQuery.refetch()} />
      ) : !order ? (
        <EmptyState title="Заказ не найден" description="Попробуйте открыть заказ заново из списка активных заявок." />
      ) : (
        <>
          <SectionCard>
            <RouteTimeline items={order.routeStops || []} />
          </SectionCard>

          <SectionCard title="Статус">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Расчетное время прибытия</span>
                <span>{new Date(order.deliveryDate).toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Маршрут</span>
                <span>
                  {order.fromCountry}, {order.from} → {order.toCountry}, {order.to}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Тип груза</span>
                <span>{order.cargoType}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Вес груза</span>
                <span>{order.weight} тонн</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Объем груза</span>
                <span>{order.volume} м3</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Количество мест</span>
                <span>{order.places}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                <span className="text-text-secondary">Стоимость</span>
                <span>{formatMoney(order.price)}</span>
              </div>
            </div>
          </SectionCard>

          {order.cargoImages?.length ? (
            <SectionCard title="Фото товара">
              <div className="grid grid-cols-3 gap-3">
                {order.cargoImages.map((image, index) => (
                  <div key={`${index}-${image.slice(0, 20)}`} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
                    <img src={image} alt={`cargo-${index + 1}`} className="h-24 w-full object-cover" />
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {order.carrierId || order.carrierName || order.carrierEmail ? (
            <SectionCard title="Перевозчик">
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/[0.03] px-4 py-3">
                  <div className="text-sm text-text-secondary">Назначенный перевозчик</div>
                  <div className="mt-1 font-medium">{order.carrierName || 'Carrier assigned'}</div>
                  {order.carrierEmail ? <div className="mt-1 text-sm text-text-secondary">{order.carrierEmail}</div> : null}
                </div>
                <Button className="w-full" onClick={() => navigate(`/orders/${order.id}/tracking`)}>
                  Открыть отслеживание
                </Button>
              </div>
            </SectionCard>
          ) : null}
        </>
      )}
    </div>
  )
}

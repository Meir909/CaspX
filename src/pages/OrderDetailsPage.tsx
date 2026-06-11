import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CarrierSummary, PageIntro, RouteTimeline, SectionCard } from '@/components/app/primitives'
import { formatMoney, getCarrierById } from '@/data/mock'
import { useOrder } from '@/hooks'

export default function OrderDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: order } = useOrder(id)

  if (!order) {
    return (
      <SectionCard>
        <div className="text-sm text-text-secondary">Заказ не найден.</div>
      </SectionCard>
    )
  }

  const carrier = getCarrierById(order.carrierId)

  return (
    <div className="space-y-4">
      <PageIntro title={`Заказ №${order.number}`} subtitle={`Создан ${new Date(order.createdAt).toLocaleString('ru-RU')}`} />

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
            <span className="text-text-secondary">Тип груза</span>
            <span>{order.cargoType}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
            <span className="text-text-secondary">Вес груза</span>
            <span>{order.weight} тонн</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
            <span className="text-text-secondary">Объем груза</span>
            <span>{order.volume} м³</span>
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

      {carrier ? (
        <SectionCard title="Перевозчик">
          <div className="space-y-4">
            <CarrierSummary company={carrier.company || carrier.name} rating={carrier.rating} />
            <div className="text-sm text-text-secondary">Водитель: Алиев Р. • {carrier.phone}</div>
            <Button className="w-full" onClick={() => navigate(`/orders/${order.id}/tracking`)}>
              Связаться и отслеживать
            </Button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}

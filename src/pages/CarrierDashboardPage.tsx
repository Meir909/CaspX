import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard, StatCard, TruckIllustration } from '@/components/app/primitives'
import { formatMoney, vehicles } from '@/data/mock'
import { useOrders } from '@/hooks'

export default function CarrierDashboardPage() {
  const navigate = useNavigate()
  const { data: orders = [] } = useOrders()

  const availableOrders = orders.filter((order) => order.status === 'searching').slice(0, 3)

  return (
    <div className="space-y-4">
      <PageIntro title="Caspian Logistics" subtitle="Перевозчик • рейтинг 4.8" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard value="8" label="активных заказов" delta="+2" tone="blue" />
        <StatCard value="156" label="выполнено" delta="+12" tone="green" />
        <StatCard value="4.8" label="рейтинг" delta="стабильно" tone="amber" />
        <StatCard value="12 450 000 ₸" label="доход за месяц" delta="+18%" tone="violet" />
      </div>

      <SectionCard title="Активные заказы" action={<button type="button" onClick={() => navigate('/carrier/orders')} className="text-sm text-primary">Смотреть все</button>}>
        <div className="space-y-3">
          {availableOrders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-white/[0.03] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">№{order.number}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {order.from} → {order.to}
                  </div>
                </div>
                <span className="text-sm text-primary">В пути</span>
              </div>
              <div className="mt-3 text-sm text-text-secondary">{formatMoney(order.price)}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Мой автопарк" action={<button type="button" onClick={() => navigate('/carrier/transport')} className="text-sm text-primary">Смотреть все</button>}>
        <div className="space-y-3">
          {vehicles.slice(0, 2).map((vehicle) => (
            <div key={vehicle.id} className="grid grid-cols-[1fr_92px] items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
              <div>
                <div className="font-medium">{vehicle.type}</div>
                <div className="mt-1 text-sm text-text-secondary">
                  {vehicle.plate} • {vehicle.capacity} • {vehicle.volume}
                </div>
                <div className="mt-1 text-sm text-emerald-300">{vehicle.location}</div>
              </div>
              <TruckIllustration compact />
            </div>
          ))}
        </div>
      </SectionCard>

      <Button variant="secondary" className="w-full" onClick={() => navigate('/carrier/free-transport')}>
        Опубликовать свободный транспорт
      </Button>
    </div>
  )
}

import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MapCluster, PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { loadMapNodes } from '@/data/mock'
import { useOrder } from '@/hooks'

export default function OrderTrackingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: order } = useOrder(id)

  if (!order) {
    return (
      <SectionCard>
        <div className="text-sm text-text-secondary">Данные по маршруту не найдены.</div>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-4">
      <PageIntro title={`Отслеживание`} subtitle={`Заказ #${order.number}`} />

      <SectionCard title={`${order.from} → ${order.to}`} action={<span className="text-xs text-text-secondary">Обновлено 2 мин назад</span>}>
        <MapCluster nodes={loadMapNodes} showLegend={false} />
      </SectionCard>

      <SectionCard>
        <div className="grid grid-cols-[1fr_110px] items-center gap-4">
          <div>
            <div className="text-sm text-text-secondary">Текущее местоположение</div>
            <div className="mt-1 text-lg font-medium">На трассе А-33</div>
            <div className="mt-1 text-sm text-text-secondary">Мангистауская область</div>
          </div>
          <TruckIllustration compact />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
            <div className="text-xs text-text-secondary">Скорость</div>
            <div className="mt-1 font-medium">{order.speedLabel}</div>
          </div>
          <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
            <div className="text-xs text-text-secondary">Пройдено</div>
            <div className="mt-1 font-medium">{order.progressLabel}</div>
          </div>
          <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
            <div className="text-xs text-text-secondary">Осталось</div>
            <div className="mt-1 font-medium">{order.remainingLabel}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Статус доставки">
        <div className="space-y-4">
          {(order.trackingEvents || []).map((event) => (
            <div key={`${event.time}-${event.title}`} className="flex gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_rgba(37,99,235,0.15)]" />
              <div>
                <div className="text-sm text-text-secondary">{event.time}</div>
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-text-secondary">{event.location}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Button className="w-full" onClick={() => navigate('/orders')}>
        Обновить статус
      </Button>
    </div>
  )
}

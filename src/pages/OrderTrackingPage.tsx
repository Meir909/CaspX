import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, RouteTimeline, SectionCard } from '@/components/app/primitives'
import { useCalculatedRoute, useOrder, useTrackingTimeline } from '@/hooks'
import type { CalculatedRoute, TrackingEvent } from '@/types'

const statusLabels: Record<TrackingEvent['status'], string> = {
  created: 'Создан',
  searching: 'Идет поиск',
  assigned: 'Назначен перевозчик',
  in_progress: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}

export default function OrderTrackingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const orderQuery = useOrder(id)
  const routeQuery = useCalculatedRoute(id)
  const trackingQuery = useTrackingTimeline(id)
  const order = orderQuery.data

  const trackingItems = trackingQuery.data?.tracking ?? []
  const currentStatus = trackingQuery.data?.currentStatus
  const route = routeQuery.data

  return (
    <div className="space-y-4">
      <PageIntro title="Отслеживание" subtitle={order ? `Заказ #${order.number}` : 'Маршрут доставки'} />

      {orderQuery.isLoading ? (
        <LoadingList count={3} />
      ) : orderQuery.isError ? (
        <ErrorState onRetry={() => void orderQuery.refetch()} />
      ) : !order ? (
        <EmptyState title="Маршрут не найден" description="Попробуйте открыть заказ заново из списка активных заявок." />
      ) : (
        <>
          <SectionCard title={`${order.from} → ${order.to}`} action={<span className="text-xs text-emerald-300">Live route</span>}>
            {routeQuery.isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-52 rounded-[22px] bg-white/5" />
                <div className="h-4 w-2/3 rounded-full bg-white/10" />
              </div>
            ) : route ? (
              <RouteGeometryCard route={route} />
            ) : (
              <div className="space-y-3">
                <RouteTimeline items={order.routeStops || []} />
                <div className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  Не удалось получить геометрию маршрута от backend. Проверьте, что у заказа есть координаты и сервис маршрутизации доступен.
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Параметры маршрута">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
                <div className="text-xs text-text-secondary">Статус</div>
                <div className="mt-1 font-medium">{currentStatus ? statusLabels[currentStatus] : statusLabels[order.status]}</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
                <div className="text-xs text-text-secondary">Дистанция</div>
                <div className="mt-1 font-medium">{route ? `${route.distanceKm.toFixed(1)} км` : order.progressLabel}</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
                <div className="text-xs text-text-secondary">Время</div>
                <div className="mt-1 font-medium">{route ? formatDuration(route.durationMinutes) : order.remainingLabel}</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Статус доставки">
            {trackingQuery.isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 rounded-2xl bg-white/5" />
                <div className="h-16 rounded-2xl bg-white/5" />
              </div>
            ) : trackingQuery.isError ? (
              <ErrorState
                title="Не удалось загрузить timeline"
                description={trackingQuery.error instanceof Error ? trackingQuery.error.message : 'Повторите запрос позже.'}
                onRetry={() => void trackingQuery.refetch()}
              />
            ) : trackingItems.length === 0 ? (
              <EmptyState title="Событий пока нет" description="Как только перевозчик начнет отправлять tracking-события, они появятся здесь." />
            ) : (
              <div className="space-y-4">
                {trackingItems.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="mt-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_rgba(37,99,235,0.15)]" />
                    <div>
                      <div className="text-sm text-text-secondary">{new Date(event.timestamp).toLocaleString('ru-RU')}</div>
                      <div className="font-medium">{statusLabels[event.status]}</div>
                      <div className="text-sm text-text-secondary">{event.location || 'Локация не указана'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <Button className="w-full" onClick={() => navigate('/orders')}>
            Назад к заказам
          </Button>
        </>
      )}
    </div>
  )
}

function RouteGeometryCard({ route }: { route: CalculatedRoute }) {
  const points = useMemo(() => {
    const coordinates = route.geometry.coordinates
    if (!coordinates.length) return []

    const lngValues = coordinates.map(([lng]) => lng)
    const latValues = coordinates.map(([, lat]) => lat)
    const minLng = Math.min(...lngValues)
    const maxLng = Math.max(...lngValues)
    const minLat = Math.min(...latValues)
    const maxLat = Math.max(...latValues)
    const width = Math.max(maxLng - minLng, 0.001)
    const height = Math.max(maxLat - minLat, 0.001)

    return coordinates.map(([lng, lat]) => {
      const x = 24 + ((lng - minLng) / width) * 272
      const y = 24 + (1 - (lat - minLat) / height) * 152
      return [x, y] as [number, number]
    })
  }, [route.geometry.coordinates])

  const linePath = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const start = points[0]
  const end = points[points.length - 1]

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[22px] border border-white/5 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_35%),linear-gradient(180deg,#071322_0%,#091728_100%)]">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)] [background-size:32px_32px]" />
        <svg viewBox="0 0 320 200" className="relative h-52 w-full">
          {linePath ? <path d={linePath} fill="none" stroke="rgba(59,130,246,0.95)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {start ? <circle cx={start[0]} cy={start[1]} r="7" fill="#22c55e" /> : null}
          {end ? <circle cx={end[0]} cy={end[1]} r="7" fill="#a855f7" /> : null}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/[0.03] px-4 py-3">
          <div className="text-text-secondary">Дистанция</div>
          <div className="mt-1 font-medium">{route.distanceKm.toFixed(1)} км</div>
        </div>
        <div className="rounded-2xl bg-white/[0.03] px-4 py-3">
          <div className="text-text-secondary">Время в пути</div>
          <div className="mt-1 font-medium">{formatDuration(route.durationMinutes)}</div>
        </div>
      </div>
    </div>
  )
}

function formatDuration(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = Math.round(durationMinutes % 60)

  if (hours <= 0) return `${minutes} мин`
  if (minutes === 0) return `${hours} ч`
  return `${hours} ч ${minutes} мин`
}

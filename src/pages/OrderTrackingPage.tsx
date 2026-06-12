import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, RouteTimeline, SectionCard } from '@/components/app/primitives'
import TwoGisTransitMap from '@/components/app/TwoGisTransitMap'
import { useCalculatedRoute, useOrder, useTrackingTimeline } from '@/hooks'
import type { TrackingEvent } from '@/types'

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

  const mapMarkers = useMemo(() => {
    if (!order) return []

    const points = []
    if (typeof order.originLng === 'number' && typeof order.originLat === 'number') {
      points.push({
        id: 'origin',
        label: order.from,
        coordinates: [order.originLng, order.originLat] as [number, number],
      })
    }

    if (typeof order.destinationLng === 'number' && typeof order.destinationLat === 'number') {
      points.push({
        id: 'destination',
        label: order.to,
        coordinates: [order.destinationLng, order.destinationLat] as [number, number],
      })
    }

    return points
  }, [order])

  const mapRoutes = useMemo(() => {
    if (!route?.geometry.coordinates.length) return []

    return [
      {
        id: route.routeId || 'order-route',
        color: '#2563eb',
        coordinates: route.geometry.coordinates,
      },
    ]
  }, [route])

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
                <div className="h-[320px] rounded-[22px] bg-white/5" />
                <div className="h-4 w-2/3 rounded-full bg-white/10" />
              </div>
            ) : route ? (
              <div className="space-y-4">
                <TwoGisTransitMap
                  apiKey={import.meta.env.VITE_2GIS_MAP_KEY}
                  markers={mapMarkers}
                  routes={mapRoutes}
                  activeRouteId={mapRoutes[0]?.id}
                />
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

function formatDuration(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = Math.round(durationMinutes % 60)

  if (hours <= 0) return `${minutes} мин`
  if (minutes === 0) return `${hours} ч`
  return `${hours} ч ${minutes} мин`
}

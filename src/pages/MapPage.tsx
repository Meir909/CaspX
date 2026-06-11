import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import TwoGisTransitMap from '@/components/app/TwoGisTransitMap'
import { checkpointLoads, portLoads, transitRoutes } from '@/data/mock'

const mapMarkers = [
  { id: 'aktau', label: 'Актау', coordinates: [51.1694, 43.6351] as [number, number] },
  { id: 'kuryk', label: 'Курык', coordinates: [51.6814, 43.1789] as [number, number] },
  { id: 'beineu', label: 'Бейнеу', coordinates: [55.1957, 45.3167] as [number, number] },
  { id: 'baku', label: 'Баку', coordinates: [49.8671, 40.4093] as [number, number] },
  { id: 'turkmenbashi', label: 'Туркменбаши', coordinates: [52.9715, 40.0222] as [number, number] },
]

const routeGeometries = {
  'route-1': [
    [51.1694, 43.6351],
    [51.6814, 43.1789],
    [50.95, 42.2],
    [49.8671, 40.4093],
  ] as [number, number][],
  'route-2': [
    [51.1694, 43.6351],
    [51.6814, 43.1789],
    [52.3, 41.6],
    [52.9715, 40.0222],
  ] as [number, number][],
  'route-3': [
    [51.6814, 43.1789],
    [50.9, 42.1],
    [49.8671, 40.4093],
  ] as [number, number][],
}

const routeColors = {
  active: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
}

export default function MapPage() {
  const [tab, setTab] = useState<'map' | 'ports'>('map')
  const [activeRouteId, setActiveRouteId] = useState(transitRoutes[0]?.id ?? 'route-1')

  const mapRoutes = useMemo(
    () =>
      transitRoutes.map((route) => ({
        id: route.id,
        color: routeColors[route.status],
        coordinates: routeGeometries[route.id as keyof typeof routeGeometries] ?? routeGeometries['route-1'],
      })),
    [],
  )

  return (
    <div className="space-y-4">
      <PageIntro
        title="Карта транзита"
        subtitle="Онлайн-мониторинг портов, маршрутов и перегрузки с подключением 2GIS"
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab('map')}
          className={
            tab === 'map'
              ? 'rounded-2xl bg-primary/15 px-4 py-3 text-sm text-primary'
              : 'rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-text-secondary'
          }
        >
          Карта
        </button>
        <button
          type="button"
          onClick={() => setTab('ports')}
          className={
            tab === 'ports'
              ? 'rounded-2xl bg-primary/15 px-4 py-3 text-sm text-primary'
              : 'rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-text-secondary'
          }
        >
          Слои
        </button>
      </div>

      <SectionCard>
        <TwoGisTransitMap
          apiKey={import.meta.env.VITE_2GIS_MAP_KEY}
          markers={mapMarkers}
          routes={mapRoutes}
          activeRouteId={activeRouteId}
        />
      </SectionCard>

      {tab === 'map' ? (
        <SectionCard title="Маршруты">
          <div className="space-y-3">
            {transitRoutes.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => setActiveRouteId(route.id)}
                className={
                  activeRouteId === route.id
                    ? 'flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm'
                    : 'flex w-full items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm'
                }
              >
                <div className="text-left">
                  <div className="font-medium">
                    {route.from} → {route.to}
                  </div>
                  <div className="mt-1 text-text-secondary">Каспийский коридор</div>
                </div>
                <span
                  className={
                    route.status === 'active'
                      ? 'text-emerald-300'
                      : route.status === 'warning'
                        ? 'text-amber-300'
                        : 'text-rose-300'
                  }
                >
                  {route.status === 'active'
                    ? 'Норма'
                    : route.status === 'warning'
                      ? 'Средне'
                      : 'Высоко'}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Слои карты">
          <div className="space-y-3">
            {[...portLoads, ...checkpointLoads].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm"
              >
                <div className="font-medium">{item.name}</div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      item.level === 'high'
                        ? 'text-rose-300'
                        : item.level === 'medium'
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                    }
                  >
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <Button className="w-full" onClick={() => setTab('map')}>
        Открыть детальную карту
      </Button>
    </div>
  )
}

import { useMemo } from 'react'
import { MapPinned } from 'lucide-react'
import { PageIntro, SectionCard, MapCluster } from '@/components/app/primitives'
import TwoGisTransitMap from '@/components/app/TwoGisTransitMap'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { useCheckpointLoadsCurrent } from '@/hooks'
import { locationCatalog } from '@/data/geo'

export default function MapPage() {
  const checkpointQuery = useCheckpointLoadsCurrent()

  const markers = useMemo(
    () => [
      { id: 'aktau', label: 'Aktau', coordinates: [51.1975, 43.6532] as [number, number] },
      { id: 'baku', label: 'Baku', coordinates: [49.8671, 40.4093] as [number, number] },
      { id: 'warsaw', label: 'Warsaw', coordinates: [21.0122, 52.2297] as [number, number] },
      { id: 'berlin', label: 'Berlin', coordinates: [13.405, 52.52] as [number, number] },
    ],
    [],
  )

  const routes = useMemo(
    () => [
      {
        id: 'main-corridor',
        color: '#2563eb',
        coordinates: [
          [51.1975, 43.6532] as [number, number],
          [49.8671, 40.4093] as [number, number],
          [21.0122, 52.2297] as [number, number],
          [13.405, 52.52] as [number, number],
        ],
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <PageIntro
        title="Карта"
        subtitle="Маршруты, переходы и загрузка по основным направлениям"
        action={
          <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm text-primary">
            <MapPinned size={16} />
            Live map
          </div>
        }
      />

      <SectionCard title="Маршрут и точки">
        <TwoGisTransitMap
          apiKey={import.meta.env.VITE_2GIS_MAP_KEY}
          markers={markers}
          routes={routes}
          activeRouteId="main-corridor"
        />
      </SectionCard>

      {checkpointQuery.isLoading ? (
        <LoadingList count={2} />
      ) : checkpointQuery.isError ? (
        <ErrorState onRetry={() => void checkpointQuery.refetch()} />
      ) : checkpointQuery.data ? (
        <SectionCard title="Загрузка переходов">
          <div className="space-y-3">
            {checkpointQuery.data.checkpoints.length ? (
              checkpointQuery.data.checkpoints.slice(0, 4).map((checkpoint) => (
                <div key={checkpoint.checkpointName} className="rounded-2xl bg-white/[0.03] px-4 py-3">
                  <div className="font-medium">{checkpoint.checkpointName}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {checkpoint.borderCountry || checkpoint.region || 'Пункт'} • ожидание {checkpoint.waitingAreaCount}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Пока нет данных" description="Backend еще не вернул загрузку по переходам." />
            )}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Покрытие">
        <MapCluster
          nodes={locationCatalog.flatMap((country, countryIndex) =>
            country.cities.slice(0, 1).map((city, cityIndex) => ({
              id: `${country.country}-${city.name}`,
              label: `${city.name}, ${country.country}`,
              x: 20 + ((countryIndex + cityIndex) * 11) % 70,
              y: 20 + ((countryIndex * 17 + cityIndex * 9) % 60),
              status: countryIndex % 3 === 0 ? 'low' : countryIndex % 3 === 1 ? 'medium' : 'high',
            })),
          )}
        />
      </SectionCard>
    </div>
  )
}

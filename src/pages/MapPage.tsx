import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapCluster, PageIntro, SectionCard } from '@/components/app/primitives'
import { checkpointLoads, loadMapNodes, portLoads, transitRoutes } from '@/data/mock'

export default function MapPage() {
  const [tab, setTab] = useState<'map' | 'ports'>('map')

  return (
    <div className="space-y-4">
      <PageIntro title="Карта транзита" subtitle="Онлайн-мониторинг портов, маршрутов и перегрузки" />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab('map')}
          className={tab === 'map' ? 'rounded-2xl bg-primary/15 px-4 py-3 text-sm text-primary' : 'rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-text-secondary'}
        >
          Карта
        </button>
        <button
          type="button"
          onClick={() => setTab('ports')}
          className={tab === 'ports' ? 'rounded-2xl bg-primary/15 px-4 py-3 text-sm text-primary' : 'rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-text-secondary'}
        >
          Слои
        </button>
      </div>

      <SectionCard>
        <MapCluster nodes={loadMapNodes} />
      </SectionCard>

      {tab === 'map' ? (
        <SectionCard title="Маршруты">
          <div className="space-y-3">
            {transitRoutes.map((route) => (
              <div key={route.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {route.from} → {route.to}
                  </div>
                  <div className="mt-1 text-text-secondary">Каспийский коридор</div>
                </div>
                <span className={route.status === 'active' ? 'text-emerald-300' : route.status === 'warning' ? 'text-amber-300' : 'text-rose-300'}>
                  {route.status === 'active' ? 'Норма' : route.status === 'warning' ? 'Средне' : 'Высоко'}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Слои карты">
          <div className="space-y-3">
            {[...portLoads, ...checkpointLoads].map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm">
                <div className="font-medium">{item.name}</div>
                <div className="flex items-center gap-2">
                  <span className={item.level === 'high' ? 'text-rose-300' : item.level === 'medium' ? 'text-amber-300' : 'text-emerald-300'}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <Button className="w-full">Открыть детальную карту</Button>
    </div>
  )
}

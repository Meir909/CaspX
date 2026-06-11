import { PageIntro, SectionCard, StatCard, MapCluster } from '@/components/app/primitives'
import { ErrorState, LoadingList } from '@/components/ui/async-state'
import { checkpointLoads, loadMapNodes, portLoads } from '@/data/mock'
import { useStats } from '@/hooks'

export default function AkimatDashboardPage() {
  const statsQuery = useStats()
  const stats = statsQuery.data

  return (
    <div className="space-y-4">
      <PageIntro title="Акимат: Аналитика" subtitle="Мониторинг грузопотока, портов и пограничных пунктов" />

      {statsQuery.isLoading ? (
        <LoadingList count={2} />
      ) : statsQuery.isError ? (
        <ErrorState onRetry={() => void statsQuery.refetch()} />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={`${stats?.trucks || 387}`} label="грузовиков" delta="+8%" tone="blue" />
          <StatCard value={`${stats?.activeCargos || 512}`} label="мин т" delta="+12%" tone="green" />
          <StatCard value={`${stats?.avgWaitTime || '2.1 ч'}`} label="ожидание" delta="-5%" tone="amber" />
        </div>
      )}

      <SectionCard title="Динамика грузопотока" action={<span className="text-xs text-text-secondary">7 дней</span>}>
        <div className="flex h-36 items-end gap-2">
          {[45, 68, 52, 76, 58, 81, 64].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-primary/50 to-primary" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-text-secondary">
          <span>10.06</span>
          <span>13.06</span>
          <span>16.06</span>
        </div>
      </SectionCard>

      <SectionCard title="Загруженность портов">
        <div className="space-y-3">
          {portLoads.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <span className="font-medium">{item.name}</span>
              <span className={item.level === 'high' ? 'text-rose-300' : item.level === 'medium' ? 'text-amber-300' : 'text-emerald-300'}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Загруженность КПП">
        <div className="space-y-3">
          {checkpointLoads.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <span className="font-medium">{item.name}</span>
              <span className={item.level === 'high' ? 'text-rose-300' : item.level === 'medium' ? 'text-amber-300' : 'text-emerald-300'}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Карта загруженности">
        <MapCluster nodes={loadMapNodes} />
      </SectionCard>
    </div>
  )
}

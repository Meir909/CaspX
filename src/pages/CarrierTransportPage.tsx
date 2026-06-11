import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { useCarrierVehicles } from '@/hooks'

export default function CarrierTransportPage() {
  const vehiclesQuery = useCarrierVehicles()
  const vehicles = vehiclesQuery.data ?? []

  return (
    <div className="space-y-4">
      <PageIntro title="Мой автопарк" subtitle={`${vehicles.length} транспортных средств`} action={<Button size="sm">Добавить</Button>} />

      {vehiclesQuery.isLoading ? (
        <LoadingList count={3} />
      ) : vehiclesQuery.isError ? (
        <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
      ) : vehicles.length === 0 ? (
        <EmptyState title="Транспорт пока не добавлен" description="Как только backend начнет отдавать машины перевозчика, они появятся здесь." />
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <SectionCard key={vehicle.id}>
              <div className="grid grid-cols-[1fr_96px] items-center gap-4">
                <div>
                  <div className="font-medium">{vehicle.plateNumber}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {vehicle.brand} {vehicle.model} • {vehicle.type}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-text-secondary">
                    <div>
                      <div>Груз</div>
                      <div className="mt-1 text-sm text-white">{vehicle.capacityTons} т</div>
                    </div>
                    <div>
                      <div>Объем</div>
                      <div className="mt-1 text-sm text-white">{vehicle.cargoVolume} м3</div>
                    </div>
                    <div>
                      <div>Год</div>
                      <div className="mt-1 text-sm text-emerald-300">{vehicle.year}</div>
                    </div>
                  </div>
                </div>
                {vehicle.vehicleImageUrl ? (
                  <div className="overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.03]">
                    <img src={vehicle.vehicleImageUrl} alt={vehicle.plateNumber} className="h-20 w-24 object-cover" />
                  </div>
                ) : (
                  <TruckIllustration compact />
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}

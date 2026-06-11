import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { vehicles } from '@/data/mock'

export default function CarrierTransportPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Мой автопарк" subtitle={`${vehicles.length} транспортных средств`} action={<Button size="sm">Добавить</Button>} />

      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <SectionCard key={vehicle.id}>
            <div className="grid grid-cols-[1fr_96px] items-center gap-4">
              <div>
                <div className="font-medium">{vehicle.plate}</div>
                <div className="mt-1 text-sm text-text-secondary">{vehicle.type}</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-text-secondary">
                  <div>
                    <div>Груз</div>
                    <div className="mt-1 text-sm text-white">{vehicle.capacity}</div>
                  </div>
                  <div>
                    <div>Объем</div>
                    <div className="mt-1 text-sm text-white">{vehicle.volume}</div>
                  </div>
                  <div>
                    <div>Статус</div>
                    <div className="mt-1 text-sm text-emerald-300">{vehicle.location}</div>
                  </div>
                </div>
              </div>
              <TruckIllustration compact />
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

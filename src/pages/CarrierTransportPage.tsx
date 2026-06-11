import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { useCreateVehicle, useCarrierVehicles } from '@/hooks'
import { cropAndResizeImage } from '@/lib/utils'

export default function CarrierTransportPage() {
  const vehiclesQuery = useCarrierVehicles()
  const vehicles = vehiclesQuery.data ?? []
  const createVehicle = useCreateVehicle()
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    type: 'TRUCK',
    brand: '',
    model: '',
    year: String(new Date().getFullYear()),
    plateNumber: '',
    capacityTons: '',
    cargoVolume: '',
    vehicleImageUrl: '',
  })

  const resetForm = () => {
    setFormData({
      type: 'TRUCK',
      brand: '',
      model: '',
      year: String(new Date().getFullYear()),
      plateNumber: '',
      capacityTons: '',
      cargoVolume: '',
      vehicleImageUrl: '',
    })
  }

  const submitVehicle = (event: React.FormEvent) => {
    event.preventDefault()

    const year = Number(formData.year)
    if (!formData.brand.trim() || !formData.model.trim() || !formData.plateNumber.trim()) {
      setFormError('Р—Р°РїРѕР»РЅРёС‚Рµ РјР°СЂРєСѓ, РјРѕРґРµР»СЊ Рё РіРѕСЃРЅРѕРјРµСЂ.')
      return
    }

    if (!Number.isFinite(year) || year < 1950 || year > 2100) {
      setFormError('Р“РѕРґ С‚СЂР°РЅСЃРїРѕСЂС‚Р° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІ РґРёР°РїР°Р·РѕРЅРµ 1950-2100.')
      return
    }

    createVehicle.mutate(
      {
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        year,
        plateNumber: formData.plateNumber,
        capacityTons: Number(formData.capacityTons),
        cargoVolume: Number(formData.cargoVolume),
        vehicleImageUrl: formData.vehicleImageUrl || undefined,
      },
      {
        onSuccess: () => {
          setFormError('')
          setIsCreating(false)
          resetForm()
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageIntro
        title="РњРѕР№ Р°РІС‚РѕРїР°СЂРє"
        subtitle={`${vehicles.length} С‚СЂР°РЅСЃРїРѕСЂС‚РЅС‹С… СЃСЂРµРґСЃС‚РІ`}
        action={
          <Button size="sm" onClick={() => setIsCreating((value) => !value)}>
            {isCreating ? 'РЎРєСЂС‹С‚СЊ' : 'Р”РѕР±Р°РІРёС‚СЊ'}
          </Button>
        }
      />

      {isCreating ? (
        <SectionCard title="РќРѕРІС‹Р№ С‚СЂР°РЅСЃРїРѕСЂС‚">
          <form className="space-y-4" onSubmit={submitVehicle}>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">РўРёРї</span>
                <Input value={formData.type} onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Р“РѕРґ</span>
                <Input type="number" min="1950" max="2100" value={formData.year} onChange={(event) => setFormData((prev) => ({ ...prev, year: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">РњР°СЂРєР°</span>
                <Input value={formData.brand} onChange={(event) => setFormData((prev) => ({ ...prev, brand: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">РњРѕРґРµР»СЊ</span>
                <Input value={formData.model} onChange={(event) => setFormData((prev) => ({ ...prev, model: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Р“РѕСЃРЅРѕРјРµСЂ</span>
                <Input value={formData.plateNumber} onChange={(event) => setFormData((prev) => ({ ...prev, plateNumber: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Р“СЂСѓР·РѕРїРѕРґСЉРµРјРЅРѕСЃС‚СЊ, С‚</span>
                <Input type="number" min="0" value={formData.capacityTons} onChange={(event) => setFormData((prev) => ({ ...prev, capacityTons: event.target.value }))} />
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-sm text-text-secondary">РћР±СЉРµРј, Рј3</span>
                <Input type="number" min="0" value={formData.cargoVolume} onChange={(event) => setFormData((prev) => ({ ...prev, cargoVolume: event.target.value }))} />
              </label>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-center">
              <Camera size={20} className="mb-2 text-primary" />
              <span className="text-sm text-white">Р¤РѕС‚Рѕ С‚СЂР°РЅСЃРїРѕСЂС‚Р°</span>
              <span className="mt-1 text-xs text-text-secondary">Р¤РѕС‚Рѕ Р±СѓРґРµС‚ РѕС‚РїСЂР°РІР»РµРЅРѕ РІРјРµСЃС‚Рµ СЃ РґР°РЅРЅС‹РјРё ТС</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const preview = await cropAndResizeImage(file, { width: 1280, height: 960, quality: 0.9 })
                  setFormData((prev) => ({ ...prev, vehicleImageUrl: preview }))
                }}
              />
            </label>

            {formData.vehicleImageUrl ? (
              <div className="overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.03]">
                <img src={formData.vehicleImageUrl} alt="vehicle-preview" className="h-36 w-full object-cover" />
              </div>
            ) : null}

            {formError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{formError}</div> : null}
            {createVehicle.error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{createVehicle.error.message}</div> : null}

            <Button className="w-full" type="submit" disabled={createVehicle.isPending}>
              {createVehicle.isPending ? 'РЎРѕС…СЂР°РЅСЏРµРј...' : 'РЎРѕС…СЂР°РЅРёС‚СЊ С‚СЂР°РЅСЃРїРѕСЂС‚'}
            </Button>
          </form>
        </SectionCard>
      ) : null}

      {vehiclesQuery.isLoading ? (
        <LoadingList count={3} />
      ) : vehiclesQuery.isError ? (
        <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
      ) : vehicles.length === 0 ? (
        <EmptyState title="РўСЂР°РЅСЃРїРѕСЂС‚ РїРѕРєР° РЅРµ РґРѕР±Р°РІР»РµРЅ" description="РљР°Рє С‚РѕР»СЊРєРѕ backend РЅР°С‡РЅРµС‚ РѕС‚РґР°РІР°С‚СЊ РјР°С€РёРЅС‹ РїРµСЂРµРІРѕР·С‡РёРєР°, РѕРЅРё РїРѕСЏРІСЏС‚СЃСЏ Р·РґРµСЃСЊ." />
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <SectionCard key={vehicle.id}>
              <div className="grid grid-cols-[1fr_96px] items-center gap-4">
                <div>
                  <div className="font-medium">{vehicle.plateNumber}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {vehicle.brand} {vehicle.model} вЂў {vehicle.type}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-text-secondary">
                    <div>
                      <div>Р“СЂСѓР·</div>
                      <div className="mt-1 text-sm text-white">{vehicle.capacityTons} С‚</div>
                    </div>
                    <div>
                      <div>РћР±СЉРµРј</div>
                      <div className="mt-1 text-sm text-white">{vehicle.cargoVolume} Рј3</div>
                    </div>
                    <div>
                      <div>Р“РѕРґ</div>
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

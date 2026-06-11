import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { useCarrierVehicles, useUpdateVehicle } from '@/hooks'
import { cropAndResizeImage } from '@/lib/utils'

export default function CarrierVehicleEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const vehiclesQuery = useCarrierVehicles()
  const updateVehicle = useUpdateVehicle()
  const vehicle = useMemo(() => (vehiclesQuery.data ?? []).find((item) => item.id === id), [vehiclesQuery.data, id])
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    year: '',
    plateNumber: '',
    capacityTons: '',
    cargoVolume: '',
    vehicleImageUrl: '',
  })

  useEffect(() => {
    if (!vehicle) return
    setFormData({
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: String(vehicle.year),
      plateNumber: vehicle.plateNumber,
      capacityTons: String(vehicle.capacityTons),
      cargoVolume: String(vehicle.cargoVolume),
      vehicleImageUrl: vehicle.vehicleImageUrl || '',
    })
  }, [vehicle])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const year = Number(formData.year)
    if (!id || !formData.brand.trim() || !formData.model.trim() || !formData.plateNumber.trim()) {
      setFormError('Заполните марку, модель и госномер.')
      return
    }

    if (!Number.isFinite(year) || year < 1950 || year > 2100) {
      setFormError('Год транспорта должен быть в диапазоне 1950-2100.')
      return
    }

    updateVehicle.mutate(
      {
        id,
        data: {
          type: formData.type,
          brand: formData.brand,
          model: formData.model,
          year,
          plateNumber: formData.plateNumber,
          capacityTons: Number(formData.capacityTons),
          cargoVolume: Number(formData.cargoVolume),
          vehicleImageUrl: formData.vehicleImageUrl || undefined,
        },
      },
      {
        onSuccess: () => navigate('/carrier/transport'),
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageIntro title="Редактирование транспорта" subtitle={vehicle ? vehicle.plateNumber : 'Карточка транспорта перевозчика'} />

      {vehiclesQuery.isLoading ? (
        <LoadingList count={2} />
      ) : vehiclesQuery.isError ? (
        <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
      ) : !vehicle ? (
        <EmptyState title="Транспорт не найден" description="Вернитесь в автопарк и выберите существующий транспорт." />
      ) : (
        <SectionCard>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Тип</span>
                <Input value={formData.type} onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Год</span>
                <Input type="number" min="1950" max="2100" value={formData.year} onChange={(event) => setFormData((prev) => ({ ...prev, year: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Марка</span>
                <Input value={formData.brand} onChange={(event) => setFormData((prev) => ({ ...prev, brand: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Модель</span>
                <Input value={formData.model} onChange={(event) => setFormData((prev) => ({ ...prev, model: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Госномер</span>
                <Input value={formData.plateNumber} onChange={(event) => setFormData((prev) => ({ ...prev, plateNumber: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Грузоподъемность, т</span>
                <Input type="number" min="0" value={formData.capacityTons} onChange={(event) => setFormData((prev) => ({ ...prev, capacityTons: event.target.value }))} />
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-sm text-text-secondary">Объем, м3</span>
                <Input type="number" min="0" value={formData.cargoVolume} onChange={(event) => setFormData((prev) => ({ ...prev, cargoVolume: event.target.value }))} />
              </label>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-center">
              <Camera size={20} className="mb-2 text-primary" />
              <span className="text-sm text-white">Обновить фото транспорта</span>
              <span className="mt-1 text-xs text-text-secondary">Изображение будет отправлено как `vehicleImageUrl`</span>
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
                <img src={formData.vehicleImageUrl} alt={formData.plateNumber} className="h-40 w-full object-cover" />
              </div>
            ) : null}

            {formError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{formError}</div> : null}
            {updateVehicle.error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{updateVehicle.error.message}</div> : null}

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/carrier/transport')}>
                Назад
              </Button>
              <Button type="submit" disabled={updateVehicle.isPending}>
                {updateVehicle.isPending ? 'Сохраняем...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
    </div>
  )
}

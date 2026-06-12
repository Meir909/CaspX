import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { useCarrierVehicles, useCreateVehicle, useUploadVehiclePhoto } from '@/hooks'
import { resizeImageToFile } from '@/lib/utils'
import { VehiclePlateInput } from '@/components/ui/vehicle-plate-input'

export default function CarrierTransportPage() {
  const navigate = useNavigate()
  const vehiclesQuery = useCarrierVehicles()
  const vehicles = vehiclesQuery.data ?? []
  const createVehicle = useCreateVehicle()
  const uploadVehiclePhoto = useUploadVehiclePhoto()
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [vehicleImageUrl, setVehicleImageUrl] = useState('')
  const [vehiclePreview, setVehiclePreview] = useState('')
  const [formData, setFormData] = useState({
    type: 'TRUCK',
    brand: '',
    model: '',
    year: String(new Date().getFullYear()),
    plateNumber: '',
    capacityTons: '',
    cargoVolume: '',
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
    })
    setVehicleImageUrl('')
    setVehiclePreview('')
  }

  const submitVehicle = (event: React.FormEvent) => {
    event.preventDefault()

    const year = Number(formData.year)
    if (!formData.brand.trim() || !formData.model.trim() || !formData.plateNumber.trim()) {
      setFormError('Заполните марку, модель и госномер.')
      return
    }

    if (!vehicleImageUrl) {
      setFormError('Загрузите фото транспорта.')
      return
    }

    if (!Number.isFinite(year) || String(year).length !== 4 || year < 1950 || year > 2030) {
      setFormError('Год транспорта должен быть четырёхзначным и в диапазоне 1950-2030.')
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
        vehicleImageUrl,
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
        title="Мой автопарк"
        subtitle={`${vehicles.length} транспортных средств`}
        action={
          <Button size="sm" onClick={() => setIsCreating((value) => !value)}>
            {isCreating ? 'Скрыть' : 'Добавить'}
          </Button>
        }
      />

      {isCreating ? (
        <SectionCard title="Новый транспорт">
          <form className="space-y-4" onSubmit={submitVehicle}>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Тип</span>
                <Input value={formData.type} onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Год</span>
                <Input type="number" min="1950" max="2030" value={formData.year} onChange={(event) => setFormData((prev) => ({ ...prev, year: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Марка</span>
                <Input value={formData.brand} onChange={(event) => setFormData((prev) => ({ ...prev, brand: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Модель</span>
                <Input value={formData.model} onChange={(event) => setFormData((prev) => ({ ...prev, model: event.target.value }))} />
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-sm text-text-secondary">Госномер</span>
                <VehiclePlateInput value={formData.plateNumber} onChange={(plateNumber) => setFormData((prev) => ({ ...prev, plateNumber }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Грузоподъемность, т</span>
                <Input type="number" min="0" value={formData.capacityTons} onChange={(event) => setFormData((prev) => ({ ...prev, capacityTons: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Объем, м3</span>
                <Input type="number" min="0" value={formData.cargoVolume} onChange={(event) => setFormData((prev) => ({ ...prev, cargoVolume: event.target.value }))} />
              </label>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-center">
              <Camera size={20} className="mb-2 text-primary" />
              <span className="text-sm text-white">Фото транспорта</span>
              <span className="mt-1 text-xs text-text-secondary">Один файл, он будет уменьшен и загружен в backend.</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return

                  try {
                    const resized = await resizeImageToFile(file, {
                      width: 1280,
                      height: 960,
                      quality: 0.82,
                      fileName: 'vehicle.jpg',
                    })
                    const result = await uploadVehiclePhoto.mutateAsync(resized)
                    setVehicleImageUrl(result.url)
                    setVehiclePreview(URL.createObjectURL(resized))
                    setFormError('')
                  } catch (uploadError) {
                    setFormError(uploadError instanceof Error ? uploadError.message : 'Не удалось загрузить фото транспорта.')
                  }
                }}
              />
            </label>

            {vehiclePreview ? (
              <div className="overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.03]">
                <img src={vehiclePreview} alt="vehicle-preview" className="h-52 w-full object-cover" />
              </div>
            ) : null}

            {formError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{formError}</div> : null}
            {createVehicle.error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{createVehicle.error.message}</div> : null}

            <Button className="w-full" type="submit" disabled={createVehicle.isPending || uploadVehiclePhoto.isPending}>
              {createVehicle.isPending ? 'Сохраняем...' : 'Сохранить транспорт'}
            </Button>
          </form>
        </SectionCard>
      ) : null}

      {vehiclesQuery.isLoading ? (
        <LoadingList count={3} />
      ) : vehiclesQuery.isError ? (
        <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
      ) : vehicles.length === 0 ? (
        <EmptyState title="Транспорт пока не добавлен" description="Как только вы добавите первую машину, она появится в этом списке." />
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <SectionCard
              key={vehicle.id}
              action={
                <button type="button" onClick={() => navigate(`/carrier/transport/${vehicle.id}/edit`)} className="text-sm text-primary">
                  <span className="inline-flex items-center gap-1">
                    <Pencil size={14} />
                    Редактировать
                  </span>
                </button>
              }
            >
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

import { useState, type ReactNode } from 'react'
import { Camera, FileCheck2, IdCard, Route, Truck, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { useBecomeCarrier, useCreateVehicle } from '@/hooks'
import { createImageCollageDataUrl, readFileAsDataUrl, resizeImageToFile } from '@/lib/utils'
import { VehiclePlateInput } from '@/components/ui/vehicle-plate-input'
import { useAuthStore } from '@/store'

const directionOptions = ['Автомобильные', 'Морские', 'Мультимодальные']

export default function BecomeCarrierPage() {
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [transportPreviews, setTransportPreviews] = useState<string[]>([])
  const createVehicle = useCreateVehicle()
  const [formData, setFormData] = useState({
    company: 'TOO WestTrans KZ',
    businessId: '123456789012',
    direction: 'Автомобильные',
    capacity: '20',
    experience: '5',
    volume: '82',
    plate: 'KZ 123 AB 12',
    transportType: 'Тентовый',
    transportImage: '',
  })
  const { mutate, isPending, error: requestError } = useBecomeCarrier()

  if (submitted) {
    return (
      <div className="space-y-4">
        <PageIntro title="Заявка отправлена" subtitle="Фото транспорта и данные профиля подготовлены для кабинета перевозчика." />
        <SectionCard>
          <div className="text-sm text-text-secondary">
            После одобрения профиля можно будет дополнять автопарк через live-раздел транспорта и редактировать карточки отдельно.
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()

        if (!formData.transportImage) {
          setError('Нужно обязательно прикрепить от 1 до 3 фото транспорта.')
          return
        }

        mutate(formData, {
          onSuccess: async () => {
            try {
              await createVehicle.mutateAsync({
                type: formData.direction,
                brand: formData.company,
                model: formData.transportType,
                year: new Date().getFullYear(),
                plateNumber: formData.plate,
                capacityTons: Number(formData.capacity),
                cargoVolume: Number(formData.volume),
                vehicleImageUrl: formData.transportImage,
              })
            } catch {
              // Carrier application stays successful even if the first vehicle card needs to be added later.
            }

            updateProfile({
              company: formData.company,
              carrierStatus: 'approved',
            })
            setSubmitted(true)
          },
        })
      }}
    >
      <PageIntro title="Стать перевозчиком" subtitle="Заполните информацию о компании, транспорте и обязательно прикрепите фото ТС." />

      <SectionCard title="Компания">
        <div className="space-y-3">
          <Field label="Название компании" icon={<UserCircle2 size={16} />}>
            <Input value={formData.company} onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))} className="pl-10" />
          </Field>
          <Field label="БИН / ИИН" icon={<IdCard size={16} />}>
            <Input value={formData.businessId} onChange={(event) => setFormData((prev) => ({ ...prev, businessId: event.target.value }))} className="pl-10" />
          </Field>

          <div className="space-y-2">
            <span className="text-sm text-text-secondary">Направление</span>
            <div className="grid grid-cols-3 gap-2">
              {directionOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, direction: option }))}
                  className={
                    formData.direction === option
                      ? 'rounded-2xl border border-primary/20 bg-primary/10 px-3 py-3 text-sm text-white'
                      : 'rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm text-text-secondary'
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Транспорт и опыт">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Груз, тонн" icon={<Truck size={16} />}>
            <Input type="number" min="1" value={formData.capacity} onChange={(event) => setFormData((prev) => ({ ...prev, capacity: event.target.value }))} className="pl-10" />
          </Field>
          <Field label="Опыт, лет" icon={<FileCheck2 size={16} />}>
            <Input type="number" min="0" value={formData.experience} onChange={(event) => setFormData((prev) => ({ ...prev, experience: event.target.value }))} className="pl-10" />
          </Field>
          <Field label="Объем, м3" icon={<Route size={16} />}>
            <Input type="number" min="1" value={formData.volume} onChange={(event) => setFormData((prev) => ({ ...prev, volume: event.target.value }))} className="pl-10" />
          </Field>
          <label className="col-span-2 block space-y-2">
            <span className="text-sm text-text-secondary">Госномер</span>
            <VehiclePlateInput value={formData.plate} onChange={(plate) => setFormData((prev) => ({ ...prev, plate }))} />
          </label>
        </div>

        <div className="mt-3">
          <label className="block space-y-2">
            <span className="text-sm text-text-secondary">Тип транспорта</span>
            <Input value={formData.transportType} onChange={(event) => setFormData((prev) => ({ ...prev, transportType: event.target.value }))} />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Фото транспорта">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center">
          <Camera size={20} className="mb-2 text-primary" />
          <span className="text-sm text-white">Загрузить фото транспорта</span>
          <span className="mt-1 text-xs text-text-secondary">Минимум 1 фото, максимум 3 фото</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? [])

              if (files.length < 1 || files.length > 3) {
                setError('Нужно прикрепить от 1 до 3 фото транспорта.')
                return
              }

              const resized = await Promise.all(
                files.map((file, index) =>
                  resizeImageToFile(file, {
                    width: 1280,
                    height: 960,
                    quality: 0.78,
                    fileName: `vehicle-${index + 1}.jpg`,
                  }),
                ),
              )

              const previews = await Promise.all(resized.map((file) => readFileAsDataUrl(file)))
              const collage = await createImageCollageDataUrl(resized, {
                width: 1280,
                height: 960,
                quality: 0.76,
              })

              setError('')
              setTransportPreviews(previews)
              setFormData((prev) => ({ ...prev, transportImage: collage }))
            }}
          />
        </label>

        {transportPreviews.length ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {transportPreviews.map((image, index) => (
              <div key={`${index}-${image.slice(0, 20)}`} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
                <img src={image} alt={`transport-${index + 1}`} className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
      {requestError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{requestError.message}</div> : null}

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? 'Отправка...' : 'Отправить на модерацию'}
      </Button>
    </form>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">{icon}</div>
        {children}
      </div>
    </label>
  )
}

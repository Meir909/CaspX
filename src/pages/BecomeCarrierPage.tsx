import { useState, type ReactNode } from 'react'
import { Camera, FileCheck2, IdCard, Route, Truck, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { Select } from '@/components/ui/select'
import { useBecomeCarrier } from '@/hooks'
import { cropAndResizeImage } from '@/lib/utils'
import { useAuthStore } from '@/store'

export default function BecomeCarrierPage() {
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
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
        <PageIntro title="Заявка отправлена" subtitle="Фото транспорта и данные профиля сохранены в кабинете перевозчика" />
        <SectionCard>
          <div className="text-sm text-text-secondary">
            Ваш транспорт добавлен во фронтенд-реестр перевозчиков. Теперь он будет виден на экране поиска перевозчиков.
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
          setError('Нужно обязательно прикрепить фото транспорта.')
          return
        }

        mutate(formData, {
          onSuccess: () => {
            updateProfile({
              company: formData.company,
              carrierStatus: 'approved',
            })
            setSubmitted(true)
          },
        })
      }}
    >
      <PageIntro title="Стать перевозчиком" subtitle="Заполните информацию о компании, транспорте и обязательно прикрепите фото ТС" />

      <SectionCard title="Компания">
        <div className="space-y-3">
          <Field label="Название компании" icon={<UserCircle2 size={16} />}>
            <Input value={formData.company} onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))} className="pl-10" />
          </Field>
          <Field label="БИН / ИИН" icon={<IdCard size={16} />}>
            <Input value={formData.businessId} onChange={(event) => setFormData((prev) => ({ ...prev, businessId: event.target.value }))} className="pl-10" />
          </Field>
          <label className="block space-y-2">
            <span className="text-sm text-text-secondary">Направление</span>
            <Select value={formData.direction} onChange={(event) => setFormData((prev) => ({ ...prev, direction: event.target.value }))}>
              <option>Автомобильные</option>
              <option>Морские</option>
              <option>Мультимодальные</option>
            </Select>
          </label>
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
          <Field label="Объем, м³" icon={<Route size={16} />}>
            <Input type="number" min="1" value={formData.volume} onChange={(event) => setFormData((prev) => ({ ...prev, volume: event.target.value }))} className="pl-10" />
          </Field>
          <Field label="Госномер" icon={<Truck size={16} />}>
            <Input value={formData.plate} onChange={(event) => setFormData((prev) => ({ ...prev, plate: event.target.value }))} className="pl-10" />
          </Field>
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
          <span className="mt-1 text-xs text-text-secondary">Это обязательное поле</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
              const preview = await cropAndResizeImage(file, { width: 1280, height: 960, quality: 0.9 })
              setError('')
              setFormData((prev) => ({ ...prev, transportImage: preview }))
            }}
          />
        </label>

        {formData.transportImage ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
            <img src={formData.transportImage} alt="transport" className="h-48 w-full object-cover" />
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

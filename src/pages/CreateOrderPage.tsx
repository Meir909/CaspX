import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, CalendarDays, Images, PackageSearch, ScanSearch, Warehouse } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionCard, PageIntro } from '@/components/app/primitives'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { findCity, getCitiesByCountry, locationCatalog } from '@/data/geo'
import { useCreateOrder } from '@/hooks'
import { readFileAsDataUrl, resizeImageToFile } from '@/lib/utils'

const requirementOptions = ['Требуется погрузка', 'Температурный режим', 'Контроль пломбы', 'Срочная подача']
const cargoSuggestions = ['Металл', 'Оборудование', 'Контейнеры', 'Зерно', 'Стройматериалы', 'Нефтехимия']

const today = new Date().toISOString().slice(0, 10)
const maxDate = '2030-12-31'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { mutate, isPending, error: requestError } = useCreateOrder()
  const [error, setError] = useState('')
  const [cargoFiles, setCargoFiles] = useState<File[]>([])
  const [cargoPreviews, setCargoPreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    fromCountry: 'Казахстан',
    from: 'Актау',
    toCountry: 'Азербайджан',
    to: 'Баку',
    cargoType: 'Металл',
    weight: '40',
    volume: '82',
    date: today,
    comment: '',
    requirements: ['Требуется погрузка'] as string[],
  })

  const fromCities = useMemo(() => getCitiesByCountry(formData.fromCountry), [formData.fromCountry])
  const toCities = useMemo(() => getCitiesByCountry(formData.toCountry), [formData.toCountry])

  const toggleRequirement = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(value)
        ? prev.requirements.filter((item) => item !== value)
        : [...prev.requirements, value],
    }))
  }

  const swapRoute = () => {
    setFormData((prev) => ({
      ...prev,
      fromCountry: prev.toCountry,
      from: prev.to,
      toCountry: prev.fromCountry,
      to: prev.from,
    }))
  }

  const handleCargoImages = async (files: FileList | null) => {
    if (!files) return

    const selectedFiles = Array.from(files)
    if (selectedFiles.length < 1 || selectedFiles.length > 5) {
      setError('Нужно прикрепить минимум 1 и максимум 5 фото товара.')
      return
    }

    const resizedFiles = await Promise.all(
      selectedFiles.map((file, index) =>
        resizeImageToFile(file, {
          width: 1600,
          height: 1200,
          quality: 0.82,
          fileName: `cargo-${index + 1}.jpg`,
        }),
      ),
    )

    const previews = await Promise.all(resizedFiles.map((file) => readFileAsDataUrl(file)))
    setCargoFiles(resizedFiles)
    setCargoPreviews(previews)
    setError('')
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (cargoFiles.length < 1 || cargoFiles.length > 5) {
      setError('Нужно прикрепить минимум 1 и максимум 5 фото товара.')
      return
    }

    if (formData.date < today || formData.date > maxDate) {
      setError('Дата должна быть не раньше сегодняшней и не позже 31.12.2030.')
      return
    }

    const origin = findCity(formData.fromCountry, formData.from)
    const destination = findCity(formData.toCountry, formData.to)

    if (!origin || !destination) {
      setError('Выберите страну и город отправки и доставки из справочника.')
      return
    }

    mutate(
      {
        ...formData,
        weight: Number(formData.weight),
        volume: Number(formData.volume),
        originLat: origin.lat,
        originLng: origin.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        cargoImageFiles: cargoFiles,
      },
      {
        onSuccess: (order) => navigate(`/orders/${order.id}`),
      },
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <PageIntro title="Создание заказа" subtitle="Форма отправляет заказ в backend, затем загружает фото товара отдельными multipart-запросами." />

      <SectionCard title="Маршрут">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="space-y-3">
            <Select
              value={formData.fromCountry}
              onChange={(event) => {
                const nextCountry = event.target.value
                const nextCity = getCitiesByCountry(nextCountry)[0]?.name || ''
                setFormData((prev) => ({ ...prev, fromCountry: nextCountry, from: nextCity }))
              }}
            >
              {locationCatalog.map((item) => (
                <option key={item.country} value={item.country}>
                  {item.country}
                </option>
              ))}
            </Select>
            <Select value={formData.from} onChange={(event) => setFormData((prev) => ({ ...prev, from: event.target.value }))}>
              {fromCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>

          <button
            type="button"
            onClick={swapRoute}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label="Поменять страны и города местами"
          >
            <ArrowRightLeft size={18} />
          </button>

          <div className="space-y-3">
            <Select
              value={formData.toCountry}
              onChange={(event) => {
                const nextCountry = event.target.value
                const nextCity = getCitiesByCountry(nextCountry)[0]?.name || ''
                setFormData((prev) => ({ ...prev, toCountry: nextCountry, to: nextCity }))
              }}
            >
              {locationCatalog.map((item) => (
                <option key={item.country} value={item.country}>
                  {item.country}
                </option>
              ))}
            </Select>
            <Select value={formData.to} onChange={(event) => setFormData((prev) => ({ ...prev, to: event.target.value }))}>
              {toCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Информация о грузе">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-2">
            <label className="text-sm text-text-secondary">Тип груза</label>
            <div className="relative">
              <PackageSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input
                className="pl-10"
                value={formData.cargoType}
                onChange={(event) => setFormData((prev) => ({ ...prev, cargoType: event.target.value }))}
                placeholder="Введите тип груза вручную"
                list="cargo-types"
              />
            </div>
            <datalist id="cargo-types">
              {cargoSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Вес, тонн</label>
            <div className="relative">
              <Warehouse size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input className="pl-10" type="number" min="1" value={formData.weight} onChange={(event) => setFormData((prev) => ({ ...prev, weight: event.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Объем, м3</label>
            <div className="relative">
              <ScanSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input className="pl-10" type="number" min="1" value={formData.volume} onChange={(event) => setFormData((prev) => ({ ...prev, volume: event.target.value }))} />
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <label className="text-sm text-text-secondary">Дата отгрузки</label>
            <div className="relative">
              <CalendarDays size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input
                className="pl-10"
                type="date"
                min={today}
                max={maxDate}
                value={formData.date}
                onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
            <p className="text-xs text-text-secondary">Минимум сегодняшняя дата, максимум 31.12.2030. Год только в формате YYYY.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Фото товара">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center">
          <Images size={20} className="mb-2 text-primary" />
          <span className="text-sm text-white">Загрузить фото товара</span>
          <span className="mt-1 text-xs text-text-secondary">Минимум 1 фото, максимум 5 фото</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleCargoImages(event.target.files)} />
        </label>

        {cargoPreviews.length ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {cargoPreviews.map((image, index) => (
              <div key={`${index}-${image.slice(0, 20)}`} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
                <img src={image} alt={`cargo-${index + 1}`} className="h-24 w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Дополнительно">
        <Textarea
          value={formData.comment}
          onChange={(event) => setFormData((prev) => ({ ...prev, comment: event.target.value }))}
          placeholder="Укажите пожелания к подаче транспорта, погрузке или документам"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {requirementOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleRequirement(item)}
              className={
                formData.requirements.includes(item)
                  ? 'rounded-full bg-primary/15 px-3 py-2 text-sm text-primary'
                  : 'rounded-full bg-white/[0.04] px-3 py-2 text-sm text-text-secondary'
              }
            >
              {item}
            </button>
          ))}
        </div>
      </SectionCard>

      {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
      {requestError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{requestError.message}</div> : null}

      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {isPending ? 'Создаем заказ...' : 'Создать заказ'}
      </Button>
    </motion.form>
  )
}

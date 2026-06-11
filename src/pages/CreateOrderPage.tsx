import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, Calendar, Package, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionCard, PageIntro } from '@/components/app/primitives'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateOrder } from '@/hooks'

const requirementOptions = ['Требуется погрузка', 'Температурный режим', 'Контроль пломбы', 'Срочная подача']

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateOrder()
  const [formData, setFormData] = useState({
    from: 'Актау',
    to: 'Баку',
    cargoType: 'Металл',
    weight: '40',
    volume: '82',
    date: '2024-06-15',
    comment: '',
    requirements: ['Требуется погрузка'] as string[],
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    mutate(
      {
        ...formData,
        weight: Number(formData.weight),
        volume: Number(formData.volume),
      },
      {
      onSuccess: (order) => navigate(`/carriers?order=${order.id}`),
      },
    )
  }

  const toggleRequirement = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(value)
        ? prev.requirements.filter((item) => item !== value)
        : [...prev.requirements, value],
    }))
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <PageIntro title="Создание заказа" subtitle="Заполните информацию о грузе и маршруте" />

      <SectionCard>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <div className="h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(37,99,235,0.15)]" />
            <div className="h-12 w-px bg-white/10" />
            <div className="h-3.5 w-3.5 rounded-full bg-violet-400 shadow-[0_0_0_4px_rgba(167,139,250,0.15)]" />
          </div>
          <div className="flex-1 space-y-3">
            <Input value={formData.from} onChange={(event) => setFormData({ ...formData, from: event.target.value })} />
            <div className="flex items-center gap-2">
              <Input value={formData.to} onChange={(event) => setFormData({ ...formData, to: event.target.value })} />
              <button type="button" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-text-secondary">
                <ArrowRightLeft size={18} />
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Информация о грузе">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Тип груза</label>
            <Select value={formData.cargoType} onChange={(event) => setFormData({ ...formData, cargoType: event.target.value })}>
              <option>Металл</option>
              <option>Контейнеры</option>
              <option>Продукты</option>
              <option>Оборудование</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Вес, тонн</label>
            <Input type="number" value={formData.weight} onChange={(event) => setFormData({ ...formData, weight: event.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Объем, м³</label>
            <Input type="number" value={formData.volume} onChange={(event) => setFormData({ ...formData, volume: event.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Дата отгрузки</label>
            <Input type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Дополнительно">
        <Textarea
          value={formData.comment}
          onChange={(event) => setFormData({ ...formData, comment: event.target.value })}
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

      <SectionCard title="Сводка">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <Package size={16} />
              <span>Тип груза</span>
            </div>
            <span>{formData.cargoType}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <Truck size={16} />
              <span>Вес и объем</span>
            </div>
            <span>
              {formData.weight} т / {formData.volume} м³
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar size={16} />
              <span>Дата подачи</span>
            </div>
            <span>{formData.date}</span>
          </div>
        </div>
      </SectionCard>

      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {isPending ? 'Создаем заказ...' : 'Найти перевозчика'}
      </Button>
    </motion.form>
  )
}

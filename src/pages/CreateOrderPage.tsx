import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRightLeft, Calendar, Truck, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useCreateOrder } from '@/hooks'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateOrder()
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    cargoType: '',
    weight: '',
    volume: '',
    date: '',
    comment: '',
    requirements: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(formData, {
      onSuccess: () => {
        navigate('/orders')
      }
    })
  }

  return (
    <div className="p-4">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Создание заказа</h1>
          <p className="text-text-secondary">Заполните информацию о грузе</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Card className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 bg-primary rounded-full" />
                <div className="w-0.5 h-8 bg-gray-600" />
                <div className="w-4 h-4 bg-accent rounded-full" />
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  placeholder="Откуда"
                  required
                />
                <Input
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="Куда"
                  required
                />
              </div>
              <Button variant="ghost" size="icon">
                <ArrowRightLeft size={20} />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Информация о грузе</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                <Package size={14} className="inline mr-1" />
                Тип груза
              </label>
              <Select
                value={formData.cargoType}
                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                required
              >
                <option value="">Выберите</option>
                <option value="general">Генеральный</option>
                <option value="container">Контейнеры</option>
                <option value="liquid">Жидкости</option>
                <option value="bulk">Насыпные</option>
                <option value="heavy">Тяжелые</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                <Truck size={14} className="inline mr-1" />
                Вес (т)
              </label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="20"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                <Package size={14} className="inline mr-1" />
                Объём (м³)
              </label>
              <Input
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="40"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                <Calendar size={14} className="inline mr-1" />
                Дата
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Дополнительно</h3>
          <Textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Комментарий к заказу..."
            className="mb-4"
          />
          <div className="flex flex-wrap gap-2">
            {['Хрупкий', 'Требует погрузки', 'Опасный', 'Негабаритный'].map((req) => (
              <button
                key={req}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    requirements: prev.requirements.includes(req)
                      ? prev.requirements.filter(r => r !== req)
                      : [...prev.requirements, req]
                  }))
                }}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  formData.requirements.includes(req)
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-card'
                }`}
              >
                {req}
              </button>
            ))}
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? 'Создаём...' : 'Найти перевозчика'}
        </Button>
      </motion.form>
    </div>
  )
}

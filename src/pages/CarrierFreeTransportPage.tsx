import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, Truck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function CarrierFreeTransportPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    capacity: '',
    volume: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Опубликовано!</h1>
          <p className="text-text-secondary mb-8">
            Ваш свободный транспорт опубликован. Грузоотправители смогут найти вас.
          </p>
          <Button onClick={() => navigate('/carrier')} className="w-full">
            Вернуться в дашборд
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Свободный транспорт</h1>
          <p className="text-text-secondary">Опубликуйте доступное ТС</p>
        </div>
      </div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Маршрут
          </h3>
          <div className="space-y-4">
            <Input
              placeholder="Откуда"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
            />
            <Input
              placeholder="Куда"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Truck size={20} className="text-primary" />
            Детали
          </h3>
          <div className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Грузоподъёмность (т)</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Объём (м³)</label>
                <Input
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="40"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Опубликовать
        </Button>
      </motion.form>
    </div>
  )
}

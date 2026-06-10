import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Truck, Upload, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useBecomeCarrier } from '@/hooks'

export default function BecomeCarrierPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const { mutate, isPending } = useBecomeCarrier()
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    address: '',
    experience: '',
    specialization: '',
    transportType: '',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    volume: '',
    plate: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      mutate(formData, {
        onSuccess: () => setSubmitted(true)
      })
    }
  }

  if (submitted) {
    return (
      <div className="p-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={48} className="text-warning" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Заявка отправлена!</h1>
          <p className="text-text-secondary mb-8">
            Ваша заявка на получение статуса перевозчика отправлена на модерацию. Мы свяжемся с вами в течение 24 часов.
          </p>
          <Button onClick={() => navigate('/profile')} className="w-full">
            Вернуться в профиль
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Стать перевозчиком</h1>
          <p className="text-text-secondary">Шаг {step} из 3</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <motion.form
        key={step}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {step === 1 && (
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Личные данные
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Имя</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Фамилия</label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Дата рождения</label>
                <Input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Телефон</label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Email</label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Страна</label>
                <Input
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Город</label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Адрес</label>
                  <Input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Опыт
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Опыт работы (лет)</label>
                <Input
                  type="number"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Специализация</label>
                <Select
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                >
                  <option value="">Выберите</option>
                  <option value="general">Генеральные грузы</option>
                  <option value="container">Контейнеры</option>
                  <option value="liquid">Жидкости</option>
                  <option value="heavy">Тяжелые грузы</option>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Truck size={20} className="text-primary" />
              Транспорт
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Тип транспорта</label>
                <Select
                  required
                  value={formData.transportType}
                  onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                >
                  <option value="">Выберите</option>
                  <option value="truck">Грузовик</option>
                  <option value="van">Фургон</option>
                  <option value="refrigerator">Рефрижератор</option>
                  <option value="tanker">Танкер</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Марка</label>
                  <Input
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Модель</label>
                  <Input
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Год</label>
                  <Input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Гос. номер</label>
                  <Input
                    required
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Грузоподъёмность (т)</label>
                  <Input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Объём (м³)</label>
                  <Input
                    type="number"
                    required
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Фото транспорта</label>
                <Button variant="secondary" className="w-full">
                  <Upload size={20} className="mr-2" />
                  Загрузить фото
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? 'Отправка...' : step === 3 ? 'Отправить заявку' : 'Далее'}
        </Button>
      </motion.form>
    </div>
  )
}

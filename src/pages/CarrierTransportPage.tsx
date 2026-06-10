import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Truck, Plus, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CarrierTransportPage() {
  const navigate = useNavigate()

  const vehicles = [
    {
      id: 1,
      name: 'MAN TGX 2022',
      type: 'Грузовик',
      capacity: '20 т',
      volume: '40 м³',
      plate: 'A123BC 01',
      status: 'active'
    },
    {
      id: 2,
      name: 'Volvo FH 2021',
      type: 'Рефрижератор',
      capacity: '15 т',
      volume: '35 м³',
      plate: 'A456BC 01',
      status: 'active'
    }
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Мой транспорт</h1>
            <p className="text-text-secondary">{vehicles.length} ТС</p>
          </div>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          Добавить
        </Button>
      </div>

      <div className="space-y-4">
        {vehicles.map((vehicle, i) => (
          <motion.div
            key={vehicle.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Truck size={28} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vehicle.name}</h3>
                      <p className="text-sm text-text-secondary">{vehicle.type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit3 size={20} />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Грузоподъёмность</p>
                    <p className="font-medium">{vehicle.capacity}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Объём</p>
                    <p className="font-medium">{vehicle.volume}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Гос. номер</p>
                    <p className="font-medium">{vehicle.plate}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                  <span className="text-success flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Активен
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

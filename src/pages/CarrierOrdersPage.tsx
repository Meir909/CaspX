import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrders } from '@/hooks'

export default function CarrierOrdersPage() {
  const navigate = useNavigate()
  const { data: orders } = useOrders()

  const availableOrders = orders?.filter(o => o.status === 'searching')

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Доступные заказы</h1>
          <p className="text-text-secondary">{availableOrders?.length || 0} заказов</p>
        </div>
      </div>

      <div className="space-y-3">
        {availableOrders?.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="warning">Новый</Badge>
                  <span className="text-sm text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex flex-col items-center gap-1">
                    <MapPin size={16} className="text-primary" />
                    <div className="w-0.5 h-6 bg-gray-600" />
                    <MapPin size={16} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{order.from}</p>
                    <p className="text-text-secondary text-sm">{order.to}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-text-secondary">
                  <span>{order.cargoType}</span>
                  <span>{order.weight} т</span>
                  <span>{order.volume} м³</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">150 000 ₸</p>
                  <Button>Принять заказ</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

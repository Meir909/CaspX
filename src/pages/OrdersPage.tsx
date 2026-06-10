import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft, Clock, CheckCircle2, MapPin, Truck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrders } from '@/hooks'

const statusConfig = {
  created: { label: 'Создан', icon: <Clock size={16} />, variant: 'secondary' as const },
  searching: { label: 'Поиск перевозчика', icon: <Clock size={16} />, variant: 'warning' as const },
  assigned: { label: 'Назначен', icon: <CheckCircle2 size={16} />, variant: 'default' as const },
  in_progress: { label: 'В пути', icon: <Truck size={16} />, variant: 'default' as const },
  delivered: { label: 'Доставлен', icon: <CheckCircle2 size={16} />, variant: 'success' as const },
  cancelled: { label: 'Отменён', icon: <XCircle size={16} />, variant: 'error' as const }
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders, isLoading } = useOrders()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Мои заказы</h1>
            <p className="text-text-secondary">{orders?.length || 0} заказов</p>
          </div>
        </div>
        <Button onClick={() => navigate('/create-order')}>
          <Plus size={20} className="mr-2" />
          Новый
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
                <div className="h-4 w-1/2 bg-gray-700 rounded" />
                <div className="h-8 w-24 bg-gray-700 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5 cursor-pointer hover:bg-bg-secondary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={statusConfig[order.status].variant}>
                      <span className="flex items-center gap-1">
                        {statusConfig[order.status].icon}
                        {statusConfig[order.status].label}
                      </span>
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
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

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-text-secondary">
                      <span>{order.cargoType}</span>
                      <span>{order.weight} т</span>
                      <span>{order.volume} м³</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Truck, MessageSquare, Package, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotificationStore } from '@/store'

const notificationIcons = {
  carrier_found: <Truck size={20} />,
  new_message: <MessageSquare size={20} />,
  order_updated: <Package size={20} />,
  cargo_delivered: <CheckCircle2 size={20} />
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Уведомления</h1>
            <p className="text-text-secondary">
              {notifications.filter(n => !n.read).length} непрочитанных
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={markAllAsRead}>
          <Check size={20} className="mr-2" />
          Все прочитаны
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-colors ${!notif.read ? 'bg-bg-secondary/50' : 'hover:bg-bg-card'}`}
              onClick={() => markAsRead(notif.id)}
            >
              <CardContent className="p-0 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  !notif.read ? 'bg-primary/20 text-primary' : 'bg-bg-secondary text-text-secondary'
                }`}>
                  {notificationIcons[notif.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{notif.title}</h3>
                    {!notif.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-text-secondary text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

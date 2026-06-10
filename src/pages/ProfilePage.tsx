import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, User, Phone, Mail, Building, Star, LogOut, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/store'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, switchRole } = useAuthStore()

  const menuItems = [
    { icon: <User size={20} />, label: 'Редактировать профиль', path: '' },
    { icon: <Building size={20} />, label: 'Моя компания', path: '' },
    { icon: <Shield size={20} />, label: 'Безопасность', path: '' },
    { icon: <Phone size={20} />, label: 'Поддержка', path: '' }
  ]

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Профиль</h1>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-4"
      >
        <Card className="p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold mx-auto mb-4">
            {user?.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
          <p className="text-text-secondary mb-4">{user?.company}</p>
          <div className="flex items-center justify-center gap-1 text-warning">
            <Star size={20} fill="currentColor" />
            <span className="font-semibold">{user?.rating}</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail size={20} className="text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone size={20} className="text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Телефон</p>
                <p className="font-medium">{user?.phone}</p>
              </div>
            </div>
          </div>
        </Card>

        {user?.carrierStatus === 'approved' ? (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-success" />
                <div>
                  <h3 className="font-semibold">Вы перевозчик</h3>
                  <p className="text-sm text-text-secondary">Доступ к carrier dashboard</p>
                </div>
              </div>
            </div>
            {user.role === 'carrier' ? (
              <Button variant="secondary" onClick={() => switchRole('user')} className="w-full">
                Переключиться на обычный аккаунт
              </Button>
            ) : (
              <Button onClick={() => switchRole('carrier')} className="w-full">
                Перейти в Carrier Dashboard
              </Button>
            )}
          </Card>
        ) : (
          <Button onClick={() => navigate('/become-carrier')} className="w-full" size="lg">
            <Truck size={20} className="mr-2" />
            Стать перевозчиком
          </Button>
        )}

        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-bg-card hover:bg-bg-secondary transition-colors text-left"
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <ArrowRight size={20} className="text-text-secondary" />
            </motion.button>
          ))}
        </div>

        <Button variant="destructive" onClick={logout} className="w-full">
          <LogOut size={20} className="mr-2" />
          Выйти
        </Button>
      </motion.div>
    </div>
  )
}

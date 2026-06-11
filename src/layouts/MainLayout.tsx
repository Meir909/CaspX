import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BellRing,
  Boxes,
  CarFront,
  ClipboardList,
  Compass,
  FilePlus2,
  Files,
  Headset,
  House,
  MapPinned,
  Menu,
  ShipWheel,
  Sparkles,
  X,
} from 'lucide-react'
import { AppLogo, UserAvatar } from '@/components/app/primitives'
import { useAuthStore, useNotificationStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const sidebarNav = [
  { path: '/', label: 'Главная', icon: House },
  { path: '/create-order', label: 'Создать заказ', icon: FilePlus2 },
  { path: '/carriers', label: 'Поиск перевозчика', icon: Compass },
  { path: '/orders', label: 'Мои заказы', icon: Files },
  { path: '/map', label: 'Карта транзита', icon: MapPinned },
  { path: '/port', label: 'Порт Актау', icon: ShipWheel },
  { path: '/ai', label: 'AI Assistant', icon: Sparkles },
  { path: '/support', label: 'Поддержка', icon: Headset },
  { path: '/notifications', label: 'Уведомления', icon: BellRing },
]

const carrierExtraNav = [
  { path: '/carrier', label: 'Кабинет перевозчика', icon: Boxes },
  { path: '/carrier/orders', label: 'Доступные заказы', icon: ClipboardList },
  { path: '/carrier/transport', label: 'Мой транспорт', icon: CarFront },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user } = useAuthStore()
  const { notifications } = useNotificationStore()

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const navItems =
    user?.role === 'carrier'
      ? [...sidebarNav, ...carrierExtraNav]
      : user?.role === 'akimat'
        ? sidebarNav.map((item) => (item.path === '/' ? { ...item, path: '/akimat', label: 'Аналитика региона' } : item))
        : sidebarNav

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[430px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#040b16]/90 shadow-[0_30px_120px_rgba(2,8,23,0.55)] backdrop-blur-xl">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#040b16]/90 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-text-secondary"
            >
              <Menu size={20} />
            </button>
            <AppLogo />
            <button type="button" onClick={() => navigate('/profile')} className="relative">
              <UserAvatar name={user?.name} avatar={user?.avatar} size="sm" />
              {unreadCount ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary" /> : null}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Outlet />
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen ? (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#040b16] px-5 pb-6 pt-5"
          >
            <div className="mx-auto flex h-full max-w-[430px] flex-col">
              <div className="mb-6 flex items-center justify-between">
                <AppLogo />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-text-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate('/profile')
                  setSidebarOpen(false)
                }}
                className="mb-6 flex items-center gap-4 rounded-[24px] border border-white/5 bg-white/[0.03] p-4 text-left"
              >
                <UserAvatar name={user?.name} avatar={user?.avatar} size="md" />
                <div className="flex-1">
                  <div className="font-medium">{user?.name}</div>
                  <div className="mt-1 text-sm text-text-secondary">{user?.company}</div>
                </div>
                {unreadCount ? <div className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">{unreadCount}</div> : null}
              </button>

              <div className="grid gap-2 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path))

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path)
                        setSidebarOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors',
                        isActive ? 'bg-primary/10 text-white' : 'bg-white/[0.02] text-text-secondary hover:bg-white/[0.05]',
                      )}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

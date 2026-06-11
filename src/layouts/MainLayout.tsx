import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bot,
  LifeBuoy,
  Map,
  Menu,
  MessageSquare,
  Truck,
  User,
  X,
} from 'lucide-react'
import { AppLogo } from '@/components/app/primitives'
import { useAuthStore, useNotificationStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const baseNav = [
  { path: '/', label: 'Аналитика', icon: BarChart3 },
  { path: '/orders', label: 'Заказы', icon: Truck },
  { path: '/ai', label: 'Сообщения', icon: Bot },
  { path: '/map', label: 'Карта', icon: Map },
  { path: '/profile', label: 'Профиль', icon: User },
]

const sidebarNav = [
  { path: '/', label: 'Главная', icon: BarChart3 },
  { path: '/create-order', label: 'Создать заказ', icon: Truck },
  { path: '/carriers', label: 'Поиск перевозчика', icon: Truck },
  { path: '/orders', label: 'Мои заказы', icon: Truck },
  { path: '/map', label: 'Карта транзита', icon: Map },
  { path: '/port', label: 'Порт Актау', icon: Map },
  { path: '/chat', label: 'Чаты', icon: MessageSquare },
  { path: '/support', label: 'Поддержка', icon: LifeBuoy },
  { path: '/profile', label: 'Профиль', icon: User },
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
      ? baseNav.map((item) =>
          item.path === '/'
            ? { ...item, path: '/carrier', label: 'Аналитика' }
            : item.path === '/orders'
              ? { ...item, path: '/carrier/orders', label: 'Заказы' }
              : item.path === '/map'
                ? { ...item, path: '/carrier/transport', label: 'Транспорт' }
                : item,
        )
      : user?.role === 'akimat'
        ? baseNav.map((item) =>
            item.path === '/'
              ? { ...item, path: '/akimat', label: 'Аналитика' }
              : item.path === '/orders'
                ? { ...item, path: '/port', label: 'Порты' }
                : item,
          )
        : baseNav

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
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-text-secondary"
            >
              <MessageSquare size={20} />
              {unreadCount ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          <Outlet />
        </div>

        <nav className="sticky bottom-0 z-20 border-t border-white/5 bg-[#040b16]/95 px-2 pb-3 pt-2 backdrop-blur">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition-colors',
                    isActive ? 'bg-primary/12 text-primary' : 'text-text-secondary hover:bg-white/[0.04]',
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed left-3 top-4 z-40 flex h-[calc(100vh-2rem)] w-[330px] max-w-[calc(100vw-1.5rem)] flex-col rounded-[28px] border border-white/10 bg-[#07111f] p-5 shadow-[0_30px_120px_rgba(2,8,23,0.55)]"
            >
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

              <div className="space-y-2">
                {sidebarNav.map((item) => {
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
                        'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors',
                        isActive ? 'bg-primary/10 text-white' : 'text-text-secondary hover:bg-white/[0.04]',
                      )}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {user ? (
                <div className="mt-auto rounded-[22px] border border-white/5 bg-white/[0.03] p-4">
                  <div className="text-base font-medium">{user.name}</div>
                  <div className="mt-1 text-sm text-text-secondary">{user.company}</div>
                  <div className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                    {user.role === 'carrier'
                      ? 'Режим перевозчика'
                      : user.role === 'akimat'
                        ? 'Режим акимата'
                        : 'Личный кабинет'}
                  </div>
                </div>
              ) : null}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

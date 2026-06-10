import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Bell, MessageSquare, Map, Truck, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useAuthStore, useNotificationStore } from '@/store'

export default function MainLayout() {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user } = useAuthStore()
  const { notifications } = useNotificationStore()

  const navItems = [
    { icon: <Search size={24} />, label: 'Главная', path: '/' },
    { icon: <Map size={24} />, label: 'Карта', path: '/map' },
    { icon: <Truck size={24} />, label: 'Заказы', path: '/orders' },
    { icon: <Bot size={24} />, label: 'AI Логист', path: '/ai' },
    { icon: <MessageSquare size={24} />, label: 'Чат', path: '/chat' },
    { icon: <User size={24} />, label: 'Профиль', path: '/profile' },
    ...(user?.role === 'carrier' || user?.carrierStatus === 'approved' ? [
      { icon: <Truck size={24} />, label: 'Carrier Dashboard', path: '/carrier' }
    ] : []),
    ...(user?.role === 'akimat' ? [
      { icon: <Map size={24} />, label: 'Akimat Dashboard', path: '/akimat' }
    ] : [])
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-bg-primary text-white">
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg-primary/95 backdrop-blur-xl border-b border-gray-700/30 z-50 px-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-bg-card rounded-xl transition-colors">
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">CaspX</h1>
          <span className="text-xs text-text-secondary">Мангистауская область</span>
        </div>

        <button onClick={() => navigate('/notifications')} className="p-2 hover:bg-bg-card rounded-xl transition-colors relative">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-error text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-bg-secondary z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Меню</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-bg-card rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-bg-card transition-colors text-left"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {user && (
                <div className="mt-8 pt-6 border-t border-gray-700/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-sm text-text-secondary truncate">{user.company}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-16 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-bg-secondary border-t border-gray-700/30 z-40 px-2 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-card transition-colors w-16"
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import GuestLayout from '@/layouts/GuestLayout'
import MainLayout from '@/layouts/MainLayout'
import { useAuthStore } from '@/store'
import AboutPage from '@/pages/AboutPage'
import BecomeCarrierPage from '@/pages/BecomeCarrierPage'
import CarrierDashboardPage from '@/pages/CarrierDashboardPage'
import CarrierOrdersPage from '@/pages/CarrierOrdersPage'
import CarrierProfileEditPage from '@/pages/CarrierProfileEditPage'
import CarrierTransportPage from '@/pages/CarrierTransportPage'
import CarrierVehicleEditPage from '@/pages/CarrierVehicleEditPage'
import CreateOrderPage from '@/pages/CreateOrderPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import OrderDetailsPage from '@/pages/OrderDetailsPage'
import OrderHistoryPage from '@/pages/OrderHistoryPage'
import OrderTrackingPage from '@/pages/OrderTrackingPage'
import OrdersPage from '@/pages/OrdersPage'
import ProfilePage from '@/pages/ProfilePage'
import RegisterPage from '@/pages/RegisterPage'
import SupportPage from '@/pages/SupportPage'

function ProtectedRoute({
  children,
  requiredRole,
  allowApprovedCarrier = false,
}: {
  children: ReactNode
  requiredRole?: 'guest' | 'user' | 'carrier' | 'admin' | 'akimat'
  allowApprovedCarrier?: boolean
}) {
  const { user, isAuthenticated, isReady } = useAuthStore()

  if (!isReady) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[430px] items-center justify-center px-4">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-text-secondary">
          Восстанавливаем сессию...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowApprovedCarrier && user?.carrierStatus === 'approved' && user?.role === 'carrier') {
    return <>{children}</>
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuthStore()

  if (!isReady) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[430px] items-center justify-center px-4">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-text-secondary">
          Проверяем доступ...
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const routes: RouteObject[] = [
  {
    element: <GuestLayout />,
    children: [
      { path: '/login', element: <GuestRoute><LoginPage /></GuestRoute> },
      { path: '/register', element: <GuestRoute><RegisterPage /></GuestRoute> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: '/create-order', element: <ProtectedRoute><CreateOrderPage /></ProtectedRoute> },
      { path: '/orders', element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: '/orders/:id', element: <ProtectedRoute><OrderDetailsPage /></ProtectedRoute> },
      { path: '/orders/:id/tracking', element: <ProtectedRoute><OrderTrackingPage /></ProtectedRoute> },
      { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '/become-carrier', element: <ProtectedRoute><BecomeCarrierPage /></ProtectedRoute> },
      { path: '/history', element: <ProtectedRoute><OrderHistoryPage /></ProtectedRoute> },
      { path: '/support', element: <ProtectedRoute><SupportPage /></ProtectedRoute> },
      { path: '/about', element: <ProtectedRoute><AboutPage /></ProtectedRoute> },
      { path: '/carrier', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierDashboardPage /></ProtectedRoute> },
      { path: '/carrier/orders', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierOrdersPage /></ProtectedRoute> },
      { path: '/carrier/transport', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierTransportPage /></ProtectedRoute> },
      { path: '/carrier/transport/:id/edit', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierVehicleEditPage /></ProtectedRoute> },
      { path: '/carrier/profile/edit', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierProfileEditPage /></ProtectedRoute> },
    ],
  },
]

import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import MainLayout from '../layouts/MainLayout'
import GuestLayout from '../layouts/GuestLayout'

// Pages
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import MapPage from '../pages/MapPage'
import CreateOrderPage from '../pages/CreateOrderPage'
import OrdersPage from '../pages/OrdersPage'
import AIPage from '../pages/AIPage'
import ChatPage from '../pages/ChatPage'
import NotificationsPage from '../pages/NotificationsPage'
import ProfilePage from '../pages/ProfilePage'
import BecomeCarrierPage from '../pages/BecomeCarrierPage'
import CarrierDashboardPage from '../pages/CarrierDashboardPage'
import CarrierOrdersPage from '../pages/CarrierOrdersPage'
import CarrierTransportPage from '../pages/CarrierTransportPage'
import CarrierFreeTransportPage from '../pages/CarrierFreeTransportPage'
import AkimatDashboardPage from '../pages/AkimatDashboardPage'

const ProtectedRoute = ({
  children,
  requiredRole,
  allowApprovedCarrier = false,
}: {
  children: ReactNode
  requiredRole?: 'guest' | 'user' | 'carrier' | 'admin' | 'akimat'
  allowApprovedCarrier?: boolean
}) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowApprovedCarrier && user?.carrierStatus === 'approved') {
    return <>{children}</>
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

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
      { path: '/forgot-password', element: <GuestRoute><ForgotPasswordPage /></GuestRoute> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: '/map', element: <ProtectedRoute><MapPage /></ProtectedRoute> },
      { path: '/create-order', element: <ProtectedRoute><CreateOrderPage /></ProtectedRoute> },
      { path: '/orders', element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: '/ai', element: <ProtectedRoute><AIPage /></ProtectedRoute> },
      { path: '/chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
      { path: '/chat/:id', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
      { path: '/notifications', element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> },
      { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '/become-carrier', element: <ProtectedRoute><BecomeCarrierPage /></ProtectedRoute> },
      { path: '/carrier', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierDashboardPage /></ProtectedRoute> },
      { path: '/carrier/orders', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierOrdersPage /></ProtectedRoute> },
      { path: '/carrier/transport', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierTransportPage /></ProtectedRoute> },
      { path: '/carrier/free-transport', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierFreeTransportPage /></ProtectedRoute> },
      { path: '/akimat', element: <ProtectedRoute requiredRole="akimat"><AkimatDashboardPage /></ProtectedRoute> },
    ],
  },
]

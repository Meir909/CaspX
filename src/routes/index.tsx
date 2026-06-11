import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import GuestLayout from '@/layouts/GuestLayout'
import MainLayout from '@/layouts/MainLayout'
import { useAuthStore } from '@/store'
import AboutPage from '@/pages/AboutPage'
import AIPage from '@/pages/AIPage'
import AkimatDashboardPage from '@/pages/AkimatDashboardPage'
import BecomeCarrierPage from '@/pages/BecomeCarrierPage'
import CarrierDashboardPage from '@/pages/CarrierDashboardPage'
import CarrierFreeTransportPage from '@/pages/CarrierFreeTransportPage'
import CarrierOrdersPage from '@/pages/CarrierOrdersPage'
import CarrierSearchPage from '@/pages/CarrierSearchPage'
import CarrierTransportPage from '@/pages/CarrierTransportPage'
import ChatPage from '@/pages/ChatPage'
import CreateOrderPage from '@/pages/CreateOrderPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import MapPage from '@/pages/MapPage'
import NotificationsPage from '@/pages/NotificationsPage'
import OrderDetailsPage from '@/pages/OrderDetailsPage'
import OrderHistoryPage from '@/pages/OrderHistoryPage'
import OrderTrackingPage from '@/pages/OrderTrackingPage'
import OrdersPage from '@/pages/OrdersPage'
import PortPage from '@/pages/PortPage'
import ProfilePage from '@/pages/ProfilePage'
import RegisterPage from '@/pages/RegisterPage'
import SettingsPage from '@/pages/SettingsPage'
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
  const { user, isAuthenticated } = useAuthStore()

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
      { path: '/create-order', element: <ProtectedRoute><CreateOrderPage /></ProtectedRoute> },
      { path: '/carriers', element: <ProtectedRoute><CarrierSearchPage /></ProtectedRoute> },
      { path: '/orders', element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: '/orders/:id', element: <ProtectedRoute><OrderDetailsPage /></ProtectedRoute> },
      { path: '/orders/:id/tracking', element: <ProtectedRoute><OrderTrackingPage /></ProtectedRoute> },
      { path: '/map', element: <ProtectedRoute><MapPage /></ProtectedRoute> },
      { path: '/port', element: <ProtectedRoute><PortPage /></ProtectedRoute> },
      { path: '/ai', element: <ProtectedRoute><AIPage /></ProtectedRoute> },
      { path: '/chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
      { path: '/chat/:id', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
      { path: '/notifications', element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> },
      { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '/become-carrier', element: <ProtectedRoute><BecomeCarrierPage /></ProtectedRoute> },
      { path: '/history', element: <ProtectedRoute><OrderHistoryPage /></ProtectedRoute> },
      { path: '/settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: '/support', element: <ProtectedRoute><SupportPage /></ProtectedRoute> },
      { path: '/about', element: <ProtectedRoute><AboutPage /></ProtectedRoute> },
      { path: '/carrier', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierDashboardPage /></ProtectedRoute> },
      { path: '/carrier/orders', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierOrdersPage /></ProtectedRoute> },
      { path: '/carrier/transport', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierTransportPage /></ProtectedRoute> },
      { path: '/carrier/free-transport', element: <ProtectedRoute requiredRole="carrier" allowApprovedCarrier><CarrierFreeTransportPage /></ProtectedRoute> },
      { path: '/akimat', element: <ProtectedRoute requiredRole="akimat"><AkimatDashboardPage /></ProtectedRoute> },
    ],
  },
]

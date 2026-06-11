export type UserRole = 'guest' | 'user' | 'carrier' | 'admin' | 'akimat'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  rating?: number
  company?: string
  avatar?: string
  carrierStatus?: 'pending' | 'approved' | 'rejected'
}

export interface Carrier {
  id: string
  name: string
  company?: string
  rating: number
  experience: number
  price: number
  transport: string
  avatar?: string
  etaLabel?: string
  capacityLabel?: string
  volumeLabel?: string
  badge?: string
  phone?: string
}

export interface Order {
  id: string
  number: string
  from: string
  fromRegion?: string
  to: string
  toRegion?: string
  cargoType: string
  weight: number
  volume: number
  places: number
  pickupDate: string
  deliveryDate: string
  transportType: string
  price: number
  comment?: string
  requirements?: string[]
  notes?: string
  status: 'created' | 'searching' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled'
  carrierId?: string
  createdAt: string
  routeStops?: Array<{
    title: string
    subtitle: string
    color: 'blue' | 'violet' | 'amber' | 'green' | 'red'
  }>
  trackingEvents?: Array<{
    time: string
    title: string
    location: string
  }>
  progressLabel?: string
  remainingLabel?: string
  speedLabel?: string
}

export interface Port {
  id: string
  name: string
  location: { lat: number; lng: number }
  load: number
}

export interface Checkpoint {
  id: string
  name: string
  location: { lat: number; lng: number }
  load: number
}

export interface Vessel {
  id: string
  name: string
  location: { lat: number; lng: number }
  status: string
}

export interface Truck {
  id: string
  name: string
  location: { lat: number; lng: number }
  status: string
}

export interface Notification {
  id: string
  type: 'carrier_found' | 'new_message' | 'order_updated' | 'cargo_delivered'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Chat {
  id: string
  participant: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage?: string
  unreadCount: number
}

export interface Message {
  id: string
  senderId: string
  text: string
  createdAt: string
}

export interface Route {
  route: string[]
  distance: number
  eta: string
  risk: string
  cost: string
}

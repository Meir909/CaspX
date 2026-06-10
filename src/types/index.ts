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

export interface Order {
  id: string
  from: string
  to: string
  cargoType: string
  weight: number
  volume: number
  date: string
  comment?: string
  requirements?: string[]
  status: 'created' | 'searching' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled'
  carrier?: Carrier
  createdAt: string
}

export interface Carrier {
  id: string
  name: string
  rating: number
  experience: number
  price: number
  transport: string
  avatar?: string
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

export interface Stat {
  label: string
  value: number | string
  icon: string
}

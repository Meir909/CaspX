import { create } from 'zustand'
import { User, UserRole, Notification, Chat, Message } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  switchRole: (role: UserRole) => void
  initialize: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  switchRole: (role) => set((state) => state.user ? { user: { ...state.user, role } } : state),
  initialize: () => {
    const mockUser: User = {
      id: '1',
      name: 'Алишер А.',
      email: 'alisher@example.com',
      phone: '+7 701 123 4567',
      role: 'user',
      rating: 4.8,
      company: 'TOO Caspian Logistics',
      carrierStatus: 'approved'
    }
    set({ user: mockUser, isAuthenticated: true })
  }
}))

interface UIStore {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open })
}))

interface MapStore {
  layers: {
    ports: boolean
    checkpoints: boolean
    vessels: boolean
    trucks: boolean
    routes: boolean
    load: boolean
  }
  toggleLayer: (layer: keyof MapStore['layers']) => void
}

export const useMapStore = create<MapStore>((set) => ({
  layers: {
    ports: true,
    checkpoints: true,
    vessels: false,
    trucks: false,
    routes: false,
    load: false
  },
  toggleLayer: (layer) => set((state) => ({
    layers: { ...state.layers, [layer]: !state.layers[layer] }
  }))
}))

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: '1',
      type: 'carrier_found',
      title: 'Найден перевозчик!',
      message: 'Перевозчик John D. готов взять ваш заказ',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'new_message',
      title: 'Новое сообщение',
      message: 'Вы получили новое сообщение в чате',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  }))
}))

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  messages: Message[]
  setCurrentChat: (id: string | null) => void
  sendMessage: (text: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: [
    {
      id: '1',
      participant: {
        id: '2',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      lastMessage: 'Привет! Я готов взять ваш заказ',
      unreadCount: 2
    },
    {
      id: '2',
      participant: {
        id: '3',
        name: 'Sarah Smith',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      lastMessage: 'Спасибо за быструю доставку!',
      unreadCount: 0
    }
  ],
  currentChatId: null,
  messages: [
    {
      id: '1',
      senderId: '2',
      text: 'Привет! Я готов взять ваш заказ',
      createdAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: '2',
      senderId: '1',
      text: 'Отлично! Когда вы сможете забрать?',
      createdAt: new Date(Date.now() - 30000).toISOString()
    }
  ],
  setCurrentChat: (id) => set({ currentChatId: id }),
  sendMessage: (text) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      senderId: '1',
      text,
      createdAt: new Date().toISOString()
    }]
  }))
}))

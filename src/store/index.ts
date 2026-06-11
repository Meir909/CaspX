import { create } from 'zustand'
import type { Message, Notification, User, UserRole } from '@/types'
import { appUser, initialMessages, notifications as seedNotifications } from '@/data/mock'

const STORAGE_KEY = 'caspx-role'

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
  login: (user) => {
    localStorage.setItem(STORAGE_KEY, user.role)
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, isAuthenticated: false })
  },
  switchRole: (role) =>
    set((state) => {
      if (!state.user) return state
      localStorage.setItem(STORAGE_KEY, role)
      return {
        user: {
          ...state.user,
          role,
        },
      }
    }),
  initialize: () => {
    const storedRole = localStorage.getItem(STORAGE_KEY) as UserRole | null
    set({
      user: {
        ...appUser,
        role: storedRole ?? appUser.role,
      },
      isAuthenticated: true,
    })
  },
}))

interface UIStore {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
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
    trucks: true,
    routes: true,
    load: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
}))

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: seedNotifications,
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
}))

interface ChatStore {
  currentChatId: string | null
  messagesByChat: Record<string, Message[]>
  setCurrentChat: (id: string | null) => void
  appendMessage: (chatId: string, message: Message) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  currentChatId: null,
  messagesByChat: initialMessages,
  setCurrentChat: (id) => set({ currentChatId: id }),
  appendMessage: (chatId, message) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...(state.messagesByChat[chatId] ?? []), message],
      },
    })),
}))

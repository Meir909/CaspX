import { create } from 'zustand'
import type { Message, Notification, User, UserRole } from '@/types'
import { appUser, initialMessages, notifications as seedNotifications } from '@/data/mock'
import { clearSessionTokens, hasSessionTokens, isLiveApiEnabled } from '@/lib/session'

const ROLE_STORAGE_KEY = 'caspx-role'
const USER_STORAGE_KEY = 'caspx-user'

function persistUser(user: User) {
  localStorage.setItem(ROLE_STORAGE_KEY, user.role)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
  login: (user: User) => void
  logout: () => void
  switchRole: (role: UserRole) => void
  updateProfile: (payload: Partial<User>) => void
  initialize: () => void
  setReady: (value: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isReady: false,
  login: (user) => {
    persistUser(user)
    set({ user, isAuthenticated: true, isReady: true })
  },
  logout: () => {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    clearSessionTokens()
    set({ user: null, isAuthenticated: false, isReady: true })
  },
  switchRole: (role) =>
    set((state) => {
      if (!state.user) return state
      const nextUser = { ...state.user, role }
      persistUser(nextUser)
      return { user: nextUser }
    }),
  updateProfile: (payload) =>
    set((state) => {
      if (!state.user) return state
      const nextUser = { ...state.user, ...payload }
      persistUser(nextUser)
      return { user: nextUser }
    }),
  initialize: () => {
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    const parsedUser = storedUser ? (JSON.parse(storedUser) as User) : null

    if (parsedUser) {
      const user = { ...parsedUser, role: storedRole ?? parsedUser.role }
      persistUser(user)
      set({ user, isAuthenticated: true, isReady: true })
      return
    }

    if (isLiveApiEnabled() || hasSessionTokens()) {
      set({ user: null, isAuthenticated: false, isReady: false })
      return
    }

    const user = { ...appUser, role: storedRole ?? appUser.role }
    persistUser(user)
    set({ user, isAuthenticated: true, isReady: true })
  },
  setReady: (value) => set({ isReady: value }),
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
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: seedNotifications,
  setNotifications: (notifications) => set({ notifications }),
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

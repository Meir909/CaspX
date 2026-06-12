import { create } from 'zustand'
import type { User, UserRole } from '@/types'
import { clearSessionTokens, hasSessionTokens } from '@/lib/session'

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

    if (hasSessionTokens()) {
      set({ user: null, isAuthenticated: false, isReady: false })
      return
    }

    set({ user: null, isAuthenticated: false, isReady: true })
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

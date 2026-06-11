import { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'
import { api } from './api'
import { hasSessionTokens, isLiveApiEnabled } from './lib/session'
import { routes } from './routes'
import { useAuthStore } from './store'

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isReady = useAuthStore((state) => state.isReady)
  const setReady = useAuthStore((state) => state.setReady)
  const element = useRoutes(routes)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLiveApiEnabled() || !hasSessionTokens() || isAuthenticated || isReady) {
      if (!isReady && (!isLiveApiEnabled() || !hasSessionTokens())) {
        setReady(true)
      }
      return
    }

    let cancelled = false

    void api.auth
      .getProfile()
      .then((user) => {
        if (!cancelled) {
          login(user)
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout()
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isReady, login, logout, setReady])

  return element
}

export default App

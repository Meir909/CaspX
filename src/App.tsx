import { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { useAuthStore } from './store'

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const element = useRoutes(routes)

  useEffect(() => {
    initialize()
  }, [initialize])

  return element
}

export default App

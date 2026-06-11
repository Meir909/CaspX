import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { ErrorState } from '@/components/ui/async-state'

type MapMarker = {
  id: string
  label: string
  coordinates: [number, number]
}

type MapRoute = {
  id: string
  color: string
  coordinates: [number, number][]
}

type MapGlEntity = { destroy?: () => void }

type MapGlMap = MapGlEntity

type MapGlNamespace = {
  Map: new (
    container: HTMLElement,
    options: {
      key: string
      center: [number, number]
      zoom: number
      pitch?: number
      rotation?: number
      style?: string
    },
  ) => MapGlMap
  Marker: new (
    map: MapGlMap,
    options: {
      coordinates: [number, number]
      color?: string
      label?: {
        text: string
        offset?: [number, number]
      }
    },
  ) => MapGlEntity
  Polyline?: new (
    map: MapGlMap,
    options: {
      coordinates: [number, number][]
      color?: string
      width?: number
    },
  ) => MapGlEntity
}

declare global {
  interface Window {
    mapgl?: MapGlNamespace
  }
}

const MAPGL_SCRIPT_ID = 'caspx-2gis-mapgl-script'
const MAPGL_SCRIPT_SRC = 'https://mapgl.2gis.com/api/js/v1'

let mapGlLoader: Promise<MapGlNamespace> | null = null

function loadMapGl(key: string) {
  if (window.mapgl) {
    return Promise.resolve(window.mapgl)
  }

  if (mapGlLoader) {
    return mapGlLoader
  }

  mapGlLoader = new Promise<MapGlNamespace>((resolve, reject) => {
    const existing = document.getElementById(MAPGL_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.mapgl) resolve(window.mapgl)
        else reject(new Error('2GIS SDK loaded without mapgl namespace'))
      })
      existing.addEventListener('error', () => reject(new Error('Failed to load 2GIS SDK')))
      return
    }

    const script = document.createElement('script')
    script.id = MAPGL_SCRIPT_ID
    script.async = true
    script.src = `${MAPGL_SCRIPT_SRC}?key=${encodeURIComponent(key)}`
    script.onload = () => {
      if (window.mapgl) {
        resolve(window.mapgl)
      } else {
        reject(new Error('2GIS SDK loaded without mapgl namespace'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load 2GIS SDK'))
    document.head.appendChild(script)
  })

  return mapGlLoader
}

export default function TwoGisTransitMap({
  apiKey,
  markers,
  routes,
  activeRouteId,
}: {
  apiKey?: string
  markers: MapMarker[]
  routes: MapRoute[]
  activeRouteId?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    apiKey ? 'loading' : 'error',
  )
  const [errorMessage, setErrorMessage] = useState('')

  const activeRoute = useMemo(
    () => routes.find((route) => route.id === activeRouteId) ?? routes[0],
    [activeRouteId, routes],
  )

  useEffect(() => {
    if (!apiKey) {
      setStatus('error')
      setErrorMessage('В .env.development не найден VITE_2GIS_MAP_KEY.')
      return
    }

    if (!containerRef.current) return

    let cancelled = false
    const entities: MapGlEntity[] = []

    setStatus('loading')
    setErrorMessage('')

    void loadMapGl(apiKey)
      .then((mapgl) => {
        if (cancelled || !containerRef.current) return

        const map = new mapgl.Map(containerRef.current, {
          key: apiKey,
          center: activeRoute?.coordinates[0] ?? [51.1694, 43.6351],
          zoom: 5.2,
          pitch: 20,
          rotation: -8,
        })

        entities.push(map)

        markers.forEach((marker) => {
          entities.push(
            new mapgl.Marker(map, {
              coordinates: marker.coordinates,
              color: '#2563eb',
              label: {
                text: marker.label,
                offset: [0, -28],
              },
            }),
          )
        })

        const Polyline = mapgl.Polyline
        if (Polyline) {
          routes.forEach((route) => {
            entities.push(
              new Polyline(map, {
                coordinates: route.coordinates,
                color: route.id === activeRoute?.id ? route.color : `${route.color}99`,
                width: route.id === activeRoute?.id ? 6 : 4,
              }),
            )
          })
        }

        if (!cancelled) {
          setStatus('ready')
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage(error.message)
        }
      })

    return () => {
      cancelled = true
      entities.reverse().forEach((entity) => entity.destroy?.())
    }
  }, [activeRoute, apiKey, markers, routes])

  if (!apiKey) {
    return (
      <ErrorState
        title="Ключ 2GIS не подключён"
        description="Добавьте VITE_2GIS_MAP_KEY в локальный env, чтобы включить настоящую карту."
      />
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Карта 2GIS не загрузилась"
        description={errorMessage || 'Проверьте ключ карты или доступность SDK 2GIS.'}
      />
    )
  }

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/5 bg-[#071322]">
      <div ref={containerRef} className="h-[320px] w-full" />
      {status !== 'ready' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#071322]/85">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <MapPinned size={22} />
          </div>
          <div className="text-sm text-text-secondary">Подключаем карту 2GIS...</div>
        </div>
      ) : null}
    </div>
  )
}

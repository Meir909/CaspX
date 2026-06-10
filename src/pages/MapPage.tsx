import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Layers, Ship, Truck, MapPin, Navigation } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useMapStore } from '@/store'
import { usePorts, useCheckpoints, useVessels, useTrucks } from '@/hooks'
import { cn } from '@/lib/utils'

type MapGlWindow = Window & {
  mapgl?: {
    Map: new (container: string | HTMLElement, options: Record<string, unknown>) => {
      destroy?: () => void
    }
    Marker: new (
      map: unknown,
      options: { coordinates: [number, number]; icon?: string }
    ) => unknown
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const { layers, toggleLayer } = useMapStore()
  const { data: ports } = usePorts()
  const { data: checkpoints } = useCheckpoints()
  const { data: vessels = [] } = useVessels()
  const { data: trucks = [] } = useTrucks()

  useEffect(() => {
    const mapgl = (window as MapGlWindow).mapgl
    const mapKey = 'YOUR_2GIS_KEY'

    if (!mapRef.current || !mapgl || mapKey === 'YOUR_2GIS_KEY') {
      return
    }

    const map = new mapgl.Map(mapRef.current, {
      center: [51.168, 43.635],
      zoom: 7.5,
      key: mapKey,
    })

    const addMarker = (
      coordinates: [number, number],
      color: string,
      label: string,
    ) => {
      new mapgl.Marker(map, {
        coordinates,
        icon: `<div style="width:28px;height:28px;border-radius:9999px;background:${color};border:2px solid white;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${label}</div>`,
      })
    }

    if (layers.ports) {
      ports?.forEach((port) => addMarker([port.location.lng, port.location.lat], '#0D6EFD', 'P'))
    }

    if (layers.checkpoints) {
      checkpoints?.forEach((point) => addMarker([point.location.lng, point.location.lat], '#4F46E5', 'K'))
    }

    if (layers.vessels) {
      vessels.forEach((vessel) => addMarker([vessel.location.lng, vessel.location.lat], '#22C55E', 'S'))
    }

    if (layers.trucks) {
      trucks.forEach((truck) => addMarker([truck.location.lng, truck.location.lat], '#EAB308', 'T'))
    }

    return () => {
      map.destroy?.()
    }
  }, [checkpoints, layers, ports, trucks, vessels])

  const layerItems = [
    { key: 'ports', label: 'Порты', icon: <Ship size={16} /> },
    { key: 'checkpoints', label: 'КПП', icon: <MapPin size={16} /> },
    { key: 'vessels', label: 'Суда', icon: <Ship size={16} /> },
    { key: 'trucks', label: 'Грузовики', icon: <Truck size={16} /> },
    { key: 'routes', label: 'Маршруты', icon: <Navigation size={16} /> },
    { key: 'load', label: 'Загруженность', icon: <Layers size={16} /> }
  ]

  return (
    <div className="h-full relative">
      <div ref={mapRef} id="map" className="w-full h-[calc(100vh-144px)]" />

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-4 right-4 z-10"
      >
        <Card className="p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Слои</h3>
            <Layers size={20} className="text-text-secondary" />
          </div>
          <div className="space-y-2">
            {layerItems.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleLayer(item.key as keyof typeof layers)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  layers[item.key as keyof typeof layers]
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-bg-secondary text-text-secondary'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {layers[item.key as keyof typeof layers] && (
                  <div className="ml-auto w-3 h-3 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-4 left-4 right-4 z-10"
      >
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-text-secondary">
            <span>Порты: {ports?.length ?? 0}</span>
            <span>Суда: {vessels.length}</span>
            <span>Грузовики: {trucks.length}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {ports?.slice(0, 2).map((port) => (
              <div key={port.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    port.load > 70 ? 'bg-error' : port.load > 40 ? 'bg-warning' : 'bg-success',
                  )}
                />
                <span>{port.name}</span>
                <span className="text-text-secondary">{port.load}%</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {((window as MapGlWindow).mapgl === undefined) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-bg-primary/90 px-5 py-4 text-center text-sm text-text-secondary shadow-xl">
            Подключите реальный ключ 2GIS в `src/pages/MapPage.tsx`, чтобы активировать карту.
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { LatLng } from '@/domain/geo'
import { cn } from '@/lib/utils'

export function Recenter({ center, zoom }: { center: LatLng; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom(), { animate: true })
  }, [center.lat, center.lng, zoom, map])
  return null
}

/** Invalida el tamaño cuando el contenedor cambia (layouts colapsables) */
export function AutoResize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  return null
}

export function MapBase({
  center, zoom = 13, className, children, interactive = true,
}: {
  center: LatLng
  zoom?: number
  className?: string
  children?: React.ReactNode
  interactive?: boolean
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      attributionControl
      className={cn('h-full w-full', className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <AutoResize />
      {children}
    </MapContainer>
  )
}

export function pinIcon(label: string, opts: { active?: boolean; tone?: 'acento' | 'danger' | 'ok' } = {}) {
  const bg = opts.tone === 'danger' ? 'rgb(var(--danger))' : opts.tone === 'ok' ? 'rgb(var(--ok))' : 'rgb(var(--acento))'
  const scale = opts.active ? 1.18 : 1
  return L.divIcon({
    className: 'soe-pin',
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    html: `<div style="width:40px;height:48px;display:flex;flex-direction:column;align-items:center;scale:${scale};transform-origin:bottom center;transition:scale .15s">
      <div style="min-width:34px;height:34px;padding:0 7px;border-radius:999px;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font:700 12px 'JetBrains Mono',monospace;box-shadow:0 6px 16px -4px rgba(0,0,0,.35),0 0 0 3px ${opts.active ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.8)'}">${label}</div>
      <div style="width:2px;height:10px;background:${bg};border-radius:2px;margin-top:-1px"></div>
    </div>`,
  })
}

export function meIcon() {
  return L.divIcon({
    className: 'soe-pin',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div style="position:relative;width:22px;height:22px">
      <div class="animate-ring" style="position:absolute;inset:0;border-radius:999px;background:rgba(37,99,235,.35)"></div>
      <div style="position:absolute;inset:4px;border-radius:999px;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>
    </div>`,
  })
}

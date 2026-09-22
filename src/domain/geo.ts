export interface LatLng {
  lat: number
  lng: number
}

export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatKm(km: number, lang: 'es' | 'en' = 'es') {
  const s = km < 10 ? km.toFixed(1) : Math.round(km).toString()
  return `${lang === 'es' ? s.replace('.', ',') : s} km`
}

export const CITY_CENTER: Record<string, LatLng> = {
  Caracas: { lat: 10.4966, lng: -66.8533 },
  Valencia: { lat: 10.162, lng: -68.0077 },
  Maracaibo: { lat: 10.6545, lng: -71.6406 },
  Barquisimeto: { lat: 10.0678, lng: -69.3467 },
}

/** Ubicación simulada del cliente: Chacao, Caracas */
export const CLIENT_LOCATION: LatLng = { lat: 10.4958, lng: -66.8531 }

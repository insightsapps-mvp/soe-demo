import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import type { Lang } from './types'

export const MIN = 60_000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR

export const loc = (lang: Lang) => (lang === 'es' ? es : enUS)

export function fmtDate(iso: string, lang: Lang, pattern?: string) {
  return format(new Date(iso), pattern ?? (lang === 'es' ? 'd MMM yyyy' : 'MMM d, yyyy'), { locale: loc(lang) })
}

export function fmtDateTime(iso: string, lang: Lang) {
  return format(new Date(iso), lang === 'es' ? 'd MMM, HH:mm' : 'MMM d, h:mm a', { locale: loc(lang) })
}

export function fmtTime(iso: string, lang: Lang) {
  return format(new Date(iso), lang === 'es' ? 'HH:mm' : 'h:mm a', { locale: loc(lang) })
}

/** Tiempo restante corto: "40min", "6h 10min", "2d 3h" */
export function remainingShort(ms: number, lang: Lang) {
  if (ms <= 0) return lang === 'es' ? 'vencido' : 'expired'
  const min = Math.floor(ms / MIN)
  if (min < 60) return `${Math.max(1, min)}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h${min % 60 ? ` ${min % 60}min` : ''}`
  const d = Math.floor(h / 24)
  return `${d}d${h % 24 ? ` ${h % 24}h` : ''}`
}

/** Hace X: "hace 42 min" / "42 min ago" */
export function agoShort(iso: string, lang: Lang, now = Date.now()) {
  const ms = Math.max(0, now - new Date(iso).getTime())
  const min = Math.floor(ms / MIN)
  let s: string
  if (min < 60) s = `${Math.max(1, min)} min`
  else if (min < 60 * 24) s = `${Math.floor(min / 60)} h`
  else s = `${Math.floor(min / 1440)} ${lang === 'es' ? 'd' : 'd'}`
  return lang === 'es' ? `hace ${s}` : `${s} ago`
}

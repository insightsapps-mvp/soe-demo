import type { Categoria, Comercio, MetodoPago, Producto, Transaccion } from './types'
import type { SeedState } from '@/data/seed'
import { isFood } from '@/data/seed'
import { DAY, HOUR } from './dates'
import { haversineKm, type LatLng } from './geo'

export type DemoData = SeedState

export const PERIOD_MS = 30 * DAY

export const vencMs = (p: Producto) => new Date(p.vencimiento).getTime()

/** Un producto es visible/activo si está 'activo', no fue dado de baja y aún no venció */
export const isLive = (p: Producto, now: number) => p.estado === 'activo' && !p.dadoDeBaja && vencMs(p) > now

/** Estado efectivo: un activo con fecha pasada se muestra como vencido */
export function effectiveEstado(p: Producto, now: number): Producto['estado'] {
  if (p.estado === 'activo' && vencMs(p) <= now) return 'vencido'
  return p.estado
}

export const inPeriod = (iso: string, now: number, ms = PERIOD_MS) => {
  const t = new Date(iso).getTime()
  return t > now - ms && t <= now + 60_000
}

export const approvedInPeriod = (d: DemoData, now: number) =>
  d.transacciones.filter((t) => t.estado === 'aprobado' && inPeriod(t.fecha, now))

export function platformStats(d: DemoData, now: number) {
  const live = d.productos.filter((p) => isLive(p, now))
  const tx = approvedInPeriod(d, now)
  const vencidos = d.productos.filter(
    (p) => !p.dadoDeBaja && effectiveEstado(p, now) === 'vencido' && inPeriod(p.vencimiento, now),
  ).length
  const kgGr = tx.reduce((s, t) => s + t.pesoGr, 0)
  const ahorro = tx.reduce((s, t) => s + t.ahorroUsdCents, 0)
  const ingresos = tx.reduce((s, t) => s + t.montoUsdCents, 0)
  const comision = tx.reduce((s, t) => s + t.comisionUsdCents, 0)
  const urgentes = live.filter((p) => vencMs(p) - now < 6 * HOUR)
  const idle = d.comercios.filter((c) => c.activo && now - new Date(c.ultimaActividad).getTime() > 7 * DAY)
  const rechazadas = d.transacciones.filter((t) => t.estado === 'rechazado')
  const pendientes = d.transacciones.filter((t) => t.estado === 'pendiente')
  return {
    comerciosActivos: d.comercios.filter((c) => c.activo).length,
    comerciosTotal: d.comercios.length,
    ciudades: new Set(d.comercios.filter((c) => c.activo).map((c) => c.ciudad)).size,
    productosActivos: live.length,
    vendidosMes: tx.length,
    vencidosMes: vencidos,
    conversion: d.visitasDetalleMes ? tx.length / d.visitasDetalleMes : 0,
    kgGr,
    ahorroUsdCents: ahorro,
    ingresosUsdCents: ingresos,
    comisionUsdCents: comision,
    urgentes,
    idle,
    rechazadas,
    pendientes,
  }
}

export function comercioStats(d: DemoData, comercioId: string, now: number) {
  const prods = d.productos.filter((p) => p.comercioId === comercioId)
  const live = prods.filter((p) => isLive(p, now))
  const tx = approvedInPeriod(d, now).filter((t) => t.comercioId === comercioId)
  return {
    total: prods.length,
    activos: live.length,
    vendidosTotal: prods.filter((p) => p.estado === 'vendido').length,
    vencidosTotal: prods.filter((p) => !p.dadoDeBaja && effectiveEstado(p, now) === 'vencido').length,
    baja: prods.filter((p) => p.dadoDeBaja).length,
    vendidosMes: tx.length,
    ingresosUsdCents: tx.reduce((s, t) => s + t.montoUsdCents, 0),
    kgGr: tx.reduce((s, t) => s + t.pesoGr, 0),
    ahorroUsdCents: tx.reduce((s, t) => s + t.ahorroUsdCents, 0),
    urgentes: live.filter((p) => vencMs(p) - now < 6 * HOUR),
    hoy: live.filter((p) => vencMs(p) - now < 24 * HOUR),
    live,
    prods,
  }
}

export function clientStats(d: DemoData, clienteId: string) {
  const tx = d.transacciones.filter((t) => t.clienteId === clienteId && t.estado === 'aprobado')
  return {
    compras: tx.length,
    ahorroUsdCents: tx.reduce((s, t) => s + t.ahorroUsdCents, 0),
    gastoUsdCents: tx.reduce((s, t) => s + t.montoUsdCents, 0),
    kgGr: tx.reduce((s, t) => s + t.pesoGr, 0),
    tx,
  }
}

export const CATEGORIAS: Categoria[] = ['alimentos', 'panaderia', 'lacteos', 'bebidas', 'moda', 'cosmeticos']
export const METODOS: MetodoPago[] = ['pago_movil', 'binance', 'zelle']

export function salesByCategory(tx: Transaccion[]) {
  return CATEGORIAS.map((c) => ({
    categoria: c,
    ventas: tx.filter((t) => t.categoria === c).length,
    ingresosUsdCents: tx.filter((t) => t.categoria === c).reduce((s, t) => s + t.montoUsdCents, 0),
  }))
}

export function methodDistribution(tx: Transaccion[]) {
  const total = tx.length || 1
  return METODOS.map((m) => {
    const n = tx.filter((t) => t.metodo === m).length
    return { metodo: m, n, pct: (n / total) * 100, usd: tx.filter((t) => t.metodo === m).reduce((s, t) => s + t.montoUsdCents, 0) }
  })
}

export function salesByDay(tx: Transaccion[], now: number, days = 30) {
  const out: { dia: string; ventas: number; ingresosUsdCents: number; ahorroUsdCents: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const end = now - i * DAY
    const start = end - DAY
    const list = tx.filter((t) => {
      const ts = new Date(t.fecha).getTime()
      return ts > start && ts <= end
    })
    out.push({
      dia: new Date(end).toISOString(),
      ventas: list.length,
      ingresosUsdCents: list.reduce((s, t) => s + t.montoUsdCents, 0),
      ahorroUsdCents: list.reduce((s, t) => s + t.ahorroUsdCents, 0),
    })
  }
  return out
}

export function topComercios(d: DemoData, now: number, n = 8) {
  const tx = approvedInPeriod(d, now)
  const map = new Map<string, { ventas: number; usd: number }>()
  for (const t of tx) {
    const m = map.get(t.comercioId) ?? { ventas: 0, usd: 0 }
    m.ventas++
    m.usd += t.montoUsdCents
    map.set(t.comercioId, m)
  }
  const liveBy = new Map<string, number>()
  for (const p of d.productos) if (isLive(p, now)) liveBy.set(p.comercioId, (liveBy.get(p.comercioId) ?? 0) + 1)
  return d.comercios
    .map((c) => ({ c, ventas: map.get(c.id)?.ventas ?? 0, usd: map.get(c.id)?.usd ?? 0, activos: liveBy.get(c.id) ?? 0 }))
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, n)
}

export function cityActivity(d: DemoData, now: number) {
  const tx = approvedInPeriod(d, now)
  const byId = new Map(d.comercios.map((c) => [c.id, c]))
  const cities = ['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto']
  return cities.map((ciudad) => ({
    ciudad,
    ventas: tx.filter((t) => byId.get(t.comercioId)?.ciudad === ciudad).length,
    comercios: d.comercios.filter((c) => c.ciudad === ciudad && c.activo).length,
    activos: d.productos.filter((p) => isLive(p, now) && byId.get(p.comercioId)?.ciudad === ciudad).length,
  }))
}

export interface FeedItem {
  p: Producto
  c: Comercio
  km: number
}

export function nearbyFeed(d: DemoData, now: number, from: LatLng, radiusKm: number) {
  const byId = new Map(d.comercios.map((c) => [c.id, c]))
  const out: FeedItem[] = []
  for (const p of d.productos) {
    if (!isLive(p, now)) continue
    const c = byId.get(p.comercioId)
    if (!c || !c.activo) continue
    const km = haversineKm(from, p)
    if (km <= radiusKm) out.push({ p, c, km })
  }
  return out
}

export function kgSaved(tx: Transaccion[]) {
  return tx.filter((t) => t.estado === 'aprobado' && isFood(t.categoria)).reduce((s, t) => s + t.pesoGr, 0)
}

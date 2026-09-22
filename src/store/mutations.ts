import type { Producto, TasaCambio, TasaHistorica, Transaccion } from '@/domain/types'
import type { SeedState } from '@/data/seed'

export type Mutation =
  | { type: 'publish'; producto: Producto }
  | { type: 'update'; id: string; patch: Partial<Producto> }
  | { type: 'sell'; productoId: string; tx: Transaccion }
  | { type: 'baja'; id: string; motivo: string }
  | { type: 'favorite'; clienteId: string; productoId: string }
  | { type: 'comercioActivo'; id: string; activo: boolean; at: string }
  | { type: 'rates'; tasas: TasaCambio[] }
  | { type: 'retryTx'; txId: string; at: string }
  | { type: 'visit'; productoId: string }
  | { type: 'search'; q: string }
  | { type: 'fxConfig'; fuente?: 'BCV' | 'CoinGecko'; frecuenciaMin?: number }

/** Aplica una mutación de forma pura sobre el estado */
export function applyMutation(s: SeedState, m: Mutation): SeedState {
  switch (m.type) {
    case 'publish':
      return {
        ...s,
        productos: [m.producto, ...s.productos],
        comercios: s.comercios.map((c) => (c.id === m.producto.comercioId ? { ...c, ultimaActividad: m.producto.publicadoEl } : c)),
      }
    case 'update':
      return { ...s, productos: s.productos.map((p) => (p.id === m.id ? { ...p, ...m.patch } : p)) }
    case 'sell': {
      const exists = s.transacciones.some((t) => t.id === m.tx.id)
      return {
        ...s,
        productos: s.productos.map((p) => (p.id === m.productoId ? { ...p, estado: 'vendido' } : p)),
        transacciones: exists ? s.transacciones : [m.tx, ...s.transacciones],
        comercios: s.comercios.map((c) => (c.id === m.tx.comercioId ? { ...c, ultimaActividad: m.tx.fecha } : c)),
      }
    }
    case 'baja':
      return { ...s, productos: s.productos.map((p) => (p.id === m.id ? { ...p, dadoDeBaja: true, bajaMotivo: m.motivo } : p)) }
    case 'favorite':
      return {
        ...s,
        clientes: s.clientes.map((c) =>
          c.id !== m.clienteId
            ? c
            : { ...c, favoritos: c.favoritos.includes(m.productoId) ? c.favoritos.filter((f) => f !== m.productoId) : [m.productoId, ...c.favoritos] },
        ),
      }
    case 'comercioActivo':
      return { ...s, comercios: s.comercios.map((c) => (c.id === m.id ? { ...c, activo: m.activo } : c)) }
    case 'rates': {
      const ves = m.tasas.find((t) => t.par === 'VES_USD')!.valor
      const usdt = m.tasas.find((t) => t.par === 'USD_USDT')!.valor
      const hist: TasaHistorica[] = s.tasasHist.slice()
      hist[hist.length - 1] = { ...hist[hist.length - 1], VES_USD: ves, USD_USDT: usdt }
      return { ...s, tasas: m.tasas, tasasHist: hist }
    }
    case 'retryTx': {
      const tx = s.transacciones.find((t) => t.id === m.txId)
      if (!tx || tx.estado === 'aprobado') return s
      const prod = s.productos.find((p) => p.id === tx.productoId)
      const canApprove = prod && prod.estado === 'activo' && !prod.dadoDeBaja
      const t0 = new Date(m.at).getTime()
      const upd: Transaccion = {
        ...tx,
        estado: canApprove ? 'aprobado' : 'rechazado',
        webhook: [
          ...tx.webhook,
          { paso: 'reintento', fecha: m.at, detalle: ['Reintento manual desde el panel admin', 'Manual retry from admin panel'] },
          ...(canApprove
            ? [
                { paso: 'validado' as const, fecha: new Date(t0 + 2000).toISOString(), detalle: ['Monto y referencia validados', 'Amount and reference validated'] as [string, string] },
                { paso: 'confirmado' as const, fecha: new Date(t0 + 4000).toISOString(), detalle: ['Pago confirmado · producto marcado como vendido', 'Payment confirmed · product marked as sold'] as [string, string] },
              ]
            : [{ paso: 'fallido' as const, fecha: new Date(t0 + 2000).toISOString(), detalle: ['El producto ya no está disponible', 'Product is no longer available'] as [string, string] }]),
        ],
      }
      return {
        ...s,
        transacciones: s.transacciones.map((t) => (t.id === tx.id ? upd : t)),
        productos: canApprove ? s.productos.map((p) => (p.id === tx.productoId ? { ...p, estado: 'vendido' } : p)) : s.productos,
      }
    }
    case 'visit':
      return { ...s, visitasDetalleMes: s.visitasDetalleMes + 1, productos: s.productos.map((p) => (p.id === m.productoId ? { ...p, vistas: p.vistas + 1 } : p)) }
    case 'search': {
      const q = m.q.trim()
      if (!q) return s
      return { ...s, busquedas: [q, ...s.busquedas.filter((b) => b.toLowerCase() !== q.toLowerCase())].slice(0, 8) }
    }
    case 'fxConfig':
      return { ...s, fxFuente: m.fuente ?? s.fxFuente, fxFrecuenciaMin: m.frecuenciaMin ?? s.fxFrecuenciaMin }
  }
}

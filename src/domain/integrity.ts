import type { DemoData } from './selectors'
import { comercioStats, platformStats } from './selectors'

/** Verificaciones de coherencia del dataset demo. Solo corre en dev. */
export function assertDemoIntegrity(d: DemoData, now: number) {
  const errors: string[] = []
  const approvedByProduct = new Set(d.transacciones.filter((t) => t.estado === 'aprobado').map((t) => t.productoId))

  // 1) todo producto vendido tiene una transacción aprobada
  for (const p of d.productos) {
    if (p.estado === 'vendido' && !approvedByProduct.has(p.id)) errors.push(`Producto vendido sin transacción aprobada: ${p.id}`)
    if (p.precioFinalCents > p.precioOriginalCents) errors.push(`Precio final > original: ${p.id}`)
    if (!Number.isInteger(p.precioFinalCents) || !Number.isInteger(p.precioOriginalCents)) errors.push(`Importe no entero: ${p.id}`)
  }
  // 2) toda transacción aprobada apunta a un producto vendido
  const byId = new Map(d.productos.map((p) => [p.id, p]))
  for (const t of d.transacciones) {
    if (!Number.isInteger(t.montoCents) || !Number.isInteger(t.montoUsdCents)) errors.push(`Importe no entero: ${t.id}`)
    if (t.estado === 'aprobado' && byId.get(t.productoId)?.estado !== 'vendido') errors.push(`Tx aprobada con producto no vendido: ${t.id}`)
  }
  // 3) por comercio: activos + vendidos + vencidos + baja = total histórico
  let sumActivos = 0
  let sumVendidosMes = 0
  for (const c of d.comercios) {
    const s = comercioStats(d, c.id, now)
    const partial = s.activos + s.vendidosTotal + s.vencidosTotal + s.baja
    if (partial !== s.total) errors.push(`Comercio ${c.id}: ${partial} ≠ ${s.total}`)
    sumActivos += s.activos
    sumVendidosMes += s.vendidosMes
  }
  // 4) la suma de comercios = totales de la plataforma
  const ps = platformStats(d, now)
  if (sumActivos !== ps.productosActivos) errors.push(`Σ activos comercios ${sumActivos} ≠ plataforma ${ps.productosActivos}`)
  if (sumVendidosMes !== ps.vendidosMes) errors.push(`Σ vendidos comercios ${sumVendidosMes} ≠ plataforma ${ps.vendidosMes}`)

  if (errors.length) {
    console.error(`[soe] assertDemoIntegrity: ${errors.length} error(es)`, errors.slice(0, 20))
  } else {
    console.info(
      `[soe] integridad OK · ${ps.comerciosActivos} comercios · ${ps.productosActivos} activos · ${ps.vendidosMes} vendidos · ${Math.round(ps.kgGr / 1000)} kg · $${Math.round(ps.ahorroUsdCents / 100)} ahorro`,
    )
  }
  return errors
}

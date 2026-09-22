import type { Cliente, MetodoPago, Moneda, Producto, Transaccion } from './types'
import { convert, rateApplied, toUsdCents, type FxRates } from './fx'
import { isFood, METODO_FEE_BPS } from '@/data/seed'
import { newId } from '@/store/useDemoStore'

/** Construye la transacción aprobada de una venta (checkout del cliente o venta en mostrador) */
export function buildSaleTx(p: Producto, cliente: Pick<Cliente, 'id' | 'nombre'>, metodo: MetodoPago, moneda: Moneda, r: FxRates, at = new Date()): Transaccion {
  const finalUsd = toUsdCents(p.precioFinalCents, p.moneda, r)
  const origUsd = toUsdCents(p.precioOriginalCents, p.moneda, r)
  const monto = convert(p.precioFinalCents, p.moneda, moneda, r)
  const t = at.getTime()
  const src = metodo === 'binance' ? 'Binance Pay' : metodo === 'zelle' ? 'Zelle' : 'Pago Móvil'
  return {
    id: `TX-${newId('').slice(1).toUpperCase()}`,
    productoId: p.id,
    comercioId: p.comercioId,
    clienteId: cliente.id,
    clienteNombre: cliente.nombre,
    metodo,
    moneda,
    montoCents: monto,
    montoUsdCents: finalUsd,
    ahorroUsdCents: Math.max(0, origUsd - finalUsd),
    pesoGr: isFood(p.categoria) ? p.pesoGr : 0,
    categoria: p.categoria,
    estado: 'aprobado',
    fecha: at.toISOString(),
    tasaCambioAplicada: rateApplied(moneda, r),
    comisionUsdCents: Math.round((finalUsd * METODO_FEE_BPS[metodo]) / 10000),
    webhook: [
      { paso: 'recibido', fecha: new Date(t).toISOString(), detalle: [`Evento de ${src} recibido (firma HMAC válida)`, `${src} event received (valid HMAC signature)`] },
      { paso: 'validado', fecha: new Date(t + 1800).toISOString(), detalle: ['Monto y referencia validados', 'Amount and reference validated'] },
      { paso: 'confirmado', fecha: new Date(t + 3200).toISOString(), detalle: ['Pago confirmado · producto marcado como vendido', 'Payment confirmed · product marked as sold'] },
    ],
  }
}

export const COUNTER_CLIENT = { id: 'u-mostrador', nombre: 'Venta en tienda' }

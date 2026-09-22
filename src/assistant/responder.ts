import type { Lang } from '@/domain/types'
import type { DemoData } from '@/domain/selectors'
import { approvedInPeriod, cityActivity, comercioStats, methodDistribution, platformStats, salesByCategory, vencMs } from '@/domain/selectors'
import { formatMoney, formatNumber } from '@/domain/money'
import { remainingShort } from '@/domain/dates'
import { normalize } from '@/lib/utils'
import { translate } from '@/i18n/useT'
import { catKey, metodoKey } from '@/i18n/enums'

export interface AgentReply {
  text: string
  bullets?: string[]
  link?: { to: string; label: string }
}

const has = (q: string, words: string[]) => words.some((w) => q.includes(w))

/** Matching por keywords (ES/EN) sobre el store. Nunca números hardcodeados. */
export function respond(input: string, d: DemoData, lang: Lang, now = Date.now()): AgentReply {
  const q = normalize(input)
  const L = (es: string, en: string) => (lang === 'es' ? es : en)
  const s = platformStats(d, now)

  // Monto de la propuesta → deriva, no lo dice
  if (has(q, ['cuanto cuesta', 'precio de la propuesta', 'monto', 'inversion', 'presupuesto', 'cotizacion', 'cuanto sale', 'cuanto cobran', 'price of the proposal', 'how much does', 'investment', 'budget', 'quote', 'cost of the'])) {
    return {
      text: L('Eso está en la sección Propuesta, abajo de todo, tocá el ojito para verlo.', 'That’s in the Proposal section, at the very bottom — tap the eye icon to see it.'),
      link: { to: '/propuesta', label: L('Ir a la Propuesta', 'Go to the Proposal') },
    }
  }

  // Comercio por nombre
  const byName = d.comercios.find((c) => {
    const n = normalize(c.nombre)
    const core = n.replace(/^(panaderia|abasto|charcuteria|boutique|farmacia|fuente de soda|mercado|perfumeria|bodegon|pasteleria|fruteria|carniceria|queseria|lacteos|cafe|jugueria|licoreria|tienda|moda|zapateria|beauty store|drogueria|panificadora|dulceria|mercadito)\s+/, '')
    return q.includes(n) || (core.length > 5 && q.includes(core))
  })
  if (byName) {
    const cs = comercioStats(d, byName.id, now)
    return {
      text: L(`${byName.nombre} (${byName.zona}, ${byName.ciudad}) está ${byName.activo ? 'activo' : 'inactivo'}.`, `${byName.nombre} (${byName.zona}, ${byName.ciudad}) is ${byName.activo ? 'active' : 'inactive'}.`),
      bullets: [
        L(`${cs.activos} productos activos · ${cs.urgentes.length} vencen en menos de 6 h`, `${cs.activos} live products · ${cs.urgentes.length} expire in under 6 h`),
        L(`${formatNumber(cs.vendidosMes, lang)} ventas este mes · ${formatMoney(cs.ingresosUsdCents, 'USD', lang)}`, `${formatNumber(cs.vendidosMes, lang)} sales this month · ${formatMoney(cs.ingresosUsdCents, 'USD', lang)}`),
        L(`${formatNumber(cs.kgGr / 1000, lang, 0)} kg de comida salvada`, `${formatNumber(cs.kgGr / 1000, lang, 0)} kg of food saved`),
      ],
      link: { to: `/comercios/${byName.id}`, label: L('Ver comercio', 'View shop') },
    }
  }

  // Productos por vencer
  if (has(q, ['vencen', 'vence', 'por vencer', 'vencimiento', 'proximas', 'urgente', 'expire', 'expiring', 'expiry', 'urgent', 'next 6'])) {
    const byId = new Map(d.comercios.map((c) => [c.id, c]))
    const list = [...s.urgentes].sort((a, b) => vencMs(a) - vencMs(b))
    if (!list.length) return { text: L('No hay productos que venzan en las próximas 6 horas. 🎉', 'No products expire in the next 6 hours. 🎉') }
    return {
      text: L(`${list.length} productos vencen en las próximas 6 horas sin vender:`, `${list.length} products expire in the next 6 hours unsold:`),
      bullets: list.slice(0, 6).map((p) => `${p.nombre[lang === 'es' ? 0 : 1]} — ${byId.get(p.comercioId)?.nombre} · ${L('vence en', 'in')} ${remainingShort(vencMs(p) - now, lang)}`),
      link: { to: '/productos?urgentes=1', label: L('Ver todos', 'View all') },
    }
  }

  // Comida salvada / impacto / ahorro
  if (has(q, ['salv', 'kilo', 'kg', 'comida', 'impacto', 'desperdicio', 'ahorro', 'ahorr', 'saved', 'food', 'impact', 'waste', 'savings'])) {
    const prev = d.historial[d.historial.length - 1]
    const delta = ((s.kgGr - prev.kgGr) / prev.kgGr) * 100
    return {
      text: L(`Este mes se salvaron ${formatNumber(Math.round(s.kgGr / 1000), lang)} kg de comida.`, `${formatNumber(Math.round(s.kgGr / 1000), lang)} kg of food were saved this month.`),
      bullets: [
        L(`${formatNumber(s.vendidosMes, lang)} productos vendidos que no se perdieron`, `${formatNumber(s.vendidosMes, lang)} products sold instead of wasted`),
        L(`${formatMoney(s.ahorroUsdCents, 'USD', lang)} ahorrados por los clientes en descuentos`, `${formatMoney(s.ahorroUsdCents, 'USD', lang)} saved by customers in discounts`),
        L(`${delta >= 0 ? '▲' : '▼'} ${formatNumber(Math.abs(delta), lang, 0)}% vs. el mes anterior`, `${delta >= 0 ? '▲' : '▼'} ${formatNumber(Math.abs(delta), lang, 0)}% vs. last month`),
      ],
      link: { to: '/dashboard', label: L('Ver dashboard', 'View dashboard') },
    }
  }

  // Métodos de pago
  if (has(q, ['metodo', 'pago', 'binance', 'zelle', 'pago movil', 'payment', 'method', 'pay'])) {
    const dist = methodDistribution(approvedInPeriod(d, now)).sort((a, b) => b.pct - a.pct)
    return {
      text: L(`El método más usado es ${translate(lang, metodoKey(dist[0].metodo))}.`, `The most used method is ${translate(lang, metodoKey(dist[0].metodo))}.`),
      bullets: dist.map((m) => `${translate(lang, metodoKey(m.metodo))}: ${formatNumber(m.pct, lang, 0)}% · ${formatNumber(m.n, lang)} ${L('transacciones', 'transactions')}`),
      link: { to: '/transacciones', label: L('Ver transacciones', 'View transactions') },
    }
  }

  // Tasa de cambio
  if (has(q, ['tasa', 'cambio', 'dolar', 'bolivar', 'bcv', 'usdt', 'rate', 'exchange', 'dollar'])) {
    const ves = d.tasas.find((t) => t.par === 'VES_USD')!.valor
    return {
      text: L(`La tasa actual es 1 USD = Bs. ${formatNumber(ves, lang, 2)} (fuente ${d.fxFuente}).`, `The current rate is 1 USD = Bs. ${formatNumber(ves, lang, 2)} (source ${d.fxFuente}).`),
      bullets: [L(`Se actualiza cada ${d.fxFrecuenciaMin} minutos y cada venta guarda la tasa aplicada.`, `It refreshes every ${d.fxFrecuenciaMin} minutes and every sale stores the rate applied.`)],
      link: { to: '/monedas', label: L('Ver monedas', 'View currencies') },
    }
  }

  // Categorías / demanda
  if (has(q, ['categoria', 'demanda', 'mas vend', 'top', 'category', 'demand', 'best sell', 'popular'])) {
    const cats = salesByCategory(approvedInPeriod(d, now)).sort((a, b) => b.ventas - a.ventas)
    return {
      text: L(`La categoría con más demanda es ${translate(lang, catKey(cats[0].categoria))}.`, `The category with the most demand is ${translate(lang, catKey(cats[0].categoria))}.`),
      bullets: cats.slice(0, 4).map((c) => `${translate(lang, catKey(c.categoria))}: ${formatNumber(c.ventas, lang)} ${L('ventas', 'sales')}`),
    }
  }

  // Ventas / ingresos / conversión
  if (has(q, ['venta', 'vend', 'ingreso', 'factur', 'conversion', 'sales', 'sold', 'revenue', 'income'])) {
    return {
      text: L(`Este mes se vendieron ${formatNumber(s.vendidosMes, lang)} productos por ${formatMoney(s.ingresosUsdCents, 'USD', lang)}.`, `${formatNumber(s.vendidosMes, lang)} products were sold this month for ${formatMoney(s.ingresosUsdCents, 'USD', lang)}.`),
      bullets: [
        L(`Tasa de conversión: ${formatNumber(s.conversion * 100, lang, 0)}%`, `Conversion rate: ${formatNumber(s.conversion * 100, lang, 0)}%`),
        L(`${s.vencidosMes} productos vencieron sin venderse`, `${s.vencidosMes} products expired unsold`),
      ],
      link: { to: '/dashboard', label: L('Ver dashboard', 'View dashboard') },
    }
  }

  // Comercios activos
  if (has(q, ['comercio', 'tienda', 'negocio', 'activos', 'ciudad', 'shop', 'store', 'merchant', 'business', 'active', 'city'])) {
    const cities = cityActivity(d, now).sort((a, b) => b.comercios - a.comercios)
    return {
      text: L(`Hoy hay ${s.comerciosActivos} comercios activos en ${s.ciudades} ciudades. ${cities[0].ciudad} concentra más: ${cities[0].comercios}.`, `There are ${s.comerciosActivos} active shops today in ${s.ciudades} cities. ${cities[0].ciudad} leads with ${cities[0].comercios}.`),
      bullets: [
        ...cities.map((c) => `${c.ciudad}: ${c.comercios} ${L('comercios', 'shops')} · ${formatNumber(c.ventas, lang)} ${L('ventas', 'sales')}`),
        L(`${s.idle.length} sin actividad hace 7+ días`, `${s.idle.length} inactive for 7+ days`),
      ],
      link: { to: '/comercios', label: L('Ver comercios', 'View shops') },
    }
  }

  // Productos activos
  if (has(q, ['producto', 'ofertas', 'publicad', 'product', 'deals', 'listing'])) {
    return {
      text: L(`Hay ${s.productosActivos} productos activos ahora mismo en la plataforma.`, `There are ${s.productosActivos} live products on the platform right now.`),
      bullets: [L(`${s.urgentes.length} vencen en menos de 6 h`, `${s.urgentes.length} expire in under 6 h`)],
      link: { to: '/productos', label: L('Ver productos', 'View products') },
    }
  }

  if (has(q, ['hola', 'buenas', 'hello', 'hi ', 'hey'] ) || q === 'hi') {
    return { text: L('¡Hola! Preguntame por comercios, productos por vencer, ventas, pagos o tasas de cambio.', 'Hi! Ask me about shops, expiring products, sales, payments or exchange rates.') }
  }

  return { text: L('No tengo esa información en esta demo.', 'I don’t have that information in this demo.') }
}

export const SUGGESTIONS: [string, string][] = [
  ['¿Cuántos comercios están activos hoy?', 'How many shops are active today?'],
  ['¿Qué productos vencen en las próximas 6 horas?', 'Which products expire in the next 6 hours?'],
  ['¿Cuánta comida se salvó este mes?', 'How much food was saved this month?'],
  ['¿Qué método de pago se usa más?', 'Which payment method is used the most?'],
]

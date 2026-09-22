import type {
  Categoria, Cliente, Comercio, EstadoTransaccion, MetodoPago, Moneda, Producto, TasaCambio, TasaHistorica, Transaccion, WebhookEvent,
} from '@/domain/types'
import { DAY, HOUR, MIN } from '@/domain/dates'
import { applyDiscount } from '@/domain/money'
import { mulberry32, pick, int, range, shuffle, weighted, type Rng } from './rng'
import { HEROES, NOMBRES_COMERCIO, NOMBRES_PERSONAS, PREFIJOS, ZONAS } from './comercios'
import { CATALOGO } from './productos'

export const HERO_CLIENT_ID = 'u-maria-jose'
export const HERO_COMERCIO_ID = 'c-la-espiga'

/** Objetivos del período (últimos 30 días) — los números se DERIVAN de las transacciones generadas */
export const TARGETS = {
  comercios: 86,
  activos: 312,
  vendidosMes: 1847,
  vencidosMes: 63,
  urgentes: 14,
  kgSalvadosGr: 3_860_000,
  ahorroUsdCents: 1_842_000,
  conversion: 0.34,
  heroClientCompras: 12,
  heroClientAhorroCents: 8_600,
  metodos: { pago_movil: 960, binance: 573, zelle: 314 } as Record<MetodoPago, number>,
}

export const METODO_MONEDA: Record<MetodoPago, Moneda> = { pago_movil: 'VES', binance: 'USDT', zelle: 'USD' }
/** comisión del procesador por método, en puntos básicos */
export const METODO_FEE_BPS: Record<MetodoPago, number> = { pago_movil: 30, binance: 50, zelle: 0 }

export const FOOD: Categoria[] = ['alimentos', 'panaderia', 'lacteos', 'bebidas']
export const isFood = (c: Categoria) => FOOD.includes(c)

export interface MesHistorico {
  mes: string
  ahorroUsdCents: number
  vendidos: number
  kgGr: number
  ingresosUsdCents: number
}

export interface SeedState {
  now: number
  comercios: Comercio[]
  productos: Producto[]
  transacciones: Transaccion[]
  clientes: Cliente[]
  tasas: TasaCambio[]
  tasasHist: TasaHistorica[]
  historial: MesHistorico[]
  visitasDetalleMes: number
  fxFuente: 'BCV' | 'CoinGecko'
  fxFrecuenciaMin: number
  busquedas: string[]
}

const VES_NOW = 187.52
/** Tasa Bs/USD en un instante — tendencia suave de 30 días */
export function vesRateAt(t: number, now: number) {
  const days = (now - t) / DAY
  const base = VES_NOW - days * 0.52
  const wiggle = Math.sin(t / (DAY * 1.7)) * 0.35
  return Math.round((base + wiggle) * 100) / 100
}

function distribute(r: Rng, total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / sum) * total)
  const out = raw.map(Math.floor)
  let rest = total - out.reduce((a, b) => a + b, 0)
  const order = raw.map((v, i) => [v - Math.floor(v) + r() * 1e-6, i] as const).sort((a, b) => b[0] - a[0])
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) out[order[k][1]]++
  return out
}

/** Escala un arreglo de enteros para que sume exactamente `target` */
function normalizeTo(values: number[], target: number) {
  const sum = values.reduce((a, b) => a + b, 0)
  if (sum === 0 || values.length === 0) return values
  const f = target / sum
  const out = values.map((v) => Math.max(1, Math.round(v * f)))
  let diff = target - out.reduce((a, b) => a + b, 0)
  let i = 0
  while (diff !== 0 && i < out.length * 4) {
    const k = i % out.length
    const step = diff > 0 ? 1 : -1
    if (out[k] + step >= 1) {
      out[k] += step
      diff -= step
    }
    i++
  }
  return out
}

interface ComercioPlan {
  c: Comercio
  mix: Categoria[]
  activos: number
  vendidos: number
  vencidos: number
  urgentes: number
  moneda: Moneda
}

export function buildSeed(nowInput: number = Date.now()): SeedState {
  const now = Math.floor(nowInput / MIN) * MIN
  const r = mulberry32(20260922)

  // ── Comercios ─────────────────────────────────────────────
  const plans: ComercioPlan[] = HEROES.map((h) => ({
    c: {
      id: h.id, nombre: h.nombre, categoria: h.categoria, ciudad: h.ciudad, zona: h.zona, direccion: h.direccion,
      horario: h.horario, activo: true, lat: h.lat, lng: h.lng, hero: true,
      ultimaActividad: new Date(now - h.ultimaActividadDias * DAY - int(r, 5, 90) * MIN).toISOString(),
      vistas: int(r, 800, 4200),
    },
    mix: h.mix, activos: h.activos, vendidos: h.vendidosMes, vencidos: h.vencidosMes, urgentes: h.urgentes,
    moneda: h.categoria === 'moda' || h.categoria === 'cosmeticos' ? 'USD' : 'VES',
  }))

  const genCount = TARGETS.comercios - HEROES.length
  const catPlan = shuffle(r, [
    ...Array(26).fill('alimentos'), ...Array(19).fill('panaderia'), ...Array(8).fill('bebidas'),
    ...Array(6).fill('lacteos'), ...Array(10).fill('moda'), ...Array(9).fill('cosmeticos'),
  ] as Categoria[]).slice(0, genCount)
  const cityPlan = shuffle(r, [
    ...Array(30).fill('Caracas'), ...Array(18).fill('Valencia'), ...Array(16).fill('Maracaibo'), ...Array(14).fill('Barquisimeto'),
  ] as string[]).slice(0, genCount)
  const nombres = shuffle(r, NOMBRES_COMERCIO)
  const secondary: Record<Categoria, Categoria[]> = {
    panaderia: ['panaderia', 'lacteos'], alimentos: ['alimentos', 'bebidas'], lacteos: ['alimentos'],
    bebidas: ['bebidas', 'panaderia'], moda: ['moda'], cosmeticos: ['cosmeticos'],
  }
  const gen: ComercioPlan[] = []
  for (let i = 0; i < genCount; i++) {
    const cat = catPlan[i]
    const ciudad = cityPlan[i]
    const z = pick(r, ZONAS.filter((x) => x.ciudad === ciudad))
    const nombre = `${pick(r, PREFIJOS[cat])} ${nombres[i % nombres.length]}`
    const idle = i < 5
    gen.push({
      c: {
        id: `c-${String(i + 1).padStart(3, '0')}`, nombre, categoria: cat, ciudad, zona: z.zona,
        direccion: `${pick(r, ['Av.', 'Calle', 'Transversal', 'Av. Principal de'])} ${z.zona}, ${pick(r, ['Local', 'Qta.', 'Edif.', 'C.C.'])} ${int(r, 1, 60)}, ${ciudad}`,
        horario: pick(r, [
          ['Lun a Sáb 7:00–19:00', 'Mon–Sat 7am–7pm'], ['Lun a Dom 8:00–20:00', 'Mon–Sun 8am–8pm'],
          ['Lun a Vie 8:00–18:00 · Sáb 8:00–13:00', 'Mon–Fri 8am–6pm · Sat 8am–1pm'], ['Todos los días 6:30–21:00', 'Every day 6:30am–9pm'],
        ] as [string, string][]),
        activo: true,
        lat: z.lat + range(r, -0.006, 0.006), lng: z.lng + range(r, -0.006, 0.006), hero: false,
        ultimaActividad: new Date(now - (idle ? int(r, 8, 16) * DAY : int(r, 0, 4) * DAY + int(r, 10, 600) * MIN)).toISOString(),
        vistas: int(r, 120, 1800),
      },
      mix: [cat, cat, ...secondary[cat]], activos: 0, vendidos: 0, vencidos: 0, urgentes: 0,
      moneda: cat === 'moda' || cat === 'cosmeticos' ? 'USD' : r() < 0.8 ? 'VES' : 'USD',
    })
  }
  const heroSum = (k: 'activos' | 'vendidos' | 'vencidos' | 'urgentes') => plans.reduce((s, p) => s + p[k], 0)
  const wAct = gen.map((g, i) => (i < 5 ? 0.6 : 1) * range(r, 0.5, 1.5) * (g.c.ciudad === 'Caracas' ? 1.7 : 1))
  const wVen = gen.map((g, i) => (i < 5 ? 0.3 : 1) * range(r, 0.4, 1.6) * (g.c.ciudad === 'Caracas' ? 1.8 : 1))
  const acts = distribute(r, TARGETS.activos - heroSum('activos'), wAct)
  const vends = distribute(r, TARGETS.vendidosMes - heroSum('vendidos'), wVen)
  const vencs = distribute(r, TARGETS.vencidosMes - heroSum('vencidos'), gen.map(() => range(r, 0.2, 1.8)))
  gen.forEach((g, i) => {
    g.activos = Math.max(0, acts[i])
    g.vendidos = vends[i]
    g.vencidos = vencs[i]
  })
  // urgentes restantes en comercios generados con activos
  let urgLeft = TARGETS.urgentes - heroSum('urgentes')
  for (const g of shuffle(r, gen.filter((g, i) => g.activos > 1 && i >= 5 && isFood(g.c.categoria)))) {
    if (urgLeft <= 0) break
    g.urgentes = 1
    urgLeft--
  }
  plans.push(...gen)

  // ── Productos ─────────────────────────────────────────────
  const productos: Producto[] = []
  let pid = 0
  const mkProducto = (p: ComercioPlan, estado: Producto['estado'], vencimiento: number, publicado: number, categoria?: Categoria): Producto => {
    const cat = categoria ?? pick(r, p.mix)
    const tpl = pick(r, CATALOGO[cat])
    const usd = Math.round(range(r, tpl.usd[0], tpl.usd[1]) * 100)
    const pct = int(r, tpl.desc[0], tpl.desc[1])
    const rate = vesRateAt(publicado, now)
    const orig = p.moneda === 'VES' ? Math.round((usd * rate) / 100) * 100 : usd
    pid++
    const prefix = p.c.nombre.replace(/^(Panadería|Abasto|Charcutería|Boutique|Farmacia|Fuente de Soda|Mercado|Perfumería)\s+/, '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '').slice(0, 3).toUpperCase()
    return {
      id: `p-${pid}`, comercioId: p.c.id, codigo: `${prefix}-${String(1000 + pid).slice(-4)}`,
      nombre: tpl.nombre, categoria: cat, descripcion: tpl.descripcion,
      precioOriginalCents: orig, descuentoPct: pct, precioFinalCents: applyDiscount(orig, pct), moneda: p.moneda,
      pesoGr: tpl.gr, vencimiento: new Date(vencimiento).toISOString(), estado,
      fotos: [tpl.emoji], lat: p.c.lat, lng: p.c.lng, publicadoEl: new Date(publicado).toISOString(),
      vistas: int(r, 12, 260),
    }
  }

  const food = (c: Categoria) => isFood(c)
  const activosPorComercio: Record<string, Producto[]> = {}
  for (const p of plans) {
    const list: Producto[] = []
    for (let k = 0; k < p.activos; k++) {
      let cat = pick(r, p.mix)
      let venc: number
      if (k < p.urgentes) {
        if (!food(cat)) cat = p.mix.find(food) ?? 'alimentos'
        venc = p.c.id === HERO_COMERCIO_ID ? now + 38 * MIN : now + int(r, 25, 330) * MIN
      } else if (p.c.id === HERO_COMERCIO_ID && k < 3) {
        venc = now + (k === 1 ? 7 * HOUR + 20 * MIN : 11 * HOUR + 45 * MIN)
      } else if (p.c.id === HERO_COMERCIO_ID) {
        venc = now + int(r, 26 * 60, 96 * 60) * MIN
      } else if (food(cat)) {
        venc = now + int(r, 6 * 60 + 30, 5 * 24 * 60) * MIN
      } else {
        venc = now + int(r, 7, 60) * DAY
      }
      const pub = Math.min(now - int(r, 20, 60 * 40) * MIN, venc - 2 * HOUR)
      list.push(mkProducto(p, 'activo', venc, pub, cat))
    }
    activosPorComercio[p.c.id] = list
    productos.push(...list)
    for (let k = 0; k < p.vencidos; k++) {
      const venc = now - int(r, 2 * 60, 29 * 24 * 60) * MIN
      productos.push(mkProducto(p, 'vencido', venc, venc - int(r, 10, 72) * HOUR))
    }
  }

  // ── Clientes ──────────────────────────────────────────────
  const clientes: Cliente[] = NOMBRES_PERSONAS.map((nombre, i) => {
    const z = i === 0 ? ZONAS[0] : pick(r, ZONAS)
    return {
      id: i === 0 ? HERO_CLIENT_ID : `u-${String(i).padStart(3, '0')}`, nombre,
      ciudad: z.ciudad, zona: z.zona, lat: z.lat, lng: z.lng, favoritos: [],
    }
  })
  const clientesPorCiudad: Record<string, Cliente[]> = {}
  for (const c of clientes.slice(1)) (clientesPorCiudad[c.ciudad] ??= []).push(c)

  // ── Ventas del período (vendidos + transacciones aprobadas) ─────────
  const metodos = shuffle(r, [
    ...Array(TARGETS.metodos.pago_movil).fill('pago_movil'),
    ...Array(TARGETS.metodos.binance).fill('binance'),
    ...Array(TARGETS.metodos.zelle).fill('zelle'),
  ] as MetodoPago[])
  interface Sale { prod: Producto; plan: ComercioPlan; fecha: number; metodo: MetodoPago; cliente: Cliente; finalUsd: number; origUsd: number }
  const sales: Sale[] = []
  let mi = 0
  const mjHeroCaracas = plans.filter((p) => p.c.ciudad === 'Caracas' && food(p.c.categoria))
  for (const p of plans) {
    for (let k = 0; k < p.vendidos; k++) {
      // ventas un poco más concentradas en días recientes (tendencia creciente)
      const ageMin = Math.floor(Math.pow(r(), 1.25) * 30 * 24 * 60)
      const fecha = now - Math.max(15, ageMin) * MIN
      const venc = fecha + int(r, 2, 60) * HOUR
      const pub = fecha - int(r, 1, 36) * HOUR
      const prod = mkProducto(p, 'vendido', venc, pub)
      const cat = prod.categoria
      const tpl = CATALOGO[cat].find((t) => t.nombre[0] === prod.nombre[0])!
      const origUsd = Math.round(range(r, tpl.usd[0], tpl.usd[1]) * 100)
      const finalUsd = applyDiscount(origUsd, prod.descuentoPct)
      const pool = clientesPorCiudad[p.c.ciudad] ?? clientes.slice(1)
      sales.push({ prod, plan: p, fecha, metodo: metodos[mi++], cliente: pick(r, pool), finalUsd, origUsd })
    }
  }

  // María José: 12 compras en comercios de Caracas (4 en La Espiga)
  const mjSales: Sale[] = []
  const espigaSales = sales.filter((s) => s.plan.c.id === HERO_COMERCIO_ID)
  for (let k = 0; k < 4; k++) mjSales.push(espigaSales[k * 7 + 3])
  const otherCaracas = shuffle(r, sales.filter((s) => s.plan.c.ciudad === 'Caracas' && s.plan.c.id !== HERO_COMERCIO_ID && mjHeroCaracas.includes(s.plan) === false))
  const mjPlus = shuffle(r, sales.filter((s) => s.plan.c.ciudad === 'Caracas' && s.plan.c.id !== HERO_COMERCIO_ID))
  const chosen = new Set(mjSales)
  for (const s of [...otherCaracas, ...mjPlus]) {
    if (mjSales.length >= TARGETS.heroClientCompras) break
    if (!chosen.has(s)) { mjSales.push(s); chosen.add(s) }
  }
  for (const s of mjSales) s.cliente = clientes[0]

  // 1) La Espiga: ingresos exactos del mes
  const espFinals = normalizeTo(espigaSales.map((s) => s.finalUsd), HEROES[0].ingresosUsdCents!)
  espigaSales.forEach((s, i) => {
    s.finalUsd = espFinals[i]
    s.origUsd = Math.round((s.finalUsd * 100) / (100 - s.prod.descuentoPct))
  })
  const saving = (s: Sale) => s.origUsd - s.finalUsd
  // 2) María José: ahorro exacto
  const mjEsp = mjSales.filter((s) => s.plan.c.id === HERO_COMERCIO_ID)
  const mjRest = mjSales.filter((s) => s.plan.c.id !== HERO_COMERCIO_ID)
  const mjTarget = TARGETS.heroClientAhorroCents - mjEsp.reduce((a, s) => a + saving(s), 0)
  scaleSavings(mjRest, mjTarget)
  // 3) Resto: ahorro total exacto
  const fixed = new Set<Sale>([...espigaSales, ...mjRest])
  const rest = sales.filter((s) => !fixed.has(s))
  const restTarget = TARGETS.ahorroUsdCents - [...fixed].reduce((a, s) => a + saving(s), 0)
  scaleSavings(rest, restTarget)

  // 4) Kilos salvados exactos (solo categorías de alimentos)
  const foodSales = sales.filter((s) => food(s.prod.categoria))
  const grs = normalizeTo(foodSales.map((s) => s.prod.pesoGr * range(r, 1.8, 3.2)), TARGETS.kgSalvadosGr)
  foodSales.forEach((s, i) => (s.prod.pesoGr = grs[i]))

  // Construir productos vendidos + transacciones
  const transacciones: Transaccion[] = []
  let tid = 0
  const mkTx = (
    prod: Producto, plan: ComercioPlan, cliente: Cliente, metodo: MetodoPago, fecha: number, estado: EstadoTransaccion,
    finalUsd: number, origUsd: number, retry = false,
  ): Transaccion => {
    const moneda = METODO_MONEDA[metodo]
    const ves = vesRateAt(fecha, now)
    const usdt = 1.0008
    const tasa = moneda === 'VES' ? ves : moneda === 'USDT' ? usdt : 1
    const monto = moneda === 'USD' ? finalUsd : Math.round(finalUsd * tasa)
    tid++
    return {
      id: `TX-${String(48210 + tid)}`, productoId: prod.id, comercioId: plan.c.id, clienteId: cliente.id, clienteNombre: cliente.nombre,
      metodo, moneda, montoCents: monto, montoUsdCents: finalUsd, ahorroUsdCents: origUsd - finalUsd,
      pesoGr: food(prod.categoria) ? prod.pesoGr : 0, categoria: prod.categoria, estado, fecha: new Date(fecha).toISOString(),
      tasaCambioAplicada: tasa, comisionUsdCents: Math.round((finalUsd * METODO_FEE_BPS[metodo]) / 10000),
      webhook: webhookLog(r, metodo, fecha, estado, retry),
    }
  }

  sales.sort((a, b) => a.fecha - b.fecha)
  for (const s of sales) {
    // reflejar el precio en la moneda del comercio
    const rate = vesRateAt(s.fecha, now)
    const inMon = (usd: number) => (s.plan.moneda === 'VES' ? Math.round(usd * rate) : usd)
    s.prod.precioOriginalCents = inMon(s.origUsd)
    s.prod.precioFinalCents = inMon(s.finalUsd)
    productos.push(s.prod)
    transacciones.push(mkTx(s.prod, s.plan, s.cliente, s.metodo, s.fecha, 'aprobado', s.finalUsd, s.origUsd, r() < 0.08))
  }

  // Pendientes (7) y rechazadas (3) sobre productos activos
  const activosFlat = productos.filter((p) => p.estado === 'activo' && new Date(p.vencimiento).getTime() - now > 6 * HOUR)
  const planById = Object.fromEntries(plans.map((p) => [p.c.id, p]))
  const pickActive = shuffle(r, activosFlat).slice(0, 10)
  pickActive.forEach((prod, i) => {
    const plan = planById[prod.comercioId]
    const estado: EstadoTransaccion = i < 7 ? 'pendiente' : 'rechazado'
    const fecha = now - (estado === 'pendiente' ? int(r, 3, 90) : int(r, 60, 20 * 60)) * MIN
    const metodo = weighted(r, [['pago_movil', 52], ['binance', 31], ['zelle', 17]] as const)
    const pool = clientesPorCiudad[plan.c.ciudad] ?? clientes.slice(1)
    const rate = vesRateAt(fecha, now)
    const finalUsd = plan.moneda === 'VES' ? Math.round(prod.precioFinalCents / rate) : prod.precioFinalCents
    const origUsd = plan.moneda === 'VES' ? Math.round(prod.precioOriginalCents / rate) : prod.precioOriginalCents
    transacciones.push(mkTx(prod, plan, pick(r, pool), metodo, fecha, estado, finalUsd, origUsd))
  })
  transacciones.sort((a, b) => b.fecha.localeCompare(a.fecha))

  // Favoritos de María José: 4 productos activos cerca (uno vence en <48h)
  const espigaAct = activosPorComercio[HERO_COMERCIO_ID]
  const vitalisAct = activosPorComercio['c-vitalis']
  const aromaAct = activosPorComercio['c-aroma']
  const nearFood = productos.filter((p) => p.estado === 'activo' && p.comercioId !== HERO_COMERCIO_ID && planById[p.comercioId].c.ciudad === 'Caracas' && food(p.categoria) && new Date(p.vencimiento).getTime() - now < 40 * HOUR && new Date(p.vencimiento).getTime() - now > 8 * HOUR)
  clientes[0].favoritos = [espigaAct[1].id, espigaAct[5].id, vitalisAct[0].id, (nearFood[0] ?? aromaAct[0]).id]

  // Historial mensual previo (agregado) + mes en curso derivado de transacciones
  const historial: MesHistorico[] = [
    [640_000, 690, 1_420_000, 610_000], [880_000, 902, 1_880_000, 812_000], [1_120_000, 1_133, 2_390_000, 1_004_000],
    [1_350_000, 1_381, 2_870_000, 1_236_000], [1_610_000, 1_602, 3_340_000, 1_448_000],
  ].map(([a, v, k, i], idx) => ({
    mes: new Date(now - (5 - idx) * 30 * DAY).toISOString(), ahorroUsdCents: a, vendidos: v, kgGr: k, ingresosUsdCents: i,
  }))

  // Tasas
  const tasas: TasaCambio[] = [
    { par: 'VES_USD', valor: VES_NOW, actualizadaEl: new Date(now - 42 * MIN).toISOString(), fuente: 'BCV' },
    { par: 'USD_USDT', valor: 1.0008, actualizadaEl: new Date(now - 42 * MIN).toISOString(), fuente: 'CoinGecko' },
  ]
  const tasasHist: TasaHistorica[] = []
  for (let d = 6; d >= 0; d--) {
    const t = now - d * DAY
    tasasHist.push({ fecha: new Date(t).toISOString(), VES_USD: vesRateAt(t, now), USD_USDT: Math.round((1 + Math.sin(d * 1.3) * 0.0015) * 10000) / 10000 })
  }
  tasasHist[tasasHist.length - 1].VES_USD = VES_NOW

  return {
    now,
    comercios: plans.map((p) => p.c),
    productos,
    transacciones,
    clientes,
    tasas,
    tasasHist,
    historial,
    visitasDetalleMes: Math.round(TARGETS.vendidosMes / TARGETS.conversion),
    fxFuente: 'BCV',
    fxFrecuenciaMin: 60,
    busquedas: ['pan', 'queso blanco', 'protector solar'],
  }

  function scaleSavings(list: Sale[], target: number) {
    if (!list.length) return
    const sv = normalizeTo(list.map(saving), Math.max(list.length, target))
    list.forEach((s, i) => {
      // escala precio original y final manteniendo el % de descuento
      const pct = s.prod.descuentoPct
      s.origUsd = Math.max(sv[i] + 1, Math.round((sv[i] * 100) / pct))
      s.finalUsd = s.origUsd - sv[i]
    })
  }
}

function webhookLog(r: Rng, metodo: MetodoPago, fecha: number, estado: EstadoTransaccion, retry: boolean): WebhookEvent[] {
  const src = metodo === 'binance' ? 'Binance Pay' : metodo === 'zelle' ? 'Zelle' : 'Pago Móvil'
  const ev: WebhookEvent[] = [
    { paso: 'recibido', fecha: new Date(fecha).toISOString(), detalle: [`Evento de ${src} recibido (firma HMAC válida)`, `${src} event received (valid HMAC signature)`] },
  ]
  let t = fecha + int(r, 2, 9) * 1000
  if (retry || estado === 'rechazado') {
    ev.push({ paso: 'reintento', fecha: new Date(t).toISOString(), detalle: ['Timeout del proveedor · reintento 1/3 con backoff 30s', 'Provider timeout · retry 1/3 with 30s backoff'] })
    t += 30_000 + int(r, 1, 4) * 1000
  }
  if (estado === 'pendiente') {
    ev.push({ paso: 'validado', fecha: new Date(t).toISOString(), detalle: ['Referencia validada · esperando confirmación bancaria', 'Reference validated · awaiting bank confirmation'] })
    return ev
  }
  if (estado === 'rechazado') {
    ev.push({ paso: 'fallido', fecha: new Date(t).toISOString(), detalle: ['Monto no coincide con la referencia · pago rechazado', 'Amount does not match reference · payment rejected'] })
    return ev
  }
  ev.push({ paso: 'validado', fecha: new Date(t).toISOString(), detalle: ['Monto y referencia validados', 'Amount and reference validated'] })
  ev.push({ paso: 'confirmado', fecha: new Date(t + int(r, 1, 6) * 1000).toISOString(), detalle: ['Pago confirmado · producto marcado como vendido', 'Payment confirmed · product marked as sold'] })
  return ev
}

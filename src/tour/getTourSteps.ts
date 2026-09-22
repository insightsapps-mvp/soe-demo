import type { Lang, Role } from '@/domain/types'
import { flatNav } from '@/config/nav'
import { translate } from '@/i18n/useT'

export interface TourStep {
  id: string
  /** selector data-tour; si falta, paso centrado (solo el welcome del rol) */
  target?: string
  title: string
  body: string
}

type Pair = [string, string]

const NAV_COPY: Record<string, Pair> = {
  propuesta: [
    'Acá está todo lo que incluye el desarrollo de Soe: el circuito completo, los 5 módulos y el acceso directo a cada uno funcionando.',
    'Here is everything included in building Soe: the full loop, the 5 modules and direct access to each one working.',
  ],
  dashboard: ['Los KPIs de toda la plataforma: comercios activos, ventas, conversión y los kilos de comida salvados.', 'Platform-wide KPIs: active shops, sales, conversion and kilos of food saved.'],
  comercios: ['Gestioná los 86 comercios: buscá, filtrá por ciudad y detectá los que tienen productos urgentes.', 'Manage all 86 shops: search, filter by city and spot the ones with urgent products.'],
  'productos-admin': ['Todos los productos de la plataforma en un solo lugar. Podés dar de baja por incumplimiento.', 'Every product on the platform in one place. You can remove listings for violations.'],
  transacciones: ['Pagos por Binance, Zelle y Pago Móvil con su log de webhook y reintentos.', 'Binance, Zelle and Pago Móvil payments with their webhook log and retries.'],
  monedas: ['Tasas VES/USD/USDT, historial y el tipo de cambio aplicado en cada venta.', 'VES/USD/USDT rates, history and the exchange rate applied on each sale.'],
  agente: ['Preguntale al agente lo que necesites: responde con los datos de la plataforma.', 'Ask the agent anything: it answers with the platform’s data.'],
  'mi-dashboard': ['El resumen de tu negocio: ventas, ingresos y lo que vence hoy.', 'Your business summary: sales, revenue and what expires today.'],
  'mis-productos': ['Publicá un producto por vencer y aparece en el mapa de los clientes en segundos. Editás precio y vencimiento en línea.', 'Publish an expiring product and it shows on customers’ map in seconds. Edit price and expiry inline.'],
  'mis-ventas': ['Cada venta con su método de pago, moneda y estado.', 'Every sale with its payment method, currency and status.'],
  explorar: ['El mapa con las ofertas cerca tuyo. Filtrá por categoría, radio y orden.', 'The map with deals near you. Filter by category, radius and sort.'],
  favoritos: ['Tus productos guardados. Te avisamos 48 h antes de que venzan.', 'Your saved products. We alert you 48 h before they expire.'],
  'mis-compras': ['Tu historial y cuánto ahorraste comprando antes de que se pierda.', 'Your history and how much you saved buying before it went to waste.'],
}

const WELCOME: Record<Role, [Pair, Pair]> = {
  admin: [
    ['Vista Administrador', 'Administrator view'],
    ['Así ven Alex y Soe la plataforma: todos los comercios, ventas, pagos y el impacto medido. Te muestro dónde está cada cosa.', 'This is how Alex and Soe see the platform: every shop, sale, payment and measured impact. Let me show you around.'],
  ],
  comercio: [
    ['Vista Comercio · La Espiga', 'Shop view · La Espiga'],
    ['Así usa Soe una panadería: publica lo que le sobra con descuento y lo vende antes de que se pierda.', 'This is how a bakery uses Soe: it lists leftovers at a discount and sells them before they go to waste.'],
  ],
  cliente: [
    ['Vista Cliente · María José', 'Customer view · María José'],
    ['Así usa Soe una vecina de Chacao: encuentra ofertas cerca, paga como prefiere y ahorra.', 'This is how a Chacao neighbor uses Soe: she finds nearby deals, pays her way and saves.'],
  ],
}

export function getTourSteps(role: Role, lang: Lang): TourStep[] {
  const i = lang === 'es' ? 0 : 1
  const steps: TourStep[] = [
    { id: 'welcome', title: WELCOME[role][0][i], body: WELCOME[role][1][i] },
    {
      id: 'sidebar',
      target: 'sidebar-nav',
      title: lang === 'es' ? 'Tu menú' : 'Your menu',
      body: lang === 'es' ? 'Todo el producto está acá, ordenado por secciones. Arranca siempre por la Propuesta.' : 'The whole product lives here, grouped by section. It always starts with the Proposal.',
    },
  ]
  flatNav(role).forEach((it, idx) => {
    const copy = NAV_COPY[it.id]
    if (!copy) return
    steps.push({ id: `nav-${it.id}`, target: `nav-${it.id}`, title: `${idx + 1}. ${translate(lang, it.label)}`, body: copy[i] })
  })
  steps.push({
    id: 'switcher',
    target: 'role-switcher',
    title: lang === 'es' ? 'Cambiá de vista' : 'Switch views',
    body: lang === 'es' ? 'Pasá de Administrador a Comercio o Cliente en vivo, sin cerrar sesión. Cada rol ve su propia app.' : 'Jump from Administrator to Shop or Customer live, without logging out. Each role sees its own app.',
  })
  steps.push({
    id: 'cta',
    target: 'whatsapp-cta',
    title: lang === 'es' ? '¿Arrancamos?' : 'Shall we start?',
    body: lang === 'es' ? 'Cuando quieran avanzar, escribannos por WhatsApp desde acá.' : 'Whenever you want to move forward, message us on WhatsApp from here.',
  })
  return steps
}

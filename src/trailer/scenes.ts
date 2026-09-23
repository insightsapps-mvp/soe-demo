import type { DemoData } from '@/domain/selectors'
import { nearbyFeed } from '@/domain/selectors'
import { CLIENT_LOCATION } from '@/domain/geo'

export type Action =
  | { kind: 'focus'; target: string }
  | { kind: 'click'; target: string; wait?: number }
  | { kind: 'type'; target: string; text: [string, string] }
  | { kind: 'escape' }
  | { kind: 'scroll'; target: string }

export interface Scene {
  path: string | ((d: DemoData) => string)
  title: [string, string]
  caption: [string, string]
  duration: number
  actions: Action[]
  cta?: boolean
}

export const SCENES: Scene[] = [
  {
    path: '/propuesta',
    title: ['Soe', 'Soe'],
    caption: ['Todo lo que incluye el desarrollo, en un solo lugar.', 'Everything the build includes, in one place.'],
    duration: 7000,
    actions: [{ kind: 'scroll', target: 'circuito' }, { kind: 'focus', target: 'circuito' }],
  },
  {
    path: '/explorar',
    title: ['App cliente', 'Customer app'],
    caption: ['Los clientes encuentran ofertas cerca suyo, antes de que se acaben.', 'Customers find deals near them, before they run out.'],
    duration: 8000,
    actions: [{ kind: 'focus', target: 'mapa' }, { kind: 'focus', target: 'primer-producto' }],
  },
  {
    path: (d) => {
      const f = nearbyFeed(d, Date.now(), CLIENT_LOCATION, 3).sort((a, b) => a.km - b.km)
      return `/explorar/${f[0]?.p.id ?? ''}`
    },
    title: ['Checkout', 'Checkout'],
    caption: ['Pagan en Bolívares, dólares o cripto.', 'They pay in bolívares, dollars or crypto.'],
    duration: 7000,
    actions: [{ kind: 'click', target: 'comprar-producto', wait: 1600 }, { kind: 'focus', target: 'confirmar-pago' }],
  },
  {
    path: '/mi-negocio/productos',
    title: ['Portal comercio', 'Shop portal'],
    caption: ['El comercio publica un producto y ya está visible en el mapa.', 'The shop publishes a product and it’s live on the map.'],
    duration: 8000,
    actions: [
      { kind: 'escape' },
      { kind: 'click', target: 'publicar-producto', wait: 1000 },
      { kind: 'click', target: 'autofill', wait: 900 },
      { kind: 'click', target: 'guardar-producto', wait: 900 },
      { kind: 'focus', target: 'producto-en-mapa' },
    ],
  },
  {
    path: '/dashboard',
    title: ['Panel admin', 'Admin panel'],
    caption: ['86 comercios, 3.860 kilos de comida salvados este mes.', '86 shops, 3,860 kilos of food saved this month.'],
    duration: 7000,
    actions: [{ kind: 'focus', target: 'kpis' }],
  },
  {
    path: '/transacciones',
    title: ['Pagos', 'Payments'],
    caption: ['Binance, Zelle y Pago Móvil, todo en un solo checkout.', 'Binance, Zelle and Pago Móvil, all in one checkout.'],
    duration: 6000,
    actions: [],
  },
  {
    path: '/monedas',
    title: ['Multi-moneda', 'Multi-currency'],
    caption: ['Los precios se ajustan solos con el tipo de cambio.', 'Prices adjust automatically with the exchange rate.'],
    duration: 6000,
    actions: [],
  },
  {
    path: '/agente',
    title: ['Paula · Agente de IA', 'Paula · AI Agent'],
    caption: ['Y le preguntás a Paula lo que necesites.', 'And you ask Paula whatever you need.'],
    duration: 7000,
    actions: [
      { kind: 'type', target: 'agente-input', text: ['¿Cuántos comercios están activos hoy?', 'How many shops are active today?'] },
      { kind: 'click', target: 'agente-send', wait: 400 },
    ],
  },
  {
    path: '',
    title: ['Insights', 'Insights'],
    caption: ['Lo que sobra hoy, no se pierde mañana.', 'What’s left today isn’t wasted tomorrow.'],
    duration: 8000,
    actions: [],
    cta: true,
  },
]

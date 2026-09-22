import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Coins, CreditCard, LayoutDashboard, MapPin, Printer, RotateCw, Store } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Button } from '@/components/ui/button'
import { Kicker, WhatsAppIcon } from '@/components/shared/all'
import { WHATSAPP_URL } from '@/config/brand'
import { cn } from '@/lib/utils'
import { InvestmentBlock } from './InvestmentBlock'

function WaButton({ className, size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  const { t } = useT()
  return (
    <Button asChild size={size} className={className}>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
        <WhatsAppIcon className="h-4 w-4" /> {t('cta.button')}
      </a>
    </Button>
  )
}

export default function ProposalPage() {
  const { L } = useT()
  const navigate = useNavigate()

  const steps = [
    L('El comercio carga un producto por vencer, con su descuento, desde su Portal.', 'The shop uploads a product close to expiry, with its discount, from its Portal.'),
    L('Soe lo geolocaliza y lo publica al instante en el mapa de los clientes cercanos.', 'Soe geolocates it and instantly publishes it on nearby customers’ map.'),
    L('El cliente lo encuentra por categoría y distancia, antes de que se acabe.', 'The customer finds it by category and distance, before it runs out.'),
    L('Paga con el método que prefiera — Binance, Zelle o Pago Móvil — en la moneda que elija.', 'They pay with their preferred method — Binance, Zelle or Pago Móvil — in the currency they choose.'),
    L('El comercio recibe la venta y el producto se marca como vendido: no se perdió.', 'The shop receives the sale and the product is marked as sold: nothing was wasted.'),
    L('El panel admin mide cuánto se vendió y cuánta comida se salvó.', 'The admin panel measures how much was sold and how much food was saved.'),
  ]

  const modules = [
    {
      icon: Store,
      title: L('Portal Comercio', 'Shop Portal'),
      desc: L('Cargá tus productos por vencer, con descuento, en segundos.', 'Upload your expiring products, with a discount, in seconds.'),
      items: [
        L('Formulario con validación de descuento máximo', 'Form with maximum-discount validation'),
        L('Editor en línea de precio y vencimiento', 'Inline price and expiry editor'),
        L('Búsqueda y filtros por estado', 'Search and status filters'),
        L('Exportación CSV', 'CSV export'),
      ],
      to: '/mi-negocio/productos',
    },
    {
      icon: MapPin,
      title: L('App Cliente (Geolocalización)', 'Customer App (Geolocation)'),
      desc: L('Los clientes encuentran ofertas cerca suyo, por categoría.', 'Customers find deals near them, by category.'),
      items: [
        L('Mapa interactivo con radio 1-10km', 'Interactive map with a 1–10 km radius'),
        L('Filtros por categoría y descuento', 'Category and discount filters'),
        L('Notificación a las 48h de vencer', 'Alert 48 h before expiry'),
        L('Favoritos e historial', 'Favorites and history'),
      ],
      to: '/explorar',
    },
    {
      icon: LayoutDashboard,
      title: L('Panel Admin (Métricas)', 'Admin Panel (Metrics)'),
      desc: L('Toda la plataforma medida en un solo lugar.', 'The whole platform measured in one place.'),
      items: [
        L('Comercios activos y productos por estado', 'Active shops and products by status'),
        L('Ventas por período y categoría top', 'Sales by period and top category'),
        L('Tasa de conversión', 'Conversion rate'),
        L('Exportación de reportes', 'Report export'),
      ],
      to: '/dashboard',
    },
    {
      icon: CreditCard,
      title: L('Pagos Binance / Zelle / Pago Móvil', 'Binance / Zelle / Pago Móvil Payments'),
      desc: L('Un checkout, tres formas de cobrar.', 'One checkout, three ways to get paid.'),
      items: [
        L('Selector de método con comisión visible', 'Method picker with visible fees'),
        L('Webhooks con reintentos', 'Webhooks with retries'),
        L('Log de auditoría por transacción', 'Audit log per transaction'),
      ],
      to: '/transacciones',
    },
    {
      icon: Coins,
      title: L('Multi-moneda (VES / USD / cripto)', 'Multi-currency (VES / USD / crypto)'),
      desc: L('Precios justos pase lo que pase con el tipo de cambio.', 'Fair prices no matter what the exchange rate does.'),
      items: [
        L('Cotización actualizada cada hora', 'Hourly rate updates'),
        L('Conversión en tiempo real', 'Real-time conversion'),
        L('Registro del tipo de cambio aplicado por venta', 'Exchange rate recorded per sale'),
      ],
      to: '/monedas',
    },
  ]

  return (
    <div className="mx-auto max-w-[1120px]">
      {/* 1. Encabezado */}
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
        <div className="glow-bg pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Kicker className="mb-3">{L('PROPUESTA COMERCIAL', 'COMMERCIAL PROPOSAL')}</Kicker>
            <h1 className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
              {L('Propuesta para', 'Proposal for')} <span className="text-acento">{L('Alex y Soe', 'Alex and Soe')}</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-text-2">
              {L('Todo lo que incluye el desarrollo de Soe, con acceso directo a cada módulo funcionando.', 'Everything included in building Soe, with direct access to each working module.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer /> {L('Imprimir', 'Print')}
            </Button>
            <WaButton />
          </div>
        </div>
      </header>

      {/* 2. El circuito */}
      <section data-trailer="circuito" className="mt-12">
        <Kicker className="mb-2">{L('CÓMO FUNCIONA', 'HOW IT WORKS')}</Kicker>
        <h2 className="text-[26px] font-extrabold tracking-tight">{L('El circuito', 'The loop')}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => {
            const hl = i === 1
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-5',
                  hl ? 'border-acento bg-acento text-white shadow-glow' : 'border-border bg-card shadow-card',
                )}
              >
                {hl && <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />}
                <div className={cn('num text-[11px] font-bold tracking-[0.16em]', hl ? 'text-white/85' : 'text-acento')}>
                  {L('PASO', 'STEP')} {i + 1}
                </div>
                <p className={cn('relative mt-2 text-[15px] font-semibold leading-snug', hl ? 'text-white' : 'text-text')}>{s}</p>
                {hl && (
                  <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-bold">
                    <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-white" /> {L('Geolocalización en vivo', 'Live geolocation')}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-text-2">
          <RotateCw className="h-4 w-4 text-muted" />
          {L('Y vuelve a empezar, con más comercios y más categorías la próxima vez.', 'And it starts again, with more shops and more categories next time.')}
        </p>
      </section>

      {/* 3. Qué incluye */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Kicker className="mb-2">{L('ALCANCE', 'SCOPE')}</Kicker>
            <h2 className="text-[26px] font-extrabold tracking-tight">{L('Qué incluye la plataforma', 'What the platform includes')}</h2>
          </div>
          <span className="num shrink-0 rounded-full border border-acento/30 bg-acento-soft px-3 py-1 text-xs font-bold text-acento">{L('5 módulos', '5 modules')}</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m.to} className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-acento/40 hover:shadow-pop">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-acento-soft text-acento">
                <m.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[17px] font-bold tracking-tight">{m.title}</h3>
              <p className="mt-1 text-sm text-text-2">{m.desc}</p>
              <ul className="mt-4 grid gap-2">
                {m.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[13px]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(m.to)} className="mt-auto inline-flex items-center gap-1 self-start pt-5 text-sm font-bold text-acento no-print">
                {L('Ver en el demo', 'See it in the demo')} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Inversión */}
      <section className="mt-12">
        <Kicker className="mb-2">{L('INVERSIÓN', 'INVESTMENT')}</Kicker>
        <h2 className="text-[26px] font-extrabold tracking-tight">{L('Inversión y condiciones', 'Investment and terms')}</h2>
        <InvestmentBlock />
      </section>

      {/* 5. Cierre */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-10">
        <h2 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
          {L('Lo que sobra hoy,', 'What’s left today')} <span className="text-acento">{L('no se pierde mañana.', 'isn’t wasted tomorrow.')}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-2">{L('Si les gusta lo que ven, escribannos y arrancamos esta semana.', 'If you like what you see, message us and we start this week.')}</p>
        <WaButton size="lg" className="mt-6 w-full" />
        <div className="mt-3 text-xs text-muted">Powered by Insights</div>
      </section>
    </div>
  )
}

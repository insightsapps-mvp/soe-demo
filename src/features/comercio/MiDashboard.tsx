import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Clock, Eye, Leaf, Package, Plus, ShoppingBag, Wallet } from 'lucide-react'
import { useData, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { approvedInPeriod, comercioStats, salesByDay, vencMs } from '@/domain/selectors'
import { Card, CardHeader, ExpiryCountdown, KpiCard, PageHeader, PreviewBanner, ProductImage } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { formatMoney, formatNumber } from '@/domain/money'
import { HERO_COMERCIO_ID } from '@/data/seed'
import { axisProps, ChartTooltip, useChartColors } from '@/components/shared/charts'
import { fmtDate } from '@/domain/dates'

export default function MiDashboard() {
  const d = useData()
  const now = useNow()
  const { L, b, lang } = useT()
  const navigate = useNavigate()
  const c = useChartColors()
  const s = useMemo(() => comercioStats(d, HERO_COMERCIO_ID, now), [d, now])
  const serie = useMemo(
    () => salesByDay(approvedInPeriod(d, now).filter((x) => x.comercioId === HERO_COMERCIO_ID), now, 14).map((x) => ({ ...x, label: fmtDate(x.dia, lang, 'd MMM') })),
    [d, now, lang],
  )
  const masVistos = useMemo(() => [...s.live].sort((a, b2) => b2.vistas - a.vistas).slice(0, 5), [s.live])
  const pronto = useMemo(() => [...s.live].sort((a, b2) => vencMs(a) - vencMs(b2)).slice(0, 5), [s.live])

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Notificación cuando un producto está por vencer', 'Alerts when a product is about to expire'),
          L('Liquidación semanal de ventas a tu cuenta', 'Weekly sales payout to your account'),
          L('Reporte de impacto para tus clientes', 'Impact report for your customers'),
        ]}
      />
      <PageHeader
        kicker={L('MI NEGOCIO', 'MY BUSINESS')}
        title={L('Hola, Panadería La Espiga', 'Hi, Panadería La Espiga')}
        subtitle={L('Esto es lo que pasó con tus productos esta semana.', 'Here is what happened with your products this week.')}
        actions={
          <Button onClick={() => navigate('/mi-negocio/productos/nuevo')}>
            <Plus /> {L('Publicar producto', 'Publish product')}
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label={L('Productos activos', 'Live products')} value={s.activos} tone="acento" icon={<Package />} onClick={() => navigate('/mi-negocio/productos')} />
        <KpiCard label={L('Vendidos este mes', 'Sold this month')} value={formatNumber(s.vendidosMes, lang)} tone="ok" icon={<ShoppingBag />} onClick={() => navigate('/mi-negocio/ventas')} />
        <KpiCard label={L('Ingresos del mes', 'Revenue this month')} value={<span>{formatMoney(s.ingresosUsdCents, 'USD', lang, { decimals: false })} <span className="text-sm font-semibold text-text-2">USD</span></span>} icon={<Wallet />} />
        <KpiCard
          label={L('Por vencer hoy', 'Expiring today')}
          value={s.hoy.length}
          tone="warning"
          icon={<Clock />}
          hint={s.hoy[0] ? <ExpiryCountdown vencimiento={[...s.hoy].sort((a, b2) => vencMs(a) - vencMs(b2))[0].vencimiento} now={now} compact /> : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={L('Ventas de los últimos 14 días', 'Sales in the last 14 days')}
            right={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2 py-1 text-xs font-semibold text-ok">
                <Leaf className="h-3.5 w-3.5" /> {formatNumber(s.kgGr / 1000, lang, 0)} kg {L('salvados', 'saved')}
              </span>
            }
          />
          <div className="h-[220px] px-2 pb-3 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.acento} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={c.acento} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke={c.border} vertical={false} />
                <XAxis dataKey="label" {...axisProps(c)} interval={2} />
                <YAxis {...axisProps(c)} width={32} allowDecimals={false} />
                <Tooltip content={<ChartTooltip fmt={(v) => `${v} ${L('ventas', 'sales')}`} />} />
                <Area type="monotone" dataKey="ventas" name={L('Ventas', 'Sales')} stroke={c.acento} strokeWidth={2.5} fill="url(#gMine)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Link
          to="/mi-negocio/productos/nuevo"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-acento p-6 text-white shadow-glow transition hover:bg-acento-hover"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Plus className="h-6 w-6" />
            </div>
            <div className="mt-4 text-xl font-extrabold leading-tight">{L('Publicá algo nuevo', 'Publish something new')}</div>
            <p className="mt-1.5 text-sm text-white/85">{L('¿Te sobró pan de la mañana? En 30 segundos está en el mapa de los vecinos.', 'Leftover bread from this morning? In 30 seconds it’s on your neighbors’ map.')}</p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold">
            {L('Publicar ahora', 'Publish now')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={L('Tus productos más vistos', 'Your most viewed products')} right={<Eye className="h-4 w-4 text-text-2" />} />
          <div className="grid gap-1 p-3">
            {masVistos.map((p) => (
              <button key={p.id} onClick={() => navigate('/mi-negocio/productos')} className="flex items-center gap-3 rounded-xl p-2 text-left transition hover:bg-bg-2">
                <ProductImage foto={p.fotos[0]} categoria={p.categoria} size="sm" className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{b(p.nombre)}</div>
                  <div className="num text-xs text-acento">{formatMoney(p.precioFinalCents, p.moneda, lang)}</div>
                </div>
                <div className="num text-right text-sm font-bold">
                  {p.vistas}
                  <div className="text-[10px] font-medium text-text-2">{L('vistas', 'views')}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title={L('Por vencer pronto', 'Expiring soon')} right={<Clock className="h-4 w-4 text-[rgb(var(--warning))]" />} />
          <div className="grid gap-1 p-3">
            {pronto.map((p) => (
              <button key={p.id} onClick={() => navigate('/mi-negocio/productos')} className="flex items-center gap-3 rounded-xl p-2 text-left transition hover:bg-bg-2">
                <ProductImage foto={p.fotos[0]} categoria={p.categoria} size="sm" className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{b(p.nombre)}</div>
                  <div className="num text-xs text-text-2">-{p.descuentoPct}% · {formatMoney(p.precioFinalCents, p.moneda, lang)}</div>
                </div>
                <ExpiryCountdown vencimiento={p.vencimiento} now={now} className="w-28" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

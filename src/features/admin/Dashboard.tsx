import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowRight, Clock, Download, Leaf, Package, PackageX, Percent, ShoppingBag, Store, Wallet } from 'lucide-react'
import { CircleMarker, Tooltip as LTooltip } from 'react-leaflet'
import { toast } from 'sonner'
import { useData, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { cityActivity, platformStats, salesByCategory, topComercios, approvedInPeriod } from '@/domain/selectors'
import { formatMoney, formatNumber } from '@/domain/money'
import { KpiCard, PageHeader, PreviewBanner, Table, Td, Th, Badge } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/misc'
import { axisProps, ChartTooltip, useChartColors } from '@/components/shared/charts'
import { MapBase } from '@/components/shared/MapBase'
import { CITY_CENTER } from '@/domain/geo'
import { catKey } from '@/i18n/enums'
import { fmtDate } from '@/domain/dates'

export default function Dashboard() {
  const d = useData()
  const now = useNow()
  const { t, L, lang } = useT()
  const navigate = useNavigate()
  const c = useChartColors()
  const s = useMemo(() => platformStats(d, now), [d, now])
  const tx = useMemo(() => approvedInPeriod(d, now), [d, now])
  const cats = useMemo(() => salesByCategory(tx).map((x) => ({ ...x, name: t(catKey(x.categoria)) })), [tx, t])
  const top = useMemo(() => topComercios(d, now, 8), [d, now])
  const cities = useMemo(() => cityActivity(d, now), [d, now])
  const prev = d.historial[d.historial.length - 1]
  const ahorroSerie = useMemo(
    () => [
      ...d.historial.map((h) => ({ mes: fmtDate(h.mes, lang, 'MMM'), v: h.ahorroUsdCents })),
      { mes: L('Este mes', 'This month'), v: s.ahorroUsdCents },
    ],
    [d.historial, lang, L, s.ahorroUsdCents],
  )
  const pctDelta = (a: number, b: number) => `${formatNumber(Math.abs(((a - b) / b) * 100), lang, 0)}%`
  const maxCity = Math.max(...cities.map((x) => x.ventas), 1)

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Métricas en tiempo real desde la base de datos', 'Real-time metrics from the database'),
          L('Reportes PDF programados por email', 'Scheduled PDF reports by email'),
          L('Alertas automáticas de productos por vencer', 'Automatic alerts for expiring products'),
        ]}
      />
      <PageHeader
        kicker={L('PLATAFORMA', 'PLATFORM')}
        title={L('Soe, visto desde arriba', 'Soe, from above')}
        subtitle={L('{n} comercios activos en {c} ciudades.', '{n} active shops in {c} cities.', { n: s.comerciosActivos, c: s.ciudades })}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              toast.success(L('Generando reporte PDF…', 'Generating PDF report…'))
              setTimeout(() => window.print(), 300)
            }}
          >
            <Download /> {L('Exportar reporte (PDF)', 'Export report (PDF)')}
          </Button>
        }
      />

      <div data-trailer="kpis" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label={L('Comercios activos', 'Active shops')} value={formatNumber(s.comerciosActivos, lang)} tone="acento" icon={<Store />} onClick={() => navigate('/comercios')} />
        <KpiCard label={L('Productos activos ahora', 'Products live now')} value={formatNumber(s.productosActivos, lang)} tone="navy" icon={<Package />} onClick={() => navigate('/productos')} />
        <KpiCard
          label={L('Vendidos este mes', 'Sold this month')}
          value={formatNumber(s.vendidosMes, lang)}
          tone="ok"
          icon={<ShoppingBag />}
          delta={{ value: pctDelta(s.vendidosMes, prev.vendidos), up: s.vendidosMes >= prev.vendidos }}
          onClick={() => navigate('/transacciones')}
        />
        <KpiCard label={L('Vencidos sin vender', 'Expired unsold')} value={formatNumber(s.vencidosMes, lang)} tone="danger" icon={<PackageX />} onClick={() => navigate('/productos?estado=vencido')} />
        <KpiCard label={L('Tasa de conversión', 'Conversion rate')} value={`${formatNumber(s.conversion * 100, lang, 0)}%`} icon={<Percent />} hint={L('visitas → compra', 'views → purchase')} />
        <KpiCard
          label={L('Comida salvada este mes', 'Food saved this month')}
          value={
            <span>
              {formatNumber(Math.round(s.kgGr / 1000), lang)}
              <span className="ml-1 text-base font-semibold">kg</span>
            </span>
          }
          tone="acento"
          highlight
          icon={<Leaf />}
          delta={{ value: pctDelta(s.kgGr, prev.kgGr), up: s.kgGr >= prev.kgGr }}
          className="col-span-2 md:col-span-1"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title={L('Ahorro generado a los clientes', 'Savings generated for customers')}
            subtitle={L('Descuentos acumulados, últimos 6 meses', 'Accumulated discounts, last 6 months')}
            right={<Wallet className="h-4 w-4 text-ok" />}
          />
          <div className="px-5 pt-3">
            <div className="num text-[34px] font-bold leading-none tracking-tight text-ok">
              {formatMoney(s.ahorroUsdCents, 'USD', lang, { decimals: false })} <span className="text-sm font-semibold text-text-2">USD</span>
            </div>
            <div className="mt-1 text-xs text-text-2">{L('acumulados en descuentos este mes', 'accumulated in discounts this month')}</div>
          </div>
          <div className="h-[210px] px-2 pb-3 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ahorroSerie} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAhorro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.acento} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={c.acento} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke={c.border} vertical={false} />
                <XAxis dataKey="mes" {...axisProps(c)} />
                <YAxis {...axisProps(c)} width={52} tickFormatter={(v) => `$${formatNumber(v / 100000, lang, 0)}k`} />
                <Tooltip content={<ChartTooltip fmt={(v) => formatMoney(v, 'USD', lang)} />} />
                <Area type="monotone" dataKey="v" name={L('Ahorro', 'Savings')} stroke={c.acento} strokeWidth={2.5} fill="url(#gAhorro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={L('Necesita atención', 'Needs attention')} subtitle={L('Accionable ahora', 'Actionable now')} right={<AlertTriangle className="h-4 w-4 text-[rgb(var(--warning))]" />} />
          <div className="grid gap-2 p-4">
            {[
              { n: s.urgentes.length, tone: 'warning' as const, icon: Clock, label: L('Productos por vencer en <6h sin vender', 'Products expiring in <6h unsold'), to: '/productos?urgentes=1' },
              { n: s.idle.length, tone: 'warning' as const, icon: Store, label: L('Comercios sin actividad hace 7+ días', 'Shops inactive for 7+ days'), to: '/comercios?inactivos=1' },
              { n: s.rechazadas.length, tone: 'danger' as const, icon: AlertTriangle, label: L('Transacciones con error de pago', 'Transactions with payment errors'), to: '/transacciones?estado=rechazado' },
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => navigate(r.to)}
                className="group flex items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-border-strong hover:bg-bg-2"
              >
                <div
                  className={
                    r.tone === 'danger'
                      ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger'
                      : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-[rgb(var(--warning))]'
                  }
                >
                  <r.icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1 text-[13px] font-medium leading-snug">{r.label}</div>
                <div className={r.tone === 'danger' ? 'num text-xl font-bold text-danger' : 'num text-xl font-bold text-[rgb(var(--warning))]'}>{r.n}</div>
                <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-text" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title={L('Ventas por categoría', 'Sales by category')} subtitle={L('Unidades vendidas este mes', 'Units sold this month')} />
          <div className="h-[260px] px-2 pb-3 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cats} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke={c.border} vertical={false} />
                <XAxis dataKey="name" {...axisProps(c)} interval={0} tick={{ fill: c.text2, fontSize: 11 }} />
                <YAxis {...axisProps(c)} width={40} />
                <Tooltip cursor={{ fill: c.acentoSoft }} content={<ChartTooltip fmt={(v) => `${formatNumber(v, lang)} ${L('ventas', 'sales')}`} />} />
                <Bar dataKey="ventas" name={L('Ventas', 'Sales')} fill={c.acento} radius={[8, 8, 0, 0]} maxBarSize={46} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader title={L('Actividad por ciudad', 'Activity by city')} subtitle={L('Ventas del mes · tamaño = volumen', 'Monthly sales · size = volume')} />
          <div className="relative mt-3 h-[210px] overflow-hidden border-y border-border">
            <MapBase center={{ lat: 10.3, lng: -68.9 }} zoom={6} interactive={false}>
              {cities.map((x) => (
                <CircleMarker
                  key={x.ciudad}
                  center={[CITY_CENTER[x.ciudad].lat, CITY_CENTER[x.ciudad].lng]}
                  radius={10 + (x.ventas / maxCity) * 26}
                  pathOptions={{ color: c.acento, fillColor: c.acento, fillOpacity: 0.25 + (x.ventas / maxCity) * 0.45, weight: 2 }}
                >
                  <LTooltip direction="top" permanent={x.ciudad === 'Caracas'}>
                    <b>{x.ciudad}</b> · {formatNumber(x.ventas, lang)} {L('ventas', 'sales')}
                  </LTooltip>
                </CircleMarker>
              ))}
            </MapBase>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            {cities.map((x) => (
              <div key={x.ciudad} className="bg-card px-4 py-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{x.ciudad}</span>
                  <span className="num font-bold text-acento">{formatNumber(x.ventas, lang)}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-acento" style={{ width: `${(x.ventas / maxCity) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader
          title={L('Comercios top del mes', 'Top shops this month')}
          right={
            <Button variant="ghost" size="sm" onClick={() => navigate('/comercios')}>
              {t('common.viewAll')} <ArrowRight />
            </Button>
          }
        />
        <Table className="mt-3">
          <thead>
            <tr>
              <Th>#</Th>
              <Th>{t('common.shop')}</Th>
              <Th>{t('common.city')}</Th>
              <Th>{t('common.category')}</Th>
              <Th align="right">{L('Productos activos', 'Live products')}</Th>
              <Th align="right">{L('Ventas', 'Sales')}</Th>
              <Th align="right">{L('Ingresos', 'Revenue')}</Th>
            </tr>
          </thead>
          <tbody>
            {top.map((r, i) => (
              <tr key={r.c.id} className="cursor-pointer transition hover:bg-bg-2" onClick={() => navigate(`/comercios/${r.c.id}`)}>
                <Td className="num w-10 text-text-2">{i + 1}</Td>
                <Td className="font-semibold">{r.c.nombre}</Td>
                <Td className="text-text-2">{r.c.ciudad}</Td>
                <Td>
                  <Badge tone="neutral">{t(catKey(r.c.categoria))}</Badge>
                </Td>
                <Td align="right" className="num">{r.activos}</Td>
                <Td align="right" className="num font-semibold">{formatNumber(r.ventas, lang)}</Td>
                <Td align="right" className="num text-acento">{formatMoney(r.usd, 'USD', lang)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { AlertTriangle, CreditCard, Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { methodDistribution, METODOS, approvedInPeriod } from '@/domain/selectors'
import { Card, CardHeader, DevNotice, EmptyState, KpiCard, PageHeader, PreviewBanner } from '@/components/shared/all'
import { Segmented, Select } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { metodoKey, txKey } from '@/i18n/enums'
import { formatMoney, formatNumber } from '@/domain/money'
import { TxTable } from '@/features/shared/TxTable'
import { TxDetail } from '@/features/shared/TxDetail'
import type { EstadoTransaccion, MetodoPago, Transaccion } from '@/domain/types'
import { DAY } from '@/domain/dates'
import { downloadCsv, normalize } from '@/lib/utils'
import { ChartTooltip, useChartColors } from '@/components/shared/charts'
import { MethodLogo } from '@/features/shared/MethodLogo'

type Rango = '1' | '7' | '30'

export default function Transacciones() {
  const d = useData()
  const now = useNow()
  const { t, L, lang } = useT()
  const c = useChartColors()
  const [params] = useSearchParams()
  const [metodo, setMetodo] = useState<'all' | MetodoPago>('all')
  const [estado, setEstado] = useState<'all' | EstadoTransaccion>((params.get('estado') as EstadoTransaccion) || 'all')
  const [comercio, setComercio] = useState('all')
  const [rango, setRango] = useState<Rango>('30')
  const [minUsd, setMinUsd] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Transaccion | null>(null)
  const comercios = useMemo(() => [...d.comercios].sort((a, b) => a.nombre.localeCompare(b.nombre)), [d.comercios])
  const comById = useMemo(() => new Map(d.comercios.map((x) => [x.id, x])), [d.comercios])

  const filtered = useMemo(() => {
    const from = now - Number(rango) * DAY
    const min = Math.round(Number(minUsd.replace(',', '.') || 0) * 100)
    const nq = normalize(q)
    return d.transacciones.filter(
      (x) =>
        new Date(x.fecha).getTime() > from &&
        (metodo === 'all' || x.metodo === metodo) &&
        (estado === 'all' || x.estado === estado) &&
        (comercio === 'all' || x.comercioId === comercio) &&
        x.montoUsdCents >= min &&
        (!nq || normalize(`${x.id} ${x.clienteNombre} ${comById.get(x.comercioId)?.nombre ?? ''}`).includes(nq)),
    )
  }, [d.transacciones, now, rango, minUsd, metodo, estado, comercio, q, comById])

  const approved = useMemo(() => approvedInPeriod(d, now), [d, now])
  const dist = useMemo(() => methodDistribution(approved), [approved])
  const colors: Record<MetodoPago, string> = { pago_movil: c.acento, binance: c.text, zelle: c.muted }
  const total = approved.reduce((s, x) => s + x.montoUsdCents, 0)
  const errores = d.transacciones.filter((x) => x.estado === 'rechazado').length
  const pend = d.transacciones.filter((x) => x.estado === 'pendiente').length

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Webhooks firmados de Binance Pay, Zelle y Pago Móvil', 'Signed webhooks from Binance Pay, Zelle and Pago Móvil'),
          L('Reintentos automáticos con backoff exponencial', 'Automatic retries with exponential backoff'),
          L('Conciliación diaria contra el banco', 'Daily bank reconciliation'),
        ]}
      />
      <DevNotice
        feature={L('Webhooks reales de Binance/Zelle/Pago Móvil', 'Real Binance/Zelle/Pago Móvil webhooks')}
        now={L('los eventos de pago y su log se simulan con datos demo.', 'payment events and their log are simulated with demo data.')}
        later={L('cada proveedor notifica a Soe con firma verificada y se reintenta si falla.', 'each provider notifies Soe with a verified signature and retries on failure.')}
      />
      <PageHeader
        kicker={L('PAGOS', 'PAYMENTS')}
        title={t('nav.transacciones')}
        subtitle={L('Un checkout, tres formas de cobrar.', 'One checkout, three ways to get paid.')}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv('soe-transacciones.csv', [
                ['ID', 'Fecha', 'Comercio', 'Cliente', 'Método', 'Moneda', 'Monto', 'Monto USD', 'Tasa aplicada', 'Estado'],
                ...filtered.map((x) => [x.id, x.fecha, comById.get(x.comercioId)?.nombre ?? '', x.clienteNombre, t(metodoKey(x.metodo)), x.moneda, (x.montoCents / 100).toFixed(2), (x.montoUsdCents / 100).toFixed(2), x.tasaCambioAplicada, t(txKey(x.estado))]),
              ])
              toast.success(L('Reporte exportado', 'Report exported'))
            }}
          >
            <Download /> {t('common.export')}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <KpiCard label={L('Cobrado este mes', 'Collected this month')} value={formatMoney(total, 'USD', lang)} tone="acento" icon={<CreditCard />} />
          <KpiCard label={L('Transacciones aprobadas', 'Approved transactions')} value={formatNumber(approved.length, lang)} tone="ok" />
          <KpiCard label={L('Pendientes de confirmación', 'Awaiting confirmation')} value={pend} tone="warning" onClick={() => setEstado('pendiente')} />
          <KpiCard label={L('Con error de pago', 'Payment errors')} value={errores} tone="danger" icon={<AlertTriangle />} onClick={() => setEstado('rechazado')} />
        </div>
        <Card>
          <CardHeader title={L('Distribución por método', 'Distribution by method')} subtitle={L('Transacciones aprobadas del mes', 'Approved transactions this month')} />
          <div className="flex items-center gap-4 p-5 pt-3">
            <div className="h-[130px] w-[130px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dist} dataKey="n" nameKey="metodo" innerRadius={40} outerRadius={62} paddingAngle={2} stroke="none">
                    {dist.map((x) => (
                      <Cell key={x.metodo} fill={colors[x.metodo]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip fmt={(v) => formatNumber(v, lang)} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid flex-1 gap-2.5">
              {dist.map((x) => (
                <button key={x.metodo} onClick={() => setMetodo(metodo === x.metodo ? 'all' : x.metodo)} className="flex items-center gap-2 text-left text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[x.metodo] }} />
                  <span className="font-semibold">{t(metodoKey(x.metodo))}</span>
                  <span className="num ml-auto font-bold">{formatNumber(x.pct, lang, 0)}%</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="grid gap-2 border-b border-border p-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder={L('Buscar por ID, cliente o comercio…', 'Search by ID, customer or shop…')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Segmented
            value={rango}
            onChange={setRango}
            options={[
              { value: '1', label: '24h' },
              { value: '7', label: L('7 días', '7 days') },
              { value: '30', label: L('30 días', '30 days') },
            ]}
          />
          <div className="grid grid-cols-2 gap-2 md:col-span-2 md:flex">
            <Select value={metodo} onValueChange={(v) => setMetodo(v as 'all')} className="md:w-40" ariaLabel={t('common.method')} options={[{ value: 'all', label: L('Todos los métodos', 'All methods') }, ...METODOS.map((m) => ({ value: m, label: t(metodoKey(m)) }))]} />
            <Select
              value={estado}
              onValueChange={(v) => setEstado(v as 'all')}
              className="md:w-40"
              ariaLabel={t('common.status')}
              options={[{ value: 'all', label: L('Todos los estados', 'All statuses') }, ...(['aprobado', 'pendiente', 'rechazado'] as const).map((e) => ({ value: e, label: t(txKey(e)) }))]}
            />
            <Select value={comercio} onValueChange={setComercio} className="md:w-56" ariaLabel={t('common.shop')} options={[{ value: 'all', label: L('Todos los comercios', 'All shops') }, ...comercios.map((x) => ({ value: x.id, label: x.nombre }))]} />
            <input className="input md:w-36" inputMode="decimal" placeholder={L('Monto mín. USD', 'Min. amount USD')} value={minUsd} onChange={(e) => setMinUsd(e.target.value)} />
          </div>
        </div>
        {filtered.length ? (
          <TxTable items={filtered} onOpen={setOpen} showComercio />
        ) : (
          <EmptyState icon={<CreditCard />} title={t('common.noResults')} action={<Button variant="secondary" onClick={() => { setMetodo('all'); setEstado('all'); setComercio('all'); setMinUsd(''); setQ(''); setRango('30') }}>{t('common.clearFilters')}</Button>} />
        )}
      </Card>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-2">
        {METODOS.map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5">
            <MethodLogo m={m} size="sm" /> {t(metodoKey(m))}
          </span>
        ))}
      </div>
      <TxDetail tx={open} onClose={() => setOpen(null)} admin />
    </div>
  )
}

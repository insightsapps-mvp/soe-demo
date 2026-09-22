import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRightLeft, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useDispatch, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { Card, CardHeader, DevNotice, PageHeader, PreviewBanner, Table, Td, Th, Badge } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { Segmented, Select } from '@/components/ui/form'
import { agoShort, fmtDate, fmtDateTime } from '@/domain/dates'
import { formatMoney, formatNumber } from '@/domain/money'
import { axisProps, ChartTooltip, useChartColors } from '@/components/shared/charts'
import { convert, ratesFrom } from '@/domain/fx'
import type { Moneda, TasaCambio } from '@/domain/types'
import { metodoKey } from '@/i18n/enums'

export default function Monedas() {
  const d = useData()
  const now = useNow(15_000)
  const dispatch = useDispatch()
  const { t, L, lang } = useT()
  const c = useChartColors()
  const [spinning, setSpinning] = useState(false)
  const [amount, setAmount] = useState('10')
  const [from, setFrom] = useState<Moneda>('USD')
  const rates = useMemo(() => ratesFrom(d.tasas), [d.tasas])
  const hist = useMemo(() => d.tasasHist.map((h) => ({ dia: fmtDate(h.fecha, lang, lang === 'es' ? 'EEE d' : 'EEE d'), ves: h.VES_USD, usdt: h.USD_USDT })), [d.tasasHist, lang])
  const lastTx = useMemo(() => d.transacciones.filter((x) => x.estado === 'aprobado' && x.moneda !== 'USD').slice(0, 8), [d.transacciones])
  const prodById = useMemo(() => new Map(d.productos.map((p) => [p.id, p])), [d.productos])
  const first = d.tasasHist[0]
  const vesDelta = ((rates.VES_USD - first.VES_USD) / first.VES_USD) * 100

  const refresh = () => {
    setSpinning(true)
    setTimeout(() => {
      const at = new Date().toISOString()
      const ves = Math.round((rates.VES_USD + (Math.random() * 0.8 - 0.25)) * 100) / 100
      const usdt = Math.round((1 + (Math.random() * 0.002 - 0.0005)) * 10000) / 10000
      const tasas: TasaCambio[] = [
        { par: 'VES_USD', valor: ves, actualizadaEl: at, fuente: d.fxFuente === 'BCV' ? 'BCV' : 'CoinGecko' },
        { par: 'USD_USDT', valor: usdt, actualizadaEl: at, fuente: 'CoinGecko' },
      ]
      dispatch({ type: 'rates', tasas })
      setSpinning(false)
      toast.success(L('Tasas actualizadas · 1 USD = Bs. {v}', 'Rates updated · 1 USD = Bs. {v}', { v: formatNumber(ves, lang, 2) }))
    }, 900)
  }

  const amt = Math.round(Number(amount.replace(',', '.') || 0) * 100)
  const monedas: Moneda[] = ['VES', 'USD', 'USDT']

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Cotización oficial BCV y mercado cripto', 'Official BCV and crypto market quotes'),
          L('Actualización automática cada hora', 'Automatic hourly refresh'),
          L('Alertas si la tasa se mueve más de 2% en el día', 'Alerts if the rate moves over 2% in a day'),
        ]}
      />
      <DevNotice
        feature={L('Conexión en vivo a CoinGecko/BCV', 'Live CoinGecko/BCV connection')}
        now={L('las tasas y su historial son simulados y "Actualizar ahora" aplica una variación de demo.', 'rates and history are simulated and "Refresh now" applies a demo change.')}
        later={L('Soe consulta la fuente elegida cada hora y guarda la tasa usada en cada venta.', 'Soe queries the chosen source hourly and stores the rate used on every sale.')}
      />
      <PageHeader
        kicker={L('MULTI-MONEDA', 'MULTI-CURRENCY')}
        title={t('nav.monedas')}
        subtitle={L('Precios justos pase lo que pase con el tipo de cambio.', 'Fair prices no matter what the exchange rate does.')}
        actions={
          <Button onClick={refresh} disabled={spinning}>
            <RefreshCw className={spinning ? 'animate-spin' : ''} /> {L('Actualizar ahora', 'Refresh now')}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader
            title={L('Tasas de cambio actuales', 'Current exchange rates')}
            right={
              <span className="inline-flex items-center gap-1.5 text-xs text-text-2">
                <Clock className="h-3.5 w-3.5" /> {L('Última actualización', 'Last update')} {agoShort(d.tasas[0].actualizadaEl, lang, now)}
              </span>
            }
          />
          <Table className="mt-3">
            <thead>
              <tr>
                <Th>{L('Par', 'Pair')}</Th>
                <Th align="right">{L('Valor', 'Value')}</Th>
                <Th align="right">{L('Variación 7d', '7d change')}</Th>
                <Th>{L('Fuente', 'Source')}</Th>
                <Th>{L('Actualizada', 'Updated')}</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td className="font-semibold">VES / USD</Td>
                <Td align="right" className="num text-lg font-bold text-acento">Bs. {formatNumber(rates.VES_USD, lang, 2)}</Td>
                <Td align="right">
                  <Badge tone={vesDelta > 0 ? 'warning' : 'ok'} className="num">
                    {vesDelta > 0 ? '▲' : '▼'} {formatNumber(Math.abs(vesDelta), lang, 2)}%
                  </Badge>
                </Td>
                <Td>
                  <Badge tone="neutral">{d.fxFuente === 'BCV' ? 'BCV' : 'CoinGecko'}</Badge>
                </Td>
                <Td className="text-xs text-text-2">{fmtDateTime(d.tasas[0].actualizadaEl, lang)}</Td>
              </tr>
              <tr>
                <Td className="font-semibold">USD / USDT</Td>
                <Td align="right" className="num text-lg font-bold">{formatNumber(rates.USD_USDT, lang, 4)}</Td>
                <Td align="right">
                  <Badge tone="ok" className="num">≈ 0,0%</Badge>
                </Td>
                <Td>
                  <Badge tone="neutral">CoinGecko</Badge>
                </Td>
                <Td className="text-xs text-text-2">{fmtDateTime(d.tasas[1].actualizadaEl, lang)}</Td>
              </tr>
            </tbody>
          </Table>
          <div className="h-[220px] px-2 pb-3 pt-4">
            <div className="label-xs mb-2 px-3">{L('Historial Bs/USD · últimos 7 días', 'Bs/USD history · last 7 days')}</div>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={hist} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke={c.border} vertical={false} />
                <XAxis dataKey="dia" {...axisProps(c)} />
                <YAxis {...axisProps(c)} width={52} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => formatNumber(v, lang, 0)} />
                <Tooltip content={<ChartTooltip fmt={(v) => `Bs. ${formatNumber(v, lang, 2)}`} />} />
                <Line type="monotone" dataKey="ves" name="VES/USD" stroke={c.acento} strokeWidth={2.5} dot={{ r: 3, fill: c.acento }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-[15px] font-bold">
              <ArrowRightLeft className="h-4 w-4 text-acento" /> {L('Conversión en tiempo real', 'Real-time conversion')}
            </div>
            <div className="flex gap-2">
              <input className="input num" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Select value={from} onValueChange={(v) => setFrom(v as Moneda)} className="w-28" options={monedas.map((m) => ({ value: m, label: m }))} />
            </div>
            <div className="mt-3 grid gap-2">
              {monedas
                .filter((m) => m !== from)
                .map((m) => (
                  <div key={m} className="flex items-center justify-between rounded-xl bg-bg-2 px-3 py-2.5">
                    <span className="text-xs font-semibold text-text-2">{m}</span>
                    <span className="num text-base font-bold">{formatMoney(convert(amt, from, m, rates), m, lang, { decimals: true })}</span>
                  </div>
                ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-[15px] font-bold">{L('Configuración', 'Settings')}</div>
            <div className="grid gap-3">
              <div>
                <div className="mb-1.5 text-xs font-semibold">{L('Fuente de cotización', 'Rate source')}</div>
                <Segmented
                  value={d.fxFuente}
                  onChange={(v) => {
                    dispatch({ type: 'fxConfig', fuente: v })
                    toast.success(L('Fuente: {v}', 'Source: {v}', { v }))
                  }}
                  options={[
                    { value: 'BCV', label: 'BCV' },
                    { value: 'CoinGecko', label: 'CoinGecko' },
                  ]}
                />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-semibold">{L('Frecuencia de actualización', 'Refresh frequency')}</div>
                <Select
                  value={String(d.fxFrecuenciaMin)}
                  onValueChange={(v) => {
                    dispatch({ type: 'fxConfig', frecuenciaMin: Number(v) })
                    toast.success(L('Frecuencia guardada', 'Frequency saved'))
                  }}
                  className="w-full"
                  options={[
                    { value: '15', label: L('Cada 15 minutos', 'Every 15 minutes') },
                    { value: '30', label: L('Cada 30 minutos', 'Every 30 minutes') },
                    { value: '60', label: L('Cada hora', 'Every hour') },
                    { value: '180', label: L('Cada 3 horas', 'Every 3 hours') },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader title={L('Tipo de cambio aplicado por venta', 'Exchange rate applied per sale')} subtitle={L('Cada transacción guarda la tasa con la que se cobró', 'Each transaction stores the rate it was charged at')} />
        <Table className="mt-3">
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>{t('common.product')}</Th>
              <Th>{t('common.method')}</Th>
              <Th align="right">{L('Tasa aplicada', 'Rate applied')}</Th>
              <Th align="right">{t('common.amount')}</Th>
              <Th align="right">USD</Th>
            </tr>
          </thead>
          <tbody>
            {lastTx.map((x) => {
              const p = prodById.get(x.productoId)
              return (
                <tr key={x.id}>
                  <Td className="num text-xs font-semibold">{x.id}</Td>
                  <Td className="max-w-[220px] truncate">{p ? (lang === 'es' ? p.nombre[0] : p.nombre[1]) : '—'}</Td>
                  <Td className="text-xs">{t(metodoKey(x.metodo))}</Td>
                  <Td align="right" className="num text-xs">{x.moneda === 'VES' ? `Bs. ${formatNumber(x.tasaCambioAplicada, lang, 2)}` : `${formatNumber(x.tasaCambioAplicada, lang, 4)} USDT`}</Td>
                  <Td align="right" className="num font-semibold">{formatMoney(x.montoCents, x.moneda, lang)}</Td>
                  <Td align="right" className="num text-text-2">{formatMoney(x.montoUsdCents, 'USD', lang)}</Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}

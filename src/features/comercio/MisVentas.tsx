import { useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import { useData, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { Card, EmptyState, KpiCard, PageHeader, PreviewBanner } from '@/components/shared/all'
import { Segmented, Select } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { metodoKey, txKey } from '@/i18n/enums'
import { METODOS } from '@/domain/selectors'
import { formatMoney, formatNumber } from '@/domain/money'
import { TxTable } from '@/features/shared/TxTable'
import { TxDetail } from '@/features/shared/TxDetail'
import { HERO_COMERCIO_ID } from '@/data/seed'
import type { EstadoTransaccion, MetodoPago, Transaccion } from '@/domain/types'
import { DAY } from '@/domain/dates'

export default function MisVentas() {
  const d = useData()
  const now = useNow()
  const { t, L, lang } = useT()
  const [metodo, setMetodo] = useState<'all' | MetodoPago>('all')
  const [estado, setEstado] = useState<'all' | EstadoTransaccion>('all')
  const [rango, setRango] = useState<'7' | '30'>('30')
  const [open, setOpen] = useState<Transaccion | null>(null)
  const mine = useMemo(() => d.transacciones.filter((x) => x.comercioId === HERO_COMERCIO_ID), [d.transacciones])
  const filtered = useMemo(
    () => mine.filter((x) => new Date(x.fecha).getTime() > now - Number(rango) * DAY && (metodo === 'all' || x.metodo === metodo) && (estado === 'all' || x.estado === estado)),
    [mine, now, rango, metodo, estado],
  )
  const ok = filtered.filter((x) => x.estado === 'aprobado')
  const totalUsd = ok.reduce((s, x) => s + x.montoUsdCents, 0)
  const totalVes = ok.filter((x) => x.moneda === 'VES').reduce((s, x) => s + x.montoCents, 0)
  const ahorro = ok.reduce((s, x) => s + x.ahorroUsdCents, 0)

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Liquidación automática a tu cuenta bancaria', 'Automatic payout to your bank account'),
          L('Factura fiscal por cada venta', 'Tax invoice for every sale'),
          L('Conciliación por método de pago', 'Reconciliation by payment method'),
        ]}
      />
      <PageHeader kicker={L('MI NEGOCIO', 'MY BUSINESS')} title={L('Mis ventas', 'My sales')} subtitle={L('Todo lo que vendiste por Soe, con el método y la moneda con que te pagaron.', 'Everything you sold on Soe, with the method and currency you were paid in.')} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={L('Total del período', 'Period total')} value={formatMoney(totalUsd, 'USD', lang)} tone="acento" />
        <KpiCard label={L('Cobrado en bolívares', 'Collected in bolívares')} value={formatMoney(totalVes, 'VES', lang, { compact: true })} />
        <KpiCard label={L('Ventas aprobadas', 'Approved sales')} value={formatNumber(ok.length, lang)} tone="ok" />
        <KpiCard label={L('Ahorro para tus clientes', 'Savings for your customers')} value={formatMoney(ahorro, 'USD', lang)} tone="ok" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:items-center">
          <Segmented value={rango} onChange={setRango} options={[{ value: '7', label: L('7 días', '7 days') }, { value: '30', label: L('30 días', '30 days') }]} />
          <div className="grid flex-1 grid-cols-2 gap-2 md:flex md:justify-end">
            <Select value={metodo} onValueChange={(v) => setMetodo(v as 'all')} className="md:w-44" options={[{ value: 'all', label: L('Todos los métodos', 'All methods') }, ...METODOS.map((m) => ({ value: m, label: t(metodoKey(m)) }))]} />
            <Select value={estado} onValueChange={(v) => setEstado(v as 'all')} className="md:w-44" options={[{ value: 'all', label: L('Todos los estados', 'All statuses') }, ...(['aprobado', 'pendiente', 'rechazado'] as const).map((e) => ({ value: e, label: t(txKey(e)) }))]} />
          </div>
        </div>
        {filtered.length ? (
          <TxTable items={filtered} onOpen={setOpen} initialsOnly />
        ) : (
          <EmptyState icon={<Receipt />} title={t('common.noResults')} action={<Button variant="secondary" onClick={() => { setMetodo('all'); setEstado('all') }}>{t('common.clearFilters')}</Button>} />
        )}
      </Card>
      <TxDetail tx={open} onClose={() => setOpen(null)} />
    </div>
  )
}

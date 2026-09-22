import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, PiggyBank, ShoppingBag } from 'lucide-react'
import { useData } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { Card, EmptyState, PageHeader, PreviewBanner, ProductImage, Table, Td, Th } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { HERO_CLIENT_ID } from '@/data/seed'
import { clientStats } from '@/domain/selectors'
import { formatMoney, formatNumber } from '@/domain/money'
import { metodoKey } from '@/i18n/enums'
import { fmtDateTime } from '@/domain/dates'
import { MethodLogo } from '@/features/shared/MethodLogo'
import { TxDetail } from '@/features/shared/TxDetail'
import type { Transaccion } from '@/domain/types'

export default function MisCompras() {
  const d = useData()
  const { t, L, b, lang } = useT()
  const s = useMemo(() => clientStats(d, HERO_CLIENT_ID), [d])
  const byId = useMemo(() => new Map(d.productos.map((p) => [p.id, p])), [d.productos])
  const comById = useMemo(() => new Map(d.comercios.map((c) => [c.id, c])), [d.comercios])
  const [open, setOpen] = useState<Transaccion | null>(null)
  const list = useMemo(() => [...s.tx].sort((a, b2) => b2.fecha.localeCompare(a.fecha)), [s.tx])

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Código de retiro con QR', 'Pickup code with QR'),
          L('Reembolso automático si el comercio cancela', 'Automatic refund if the shop cancels'),
          L('Tu impacto: kilos salvados por mes', 'Your impact: kilos saved per month'),
        ]}
      />
      <PageHeader kicker={L('HISTORIAL', 'HISTORY')} title={L('Mis compras', 'My purchases')} />
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-ok to-[#0e7a3a] p-6 text-white shadow-card">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <div className="num text-[32px] font-bold leading-none">
                {formatMoney(s.ahorroUsdCents, 'USD', lang, { decimals: false })} <span className="text-base font-semibold">USD</span>
              </div>
              <div className="mt-1 text-sm text-white/85">{L('ahorrados en {n} compras', 'saved across {n} purchases', { n: s.compras })}</div>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="num text-xl font-bold">{formatMoney(s.gastoUsdCents, 'USD', lang)}</div>
              <div className="text-xs text-white/80">{L('gastado', 'spent')}</div>
            </div>
            <div>
              <div className="num flex items-center gap-1 text-xl font-bold">
                <Leaf className="h-4 w-4" /> {formatNumber(s.kgGr / 1000, lang, 1)} kg
              </div>
              <div className="text-xs text-white/80">{L('de comida salvada', 'of food saved')}</div>
            </div>
          </div>
        </div>
      </div>
      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={<ShoppingBag />} title={L('Todavía no compraste nada', 'No purchases yet')} action={<Button asChild><Link to="/explorar">{L('Explorar ofertas', 'Explore deals')}</Link></Button>} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>{t('common.date')}</Th>
                <Th>{t('common.product')}</Th>
                <Th>{t('common.shop')}</Th>
                <Th>{t('common.method')}</Th>
                <Th align="right">{L('Pagado', 'Paid')}</Th>
                <Th align="right">{L('Ahorro', 'Savings')}</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => {
                const p = byId.get(x.productoId)
                return (
                  <tr key={x.id} className="cursor-pointer transition hover:bg-bg-2" onClick={() => setOpen(x)}>
                    <Td className="whitespace-nowrap text-xs text-text-2">{fmtDateTime(x.fecha, lang)}</Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        {p && <ProductImage foto={p.fotos[0]} categoria={p.categoria} size="sm" className="h-9 w-9 shrink-0 rounded-lg" />}
                        <span className="font-semibold">{p ? b(p.nombre) : '—'}</span>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-text-2">{comById.get(x.comercioId)?.nombre}</Td>
                    <Td>
                      <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold">
                        <MethodLogo m={x.metodo} size="sm" /> {t(metodoKey(x.metodo))}
                      </div>
                    </Td>
                    <Td align="right" className="num whitespace-nowrap font-semibold">{formatMoney(x.montoCents, x.moneda, lang)}</Td>
                    <Td align="right" className="num whitespace-nowrap font-bold text-ok">+{formatMoney(x.ahorroUsdCents, 'USD', lang)}</Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Card>
      <TxDetail tx={open} onClose={() => setOpen(null)} />
    </div>
  )
}

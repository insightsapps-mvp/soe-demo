import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Clock, Leaf, MapPin, Package, Power, ShoppingBag, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useDispatch, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { comercioStats, effectiveEstado, vencMs } from '@/domain/selectors'
import { Badge, Card, CardHeader, EmptyState, KpiCard, PreviewBanner, Kicker } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/form'
import { catKey } from '@/i18n/enums'
import { formatMoney, formatNumber } from '@/domain/money'
import { ProductTable } from '@/features/shared/ProductTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ComercioStatus } from './Comercios'
import { agoShort } from '@/domain/dates'

export default function ComercioDetalle() {
  const { comercioId } = useParams()
  const d = useData()
  const now = useNow()
  const dispatch = useDispatch()
  const { t, L, b, lang } = useT()
  const c = d.comercios.find((x) => x.id === comercioId)
  const s = useMemo(() => (c ? comercioStats(d, c.id, now) : null), [c, d, now])
  const [tab, setTab] = useState<'activo' | 'vendido' | 'vencido' | 'all'>('activo')
  const [confirm, setConfirm] = useState(false)

  const list = useMemo(() => {
    if (!s) return []
    const l = s.prods.filter((p) => tab === 'all' || (!p.dadoDeBaja && effectiveEstado(p, now) === tab))
    return l.sort((a, b2) => (tab === 'activo' ? vencMs(a) - vencMs(b2) : b2.vencimiento.localeCompare(a.vencimiento)))
  }, [s, tab, now])

  if (!c || !s) {
    return <EmptyState icon={<Package />} title={L('Comercio no encontrado', 'Shop not found')} action={<Button asChild variant="secondary"><Link to="/comercios">{t('common.back')}</Link></Button>} />
  }
  const urg = s.urgentes.length

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Chat directo con el comercio', 'Direct chat with the shop'),
          L('Liquidaciones y comisiones por período', 'Payouts and commissions by period'),
          L('Auditoría de cambios de precios', 'Price change audit trail'),
        ]}
      />
      <Link to="/comercios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-acento">
        <ArrowLeft className="h-3.5 w-3.5" /> {t('nav.comercios')}
      </Link>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Kicker className="mb-2">{t(catKey(c.categoria))}</Kicker>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">{c.nombre}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-2">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {c.direccion}
            </span>
            <span className="text-muted">·</span>
            <span>{b(c.horario)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ComercioStatus c={c} urgentes={urg} />
            <Badge tone="neutral">{c.ciudad}</Badge>
            <span className="text-xs text-text-2">
              {L('Última actividad', 'Last activity')} {agoShort(c.ultimaActividad, lang, now)}
            </span>
          </div>
        </div>
        <Button
          variant={c.activo ? 'secondary' : 'ok'}
          className={c.activo ? 'text-danger' : ''}
          onClick={() => (c.activo ? setConfirm(true) : (dispatch({ type: 'comercioActivo', id: c.id, activo: true, at: new Date().toISOString() }), toast.success(L('Comercio activado', 'Shop activated'))))}
        >
          <Power /> {c.activo ? L('Desactivar comercio', 'Deactivate shop') : L('Activar comercio', 'Activate shop')}
        </Button>
      </div>

      {urg >= 3 && c.activo && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-danger">{L('{n} productos vencen en menos de 6 horas sin vender', '{n} products expire in under 6 hours unsold', { n: urg })}</div>
            <div className="text-xs text-text-2">{L('Sugerencia: subir el descuento al 60% y enviar una notificación a clientes en 3 km.', 'Suggestion: raise the discount to 60% and notify customers within 3 km.')}</div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              for (const p of s.urgentes) dispatch({ type: 'update', id: p.id, patch: { descuentoPct: Math.max(p.descuentoPct, 60), precioFinalCents: Math.round((p.precioOriginalCents * (100 - Math.max(p.descuentoPct, 60))) / 100) } })
              toast.success(L('Descuento subido al 60% y aviso enviado a clientes cercanos', 'Discount raised to 60% and nearby customers notified'))
            }}
          >
            {L('Aplicar sugerencia', 'Apply suggestion')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={L('Productos activos', 'Live products')} value={s.activos} tone="acento" icon={<Package />} hint={urg ? <span className="font-semibold text-danger">{urg} &lt;6h</span> : undefined} />
        <KpiCard label={L('Vendidos este mes', 'Sold this month')} value={formatNumber(s.vendidosMes, lang)} tone="ok" icon={<ShoppingBag />} />
        <KpiCard label={L('Ingresos del mes', 'Revenue this month')} value={formatMoney(s.ingresosUsdCents, 'USD', lang)} icon={<Wallet />} />
        <KpiCard label={L('Comida salvada', 'Food saved')} value={`${formatNumber(s.kgGr / 1000, lang, 0)} kg`} tone="acento" icon={<Leaf />} />
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader
          title={L('Productos del comercio', 'Shop products')}
          subtitle={L('{t} en total · {v} vendidos · {x} vencidos', '{t} total · {v} sold · {x} expired', { t: s.total, v: s.vendidosTotal, x: s.vencidosTotal })}
          right={
            <Segmented
              size="sm"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'activo', label: t('estado.activo') },
                { value: 'vendido', label: t('estado.vendido') },
                { value: 'vencido', label: t('estado.vencido') },
                { value: 'all', label: t('common.all') },
              ]}
            />
          }
        />
        <div className="mt-3">
          {list.length ? <ProductTable items={list} now={now} mode="admin" pageSize={8} /> : <EmptyState icon={<Clock />} title={t('common.noResults')} />}
        </div>
      </Card>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={L('¿Desactivar {n}?', 'Deactivate {n}?', { n: c.nombre })}
        description={L('Sus productos dejan de mostrarse a los clientes hasta que lo reactives.', 'Its products stop showing to customers until you reactivate it.')}
        confirmLabel={L('Desactivar comercio', 'Deactivate shop')}
        tone="danger"
        onConfirm={() => {
          dispatch({ type: 'comercioActivo', id: c.id, activo: false, at: new Date().toISOString() })
          toast.success(L('Comercio desactivado', 'Shop deactivated'))
        }}
      />
    </div>
  )
}

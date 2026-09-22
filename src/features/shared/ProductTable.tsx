import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Ban, Check, CheckCircle2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { Comercio, Producto } from '@/domain/types'
import { useData, useDispatch } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { Table, Td, Th, ExpiryCountdown, ProductImage, ProductStatusBadge, Pager, usePaged, Badge } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { catKey } from '@/i18n/enums'
import { formatMoney } from '@/domain/money'
import { applyDiscount } from '@/domain/money'
import { effectiveEstado, vencMs } from '@/domain/selectors'
import { HOUR } from '@/domain/dates'
import { MAX_DISCOUNT_PCT } from '@/config/brand'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { buildSaleTx, COUNTER_CLIENT } from '@/domain/sales'
import { ratesFrom } from '@/domain/fx'
import { cn } from '@/lib/utils'

type Mode = 'merchant' | 'admin' | 'readonly'
type EditField = 'precio' | 'descuento' | 'vencimiento'

const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export function ProductTable({
  items, now, mode, comercios, pageSize = 10, highlightId,
}: {
  items: Producto[]
  now: number
  mode: Mode
  comercios?: Map<string, Comercio>
  pageSize?: number
  highlightId?: string | null
}) {
  const { t, L, b, lang } = useT()
  const dispatch = useDispatch()
  const d = useData()
  const paged = usePaged(items, pageSize)
  const [edit, setEdit] = useState<{ id: string; field: EditField; value: string } | null>(null)
  const [sellP, setSellP] = useState<Producto | null>(null)
  const [bajaP, setBajaP] = useState<Producto | null>(null)
  const [justSold, setJustSold] = useState<Set<string>>(new Set())
  const rates = useMemo(() => ratesFrom(d.tasas), [d.tasas])

  const commit = useCallback(() => {
    if (!edit) return
    const p = items.find((x) => x.id === edit.id)
    if (!p) return setEdit(null)
    if (edit.field === 'descuento') {
      const pct = Math.round(Number(edit.value))
      if (!Number.isFinite(pct) || pct < 1 || pct > MAX_DISCOUNT_PCT) {
        toast.error(L('El descuento debe estar entre 1% y {m}%', 'Discount must be between 1% and {m}%', { m: MAX_DISCOUNT_PCT }))
        return
      }
      dispatch({ type: 'update', id: p.id, patch: { descuentoPct: pct, precioFinalCents: applyDiscount(p.precioOriginalCents, pct) } })
    } else if (edit.field === 'precio') {
      const v = Math.round(Number(edit.value.replace(',', '.')) * 100)
      if (!Number.isFinite(v) || v <= 0) {
        toast.error(L('Ingresá un precio válido', 'Enter a valid price'))
        return
      }
      dispatch({ type: 'update', id: p.id, patch: { precioOriginalCents: v, precioFinalCents: applyDiscount(v, p.descuentoPct) } })
    } else {
      const ts = new Date(edit.value).getTime()
      if (!Number.isFinite(ts) || ts <= Date.now()) {
        toast.error(L('La fecha de vencimiento debe ser futura', 'Expiry date must be in the future'))
        return
      }
      dispatch({ type: 'update', id: p.id, patch: { vencimiento: new Date(ts).toISOString() } })
    }
    toast.success(L('Actualizado · ya se ve en Soe', 'Updated · already live on Soe'))
    setEdit(null)
  }, [L, dispatch, edit, items])

  const canEdit = (p: Producto) => mode === 'merchant' && effectiveEstado(p, now) === 'activo' && !p.dadoDeBaja

  const cell = (p: Producto, field: EditField, display: React.ReactNode, initial: string, type: 'number' | 'datetime-local' = 'number') => {
    if (edit && edit.id === p.id && edit.field === field) {
      return (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            type={type}
            className={cn('input h-8 px-2 text-xs', type === 'number' ? 'w-24 text-right' : 'w-[170px]')}
            value={edit.value}
            min={field === 'descuento' ? 1 : undefined}
            max={field === 'descuento' ? MAX_DISCOUNT_PCT : undefined}
            onChange={(e) => setEdit({ ...edit, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setEdit(null)
            }}
          />
          <Button size="iconSm" variant="soft" onClick={commit} aria-label={t('common.save')}>
            <Check />
          </Button>
        </div>
      )
    }
    if (!canEdit(p)) return display
    return (
      <button
        type="button"
        onClick={() => setEdit({ id: p.id, field, value: initial })}
        className="group inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition hover:bg-acento-soft"
        title={L('Editar', 'Edit')}
      >
        {display}
        <Pencil className="h-3 w-3 text-muted opacity-0 transition group-hover:opacity-100" />
      </button>
    )
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>{t('common.product')}</Th>
            {comercios && <Th>{t('common.shop')}</Th>}
            <Th>{t('common.category')}</Th>
            <Th align="right">{L('Precio original', 'Original price')}</Th>
            <Th align="right">{L('Desc.', 'Disc.')}</Th>
            <Th align="right">{L('Precio final', 'Final price')}</Th>
            <Th>{L('Vencimiento', 'Expiry')}</Th>
            <Th>{t('common.status')}</Th>
            {mode !== 'readonly' && <Th align="right">{t('common.actions')}</Th>}
          </tr>
        </thead>
        <tbody>
          {paged.rows.map((p) => {
            const est = effectiveEstado(p, now)
            const urgent = est === 'activo' && vencMs(p) - now < 6 * HOUR
            const sold = justSold.has(p.id)
            return (
              <motion.tr
                key={p.id}
                layout="position"
                initial={p.id === highlightId ? { backgroundColor: 'rgba(245,113,26,.18)' } : false}
                animate={{ backgroundColor: 'rgba(0,0,0,0)' }}
                transition={{ duration: 2.2 }}
                data-trailer={p.id === highlightId ? 'producto-en-mapa' : undefined}
                className="transition hover:bg-bg-2/70"
              >
                <Td>
                  <div className="flex min-w-[210px] items-center gap-3">
                    <ProductImage foto={p.fotos[0]} categoria={p.categoria} size="sm" className="h-10 w-10 shrink-0 rounded-xl" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{b(p.nombre)}</div>
                      <div className="num text-[11px] text-muted">{p.codigo}</div>
                    </div>
                  </div>
                </Td>
                {comercios && <Td className="whitespace-nowrap text-text-2">{comercios.get(p.comercioId)?.nombre}</Td>}
                <Td>
                  <Badge tone="neutral">{t(catKey(p.categoria))}</Badge>
                </Td>
                <Td align="right" className="whitespace-nowrap">
                  {cell(p, 'precio', <span className="num text-text-2 line-through decoration-muted">{formatMoney(p.precioOriginalCents, p.moneda, lang)}</span>, (p.precioOriginalCents / 100).toFixed(2))}
                </Td>
                <Td align="right">
                  {cell(p, 'descuento', <span className="num font-semibold text-ok">-{p.descuentoPct}%</span>, String(p.descuentoPct))}
                </Td>
                <Td align="right" className="num whitespace-nowrap font-bold text-acento">{formatMoney(p.precioFinalCents, p.moneda, lang)}</Td>
                <Td>
                  {est === 'activo' && !p.dadoDeBaja
                    ? cell(p, 'vencimiento', <ExpiryCountdown vencimiento={p.vencimiento} now={now} />, toLocalInput(p.vencimiento), 'datetime-local')
                    : <span className="text-xs text-text-2">{new Date(p.vencimiento).toLocaleDateString(lang === 'es' ? 'es-VE' : 'en-US', { day: 'numeric', month: 'short' })}</span>}
                </Td>
                <Td>
                  {sold ? (
                    <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }} className="inline-flex items-center gap-1 text-xs font-bold text-ok">
                      <CheckCircle2 className="h-4 w-4" /> {t('estado.vendido')}
                    </motion.span>
                  ) : (
                    <ProductStatusBadge estado={est} urgent={urgent} baja={p.dadoDeBaja} />
                  )}
                </Td>
                {mode !== 'readonly' && (
                  <Td align="right">
                    {est === 'activo' && !p.dadoDeBaja ? (
                      <div className="flex justify-end gap-1">
                        {mode === 'merchant' && (
                          <>
                            <Button size="iconSm" variant="ghost" title={L('Editar', 'Edit')} onClick={() => setEdit({ id: p.id, field: 'descuento', value: String(p.descuentoPct) })}>
                              <Pencil />
                            </Button>
                            <Button size="sm" variant="soft" className="text-ok" onClick={() => setSellP(p)}>
                              <CheckCircle2 /> <span className="hidden xl:inline">{L('Vendido', 'Sold')}</span>
                            </Button>
                          </>
                        )}
                        <Button size="iconSm" variant="ghost" title={L('Dar de baja', 'Remove')} onClick={() => setBajaP(p)}>
                          <Ban className="text-danger" />
                        </Button>
                      </div>
                    ) : p.bajaMotivo ? (
                      <span className="text-[11px] text-muted" title={p.bajaMotivo}>
                        {L('Motivo', 'Reason')}: {p.bajaMotivo.slice(0, 22)}
                        {p.bajaMotivo.length > 22 ? '…' : ''}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Td>
                )}
              </motion.tr>
            )
          })}
        </tbody>
      </Table>
      <Pager page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} />

      <ConfirmDialog
        open={!!sellP}
        onOpenChange={(v) => !v && setSellP(null)}
        title={L('¿Marcar como vendido?', 'Mark as sold?')}
        description={sellP ? L('"{n}" sale del feed de los clientes y suma a tus ventas y a los kilos salvados.', '"{n}" leaves the customer feed and adds to your sales and kilos saved.', { n: b(sellP.nombre) }) : ''}
        confirmLabel={L('Sí, se vendió', 'Yes, it sold')}
        tone="ok"
        onConfirm={() => {
          if (!sellP) return
          const tx = buildSaleTx(sellP, COUNTER_CLIENT, 'pago_movil', 'VES', rates)
          dispatch({ type: 'sell', productoId: sellP.id, tx })
          setJustSold((s) => new Set(s).add(sellP.id))
          toast.success(L('¡Vendido! No se perdió 🎉', 'Sold! Nothing wasted 🎉'))
        }}
      />
      <ConfirmDialog
        open={!!bajaP}
        onOpenChange={(v) => !v && setBajaP(null)}
        title={mode === 'admin' ? L('Dar de baja por incumplimiento', 'Remove for policy violation') : L('¿Dar de baja este producto?', 'Remove this product?')}
        description={bajaP ? b(bajaP.nombre) : ''}
        confirmLabel={L('Dar de baja', 'Remove')}
        tone="danger"
        requireText={mode === 'admin' ? L('Motivo (se notifica al comercio)', 'Reason (the shop is notified)') : undefined}
        onConfirm={(motivo) => {
          if (!bajaP) return
          dispatch({ type: 'baja', id: bajaP.id, motivo: motivo || L('Retirado por el comercio', 'Withdrawn by the shop') })
          toast.success(L('Producto dado de baja', 'Product removed'))
        }}
      />
    </>
  )
}

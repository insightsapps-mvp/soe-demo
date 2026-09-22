import { CheckCircle2, CircleDot, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Transaccion } from '@/domain/types'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useData, useDispatch } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { TxStatusBadge } from '@/components/shared/all'
import { formatMoney, formatNumber } from '@/domain/money'
import { metodoKey } from '@/i18n/enums'
import { fmtDateTime } from '@/domain/dates'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MethodLogo } from './MethodLogo'

export function TxDetail({ tx, onClose, admin }: { tx: Transaccion | null; onClose: () => void; admin?: boolean }) {
  const { t, L, b, lang } = useT()
  const d = useData()
  const dispatch = useDispatch()
  const live = tx ? d.transacciones.find((x) => x.id === tx.id) ?? tx : null
  const prod = live ? d.productos.find((p) => p.id === live.productoId) : null
  const com = live ? d.comercios.find((c) => c.id === live.comercioId) : null
  const icon = (paso: string) =>
    paso === 'confirmado' ? <CheckCircle2 className="h-4 w-4 text-ok" /> : paso === 'fallido' ? <XCircle className="h-4 w-4 text-danger" /> : paso === 'reintento' ? <RefreshCw className="h-4 w-4 text-[rgb(var(--warning))]" /> : paso === 'validado' ? <ShieldCheck className="h-4 w-4 text-acento" /> : <CircleDot className="h-4 w-4 text-text-2" />
  return (
    <Dialog open={!!live} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        {live && (
          <>
            <div className="flex items-center gap-3 pr-8">
              <MethodLogo m={live.metodo} />
              <div className="min-w-0">
                <DialogTitle className="num">{live.id}</DialogTitle>
                <DialogDescription>{fmtDateTime(live.fecha, lang)}</DialogDescription>
              </div>
              <div className="ml-auto">
                <TxStatusBadge estado={live.estado} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-border bg-bg-2 p-4 text-sm">
              <div>
                <div className="label-xs">{t('common.product')}</div>
                <div className="mt-1 font-semibold">{prod ? b(prod.nombre) : '—'}</div>
                <div className="text-xs text-text-2">{com?.nombre}</div>
              </div>
              <div>
                <div className="label-xs">{t('common.customer')}</div>
                <div className="mt-1 font-semibold">{live.clienteNombre === 'Venta en tienda' ? L('Venta en tienda', 'In-store sale') : live.clienteNombre}</div>
              </div>
              <div>
                <div className="label-xs">{t('common.amount')}</div>
                <div className="num mt-1 text-lg font-bold text-acento">{formatMoney(live.montoCents, live.moneda, lang)}</div>
                <div className="num text-xs text-text-2">≈ {formatMoney(live.montoUsdCents, 'USD', lang)}</div>
              </div>
              <div>
                <div className="label-xs">{L('Tipo de cambio aplicado', 'Exchange rate applied')}</div>
                <div className="num mt-1 font-semibold">
                  {live.moneda === 'USD' ? '1 USD = 1 USD' : live.moneda === 'VES' ? `1 USD = Bs. ${formatNumber(live.tasaCambioAplicada, lang, 2)}` : `1 USD = ${formatNumber(live.tasaCambioAplicada, lang, 4)} USDT`}
                </div>
                <div className="text-xs text-text-2">
                  {t(metodoKey(live.metodo))} · {L('comisión', 'fee')} {formatMoney(live.comisionUsdCents, 'USD', lang, { decimals: true })}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="label-xs mb-3">{L('Log de webhook · auditoría', 'Webhook log · audit trail')}</div>
              <ol className="relative grid gap-3 border-l border-border pl-5">
                {live.webhook.map((w, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[29px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-card">{icon(w.paso)}</span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={cn('text-xs font-bold uppercase tracking-wider', w.paso === 'fallido' ? 'text-danger' : w.paso === 'reintento' ? 'text-[rgb(var(--warning))]' : w.paso === 'confirmado' ? 'text-ok' : 'text-text')}>
                        {{ recibido: L('Recibido', 'Received'), validado: L('Validado', 'Validated'), confirmado: L('Confirmado', 'Confirmed'), reintento: L('Reintento', 'Retry'), fallido: L('Fallido', 'Failed') }[w.paso]}
                      </span>
                      <span className="num text-[11px] text-muted">{new Date(w.fecha).toLocaleTimeString(lang === 'es' ? 'es-VE' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <div className="text-xs text-text-2">{b(w.detalle)}</div>
                  </li>
                ))}
              </ol>
            </div>
            {admin && live.estado !== 'aprobado' && (
              <div className="mt-5 flex justify-end">
                <Button
                  onClick={() => {
                    dispatch({ type: 'retryTx', txId: live.id, at: new Date().toISOString() })
                    toast.success(L('Webhook reenviado · verificando pago…', 'Webhook resent · verifying payment…'))
                  }}
                >
                  <RefreshCw /> {L('Reintentar webhook', 'Retry webhook')}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

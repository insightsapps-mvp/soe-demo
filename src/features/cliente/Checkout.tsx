import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { MetodoPago, Moneda, Producto } from '@/domain/types'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useData, useDispatch } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { convert, rateApplied, ratesFrom, toUsdCents } from '@/domain/fx'
import { formatMoney, formatNumber } from '@/domain/money'
import { METODO_FEE_BPS, METODO_MONEDA, HERO_CLIENT_ID } from '@/data/seed'
import { METODOS } from '@/domain/selectors'
import { metodoKey } from '@/i18n/enums'
import { MethodLogo } from '@/features/shared/MethodLogo'
import { Segmented } from '@/components/ui/form'
import { buildSaleTx } from '@/domain/sales'
import { cn } from '@/lib/utils'

export function Checkout({ p, open, onOpenChange }: { p: Producto; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, L, b, lang } = useT()
  const d = useData()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const rates = useMemo(() => ratesFrom(d.tasas), [d.tasas])
  const [metodo, setMetodo] = useState<MetodoPago>('pago_movil')
  const [moneda, setMoneda] = useState<Moneda>('VES')
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form')
  const [ahorroUsd, setAhorroUsd] = useState(0)
  const me = d.clientes.find((c) => c.id === HERO_CLIENT_ID)!
  const monto = convert(p.precioFinalCents, p.moneda, moneda, rates)
  const fee = Math.round((toUsdCents(p.precioFinalCents, p.moneda, rates) * METODO_FEE_BPS[metodo]) / 10000)

  const pickMetodo = (m: MetodoPago) => {
    setMetodo(m)
    setMoneda(METODO_MONEDA[m])
  }
  const allowed: Record<MetodoPago, Moneda[]> = { pago_movil: ['VES'], zelle: ['USD'], binance: ['USDT', 'USD'] }

  const confirm = () => {
    setStep('processing')
    setTimeout(() => {
      const tx = buildSaleTx(p, me, metodo, moneda, rates)
      dispatch({ type: 'sell', productoId: p.id, tx })
      setAhorroUsd(tx.ahorroUsdCents)
      setStep('done')
      toast.success(L('¡Compra confirmada! Ahorraste {a}', 'Purchase confirmed! You saved {a}', { a: formatMoney(tx.ahorroUsdCents, 'USD', lang) }))
    }, 1400)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (step === 'processing') return
        onOpenChange(v)
        if (!v) setTimeout(() => setStep('form'), 300)
      }}
    >
      <DialogContent className="max-w-lg" onInteractOutside={(e) => step === 'processing' && e.preventDefault()}>
        {step === 'done' ? (
          <div className="py-4 text-center">
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok text-white shadow-lg">
              <CheckCircle2 className="h-9 w-9" />
            </motion.div>
            <DialogTitle className="mt-4 text-xl">{L('¡Compra confirmada!', 'Purchase confirmed!')}</DialogTitle>
            <DialogDescription className="mx-auto max-w-sm">
              {L('Ahorraste {a}. Retiralo en {c} mostrando este código.', 'You saved {a}. Pick it up at {c} showing this code.', { a: formatMoney(ahorroUsd, 'USD', lang), c: d.comercios.find((c) => c.id === p.comercioId)?.nombre ?? '' })}
            </DialogDescription>
            <div className="num mx-auto mt-4 w-fit rounded-xl border border-dashed border-acento/50 bg-acento-soft px-5 py-2.5 text-lg font-bold tracking-[0.3em] text-acento">{p.id.slice(-6).toUpperCase().padStart(6, '0')}</div>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="secondary" onClick={() => { onOpenChange(false); navigate('/explorar') }}>
                {L('Seguir explorando', 'Keep exploring')}
              </Button>
              <Button onClick={() => { onOpenChange(false); navigate('/mis-compras') }}>{L('Ver mis compras', 'See my purchases')}</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogTitle>{L('Checkout', 'Checkout')}</DialogTitle>
            <DialogDescription>{b(p.nombre)}</DialogDescription>
            <div className="mt-5">
              <div className="label-xs mb-2">{L('Método de pago', 'Payment method')}</div>
              <div className="grid gap-2">
                {METODOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => pickMetodo(m)}
                    className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition', metodo === m ? 'border-acento bg-acento-soft ring-2 ring-acento/15' : 'border-border hover:border-border-strong')}
                  >
                    <MethodLogo m={m} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{t(metodoKey(m))}</div>
                      <div className="text-xs text-text-2">
                        {m === 'pago_movil' ? L('Bolívares · al instante', 'Bolívares · instant') : m === 'zelle' ? L('Dólares · desde tu banco en EE. UU.', 'Dollars · from your US bank') : L('USDT o USD · Binance Pay', 'USDT or USD · Binance Pay')}
                      </div>
                    </div>
                    <span className="num text-[11px] font-semibold text-text-2">
                      {L('comisión', 'fee')} {formatNumber(METODO_FEE_BPS[m] / 100, lang, 1)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="label-xs">{t('common.currency')}</div>
              <Segmented
                value={moneda}
                onChange={setMoneda}
                options={(['VES', 'USD', 'USDT'] as Moneda[]).filter((m) => allowed[metodo].includes(m)).map((m) => ({ value: m, label: m }))}
              />
            </div>
            <div className="mt-4 rounded-xl bg-bg-2 p-4 text-sm">
              <div className="flex justify-between text-text-2">
                <span>{L('Precio original', 'Original price')}</span>
                <span className="num line-through">{formatMoney(convert(p.precioOriginalCents, p.moneda, moneda, rates), moneda, lang)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-ok">
                <span>{L('Descuento', 'Discount')} -{p.descuentoPct}%</span>
                <span className="num font-semibold">-{formatMoney(convert(p.precioOriginalCents - p.precioFinalCents, p.moneda, moneda, rates), moneda, lang)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-text-2">
                <span>{L('Comisión del método', 'Method fee')}</span>
                <span className="num">{fee ? formatMoney(convert(fee, 'USD', moneda, rates), moneda, lang) : L('Sin costo', 'Free')}</span>
              </div>
              <div className="my-3 h-px bg-border" />
              <div className="flex items-end justify-between">
                <span className="font-bold">{L('Total a pagar', 'Total to pay')}</span>
                <motion.span key={moneda + metodo} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }} className="num text-2xl font-bold text-acento">
                  {formatMoney(monto, moneda, lang, { decimals: true })}
                </motion.span>
              </div>
              <div className="num mt-1 text-right text-[11px] text-text-2">
                {moneda === 'VES' ? `1 USD = Bs. ${formatNumber(rateApplied('VES', rates), lang, 2)} · BCV` : moneda === 'USDT' ? `1 USD = ${formatNumber(rates.USD_USDT, lang, 4)} USDT` : L('Cobro directo en dólares', 'Charged directly in dollars')}
              </div>
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={confirm} disabled={step === 'processing'} data-trailer="confirmar-pago">
              {step === 'processing' ? (
                <>
                  <Loader2 className="animate-spin" /> {L('Procesando pago…', 'Processing payment…')}
                </>
              ) : (
                <>
                  <Lock /> {L('Pagar {m}', 'Pay {m}', { m: formatMoney(monto, moneda, lang) })}
                </>
              )}
            </Button>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-text-2">
              <ShieldCheck className="h-3.5 w-3.5 text-ok" /> {L('Pago verificado por webhook firmado · demo', 'Payment verified by signed webhook · demo')}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Eye, EyeOff, LifeBuoy, ShieldCheck, Timer } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { formatMoney } from '@/domain/money'

const TOTAL_USD_CENTS = 900_000
const PREPAY_DISCOUNT_PCT = 15

/** Oculto por defecto; el estado NO persiste (cada recarga arranca oculto) */
export function InvestmentBlock() {
  const { L, lang } = useT()
  const [open, setOpen] = useState(false)
  const half = TOTAL_USD_CENTS / 2
  const prepay = Math.round((TOTAL_USD_CENTS * (100 - PREPAY_DISCOUNT_PCT)) / 100)
  const usd = (c: number) => `${formatMoney(c, 'USD', lang, { decimals: false })} USD`

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[64px] w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-bg-2 sm:px-6"
      >
        <span className="num text-2xl font-bold tracking-[0.2em] text-text-2">{open ? usd(TOTAL_USD_CENTS) : '••••••'}</span>
        <span className="ml-auto inline-flex h-11 items-center gap-2 rounded-full border border-border bg-bg-2 px-4 text-sm font-semibold">
          {open ? <EyeOff className="h-4 w-4 text-acento" /> : <Eye className="h-4 w-4 text-acento" />}
          {open ? L('Ocultar inversión', 'Hide investment') : L('Ver inversión', 'View investment')}
        </span>
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
          <div className="grid gap-5 border-t border-border p-5 sm:p-6 lg:grid-cols-2">
            <div>
              <div className="label-xs">{L('Monto total', 'Total amount')}</div>
              <div className="num mt-1 text-[44px] font-bold leading-none tracking-tight">{usd(TOTAL_USD_CENTS)}</div>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between rounded-xl bg-bg-2 px-4 py-3 text-sm">
                  <span>{L('50% al firmar', '50% on signing')}</span>
                  <span className="num font-bold">{usd(half)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-bg-2 px-4 py-3 text-sm">
                  <span>{L('50% a los 30 días', '50% after 30 days')}</span>
                  <span className="num font-bold">{usd(half)}</span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border-2 border-acento bg-acento-soft p-4">
                <div className="text-sm font-bold text-acento">{L('Pagando el 100% por adelantado: 15% de descuento', 'Paying 100% upfront: 15% discount')}</div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="num text-[30px] font-bold text-text">{usd(prepay)}</span>
                  <span className="num text-sm text-text-2 line-through">{usd(TOTAL_USD_CENTS)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="label-xs mb-3">{L('Condiciones', 'Terms')}</div>
              <ul className="grid gap-2.5">
                {[
                  { icon: Timer, t: L('Entrega funcional del MVP en 21 días', 'Working MVP delivered in 21 days') },
                  { icon: CalendarCheck, t: L('Entrega final en 6-7 semanas', 'Final delivery in 6–7 weeks') },
                  { icon: LifeBuoy, t: L('1 mes de soporte correctivo incluido', '1 month of corrective support included') },
                  { icon: ShieldCheck, t: L('Garantía de devolución 100% si el primer prototipo no cumple lo acordado', '100% money-back guarantee if the first prototype doesn’t meet what was agreed') },
                ].map((c) => (
                  <li key={c.t} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ok-soft text-ok">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">{c.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

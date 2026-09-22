import type { Cents, Lang, Moneda } from './types'

/** Todos los importes viajan como enteros (centavos). Formateo solo al mostrar. */
export const toCents = (units: number): Cents => Math.round(units * 100)

export function applyDiscount(originalCents: Cents, pct: number): Cents {
  return Math.round((originalCents * (100 - pct)) / 100)
}

export function formatMoney(
  cents: Cents,
  moneda: Moneda,
  lang: Lang = 'es',
  opts: { compact?: boolean; decimals?: boolean } = {},
) {
  const v = cents / 100
  const locale = lang === 'es' ? 'es-VE' : 'en-US'
  const showDec = opts.decimals ?? (moneda === 'VES' ? Math.abs(v) < 100 : Math.abs(v) < 1000)
  let n: string
  if (opts.compact && Math.abs(v) >= 1_000_000) {
    n = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v / 1_000_000) + (lang === 'es' ? ' M' : 'M')
  } else {
    n = new Intl.NumberFormat(locale, {
      minimumFractionDigits: showDec ? 2 : 0,
      maximumFractionDigits: showDec ? 2 : 0,
    }).format(v)
  }
  if (moneda === 'USD') return `$${n}`
  if (moneda === 'USDT') return `${n} USDT`
  return `Bs. ${n}`
}

export function formatNumber(n: number, lang: Lang = 'es', maxDec = 0) {
  return new Intl.NumberFormat(lang === 'es' ? 'es-VE' : 'en-US', { maximumFractionDigits: maxDec }).format(n)
}

export function formatPct(n: number, lang: Lang = 'es', dec = 0) {
  return `${formatNumber(n, lang, dec)}%`
}

import type { Cents, Moneda, TasaCambio } from './types'

/** VES_USD = bolívares por 1 USD · USD_USDT = USDT por 1 USD */
export interface FxRates {
  VES_USD: number
  USD_USDT: number
}

export function ratesFrom(tasas: TasaCambio[]): FxRates {
  const r: FxRates = { VES_USD: 146.35, USD_USDT: 1 }
  for (const t of tasas) r[t.par] = t.valor
  return r
}

export function toUsdCents(cents: Cents, from: Moneda, r: FxRates): Cents {
  if (from === 'USD') return cents
  if (from === 'VES') return Math.round(cents / r.VES_USD)
  return Math.round(cents / r.USD_USDT)
}

export function fromUsdCents(usd: Cents, to: Moneda, r: FxRates): Cents {
  if (to === 'USD') return usd
  if (to === 'VES') return Math.round(usd * r.VES_USD)
  return Math.round(usd * r.USD_USDT)
}

export function convert(cents: Cents, from: Moneda, to: Moneda, r: FxRates): Cents {
  if (from === to) return cents
  return fromUsdCents(toUsdCents(cents, from, r), to, r)
}

export function rateApplied(to: Moneda, r: FxRates): number {
  return to === 'VES' ? r.VES_USD : to === 'USDT' ? r.USD_USDT : 1
}

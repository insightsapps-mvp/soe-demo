import type { MetodoPago } from '@/domain/types'
import { cn } from '@/lib/utils'

/** Marca genérica por método (no son logos oficiales) */
export function MethodLogo({ m, className, size = 'md' }: { m: MetodoPago; className?: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-10 w-10 text-xs'
  const map: Record<MetodoPago, { bg: string; fg: string; label: string }> = {
    binance: { bg: '#F3BA2F', fg: '#1E2026', label: 'B' },
    zelle: { bg: '#6D1ED4', fg: '#fff', label: 'Z' },
    pago_movil: { bg: '#0F7B6C', fg: '#fff', label: 'PM' },
  }
  const v = map[m]
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-xl font-extrabold shadow-sm', s, className)} style={{ background: v.bg, color: v.fg }}>
      {v.label}
    </div>
  )
}

export const METHOD_COLOR: Record<MetodoPago, string> = { pago_movil: '#0F7B6C', binance: '#F3BA2F', zelle: '#6D1ED4' }

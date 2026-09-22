import * as React from 'react'
import { Info, Wrench, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { formatMoney } from '@/domain/money'
import type { Categoria, Cents, EstadoProducto, EstadoTransaccion, Moneda } from '@/domain/types'
import { Badge, type BadgeTone } from '@/components/ui/misc'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays'
import { catKey, estadoKey, txKey } from '@/i18n/enums'
import { CAT_GRADIENT } from '@/data/productos'
import { HOUR, remainingShort } from '@/domain/dates'

// ─── Money ────────────────────────────────────────────────
export function Money({ cents, moneda, className, compact, decimals }: { cents: Cents; moneda: Moneda; className?: string; compact?: boolean; decimals?: boolean }) {
  const { lang } = useT()
  return <span className={cn('num', className)}>{formatMoney(cents, moneda, lang, { compact, decimals })}</span>
}

// ─── Kicker + PageHeader ─────────────────────────────────
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('kicker', className)}>{children}</div>
}

export function PageHeader({ kicker, title, subtitle, actions }: { kicker?: string; title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {kicker && <Kicker className="mb-2">{kicker}</Kicker>}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-text-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── KpiCard ─────────────────────────────────────────────
type Tone = 'acento' | 'navy' | 'ok' | 'danger' | 'warning' | 'neutral'
const toneText: Record<Tone, string> = {
  acento: 'text-acento', navy: 'text-text', ok: 'text-ok', danger: 'text-danger', warning: 'text-[rgb(var(--warning))]', neutral: 'text-text',
}
export function KpiCard({
  label, value, tone = 'neutral', delta, icon, hint, highlight, className, onClick, ...rest
}: {
  label: string
  value: React.ReactNode
  tone?: Tone
  delta?: { value: string; up: boolean; good?: boolean }
  icon?: React.ReactNode
  hint?: React.ReactNode
  highlight?: boolean
  className?: string
  onClick?: () => void
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'card relative overflow-hidden p-4 transition sm:p-5',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-pop',
        highlight && 'border-acento/40 bg-gradient-to-br from-acento-soft to-card',
        className,
      )}
      {...rest}
    >
      {highlight && <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-acento/15 blur-2xl" />}
      <div className="flex items-start justify-between gap-2">
        <div className="label-xs leading-snug">{label}</div>
        {icon && <div className={cn('shrink-0 [&_svg]:h-4 [&_svg]:w-4', toneText[tone], tone === 'navy' && 'text-text-2')}>{icon}</div>}
      </div>
      <div className={cn('num mt-2 text-[26px] font-bold leading-none tracking-tight sm:text-[30px]', toneText[tone])}>{value}</div>
      {(delta || hint) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-text-2">
          {delta && (
            <span
              className={cn(
                'num inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                (delta.good ?? delta.up) ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger',
              )}
            >
              
              {delta.up ? '▲' : '▼'} {delta.value}
            </span>
          )}
          {hint}
        </div>
      )}
    </div>
  )
}

// ─── Status badges ───────────────────────────────────────
export function ProductStatusBadge({ estado, urgent, baja }: { estado: EstadoProducto; urgent?: boolean; baja?: boolean }) {
  const { t } = useT()
  if (baja) return <Badge tone="neutral">{t('estado.baja')}</Badge>
  if (estado === 'activo' && urgent) return <Badge tone="warning" pulse>{t('estado.porVencer')}</Badge>
  const tone: Record<EstadoProducto, BadgeTone> = { activo: 'acento', vendido: 'ok', vencido: 'danger' }
  return <Badge tone={tone[estado]}>{t(estadoKey(estado))}</Badge>
}

export function TxStatusBadge({ estado }: { estado: EstadoTransaccion }) {
  const { t } = useT()
  const tone: Record<EstadoTransaccion, BadgeTone> = { aprobado: 'ok', pendiente: 'warning', rechazado: 'danger' }
  return <Badge tone={tone[estado]} pulse={estado === 'pendiente'}>{t(txKey(estado))}</Badge>
}

export function CategoryBadge({ c }: { c: Categoria }) {
  const { t } = useT()
  return <Badge tone="neutral">{t(catKey(c))}</Badge>
}

// ─── ExpiryCountdown ─────────────────────────────────────
export function ExpiryCountdown({ vencimiento, now, compact, className }: { vencimiento: string; now: number; compact?: boolean; className?: string }) {
  const { t, lang } = useT()
  const ms = new Date(vencimiento).getTime() - now
  const expired = ms <= 0
  const danger = ms < HOUR
  const warn = ms < 6 * HOUR
  const tone = expired || danger ? 'text-danger' : warn ? 'text-[rgb(var(--warning))]' : ms < 24 * HOUR ? 'text-text' : 'text-text-2'
  const bar = expired || danger ? 'bg-danger' : warn ? 'bg-warning' : 'bg-acento'
  const pct = expired ? 100 : Math.max(4, 100 - (ms / (48 * HOUR)) * 100)
  return (
    <div className={cn('min-w-[92px]', className)}>
      <div className={cn('flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold', tone)}>
        {(danger || (warn && !expired)) && <span className={cn('h-1.5 w-1.5 rounded-full', danger ? 'animate-pulsedot bg-danger' : 'animate-pulsedot bg-warning')} />}
        {expired ? t('exp.expired') : (
          <span>
            {!compact && <span className="font-medium">{t('exp.in')} </span>}
            <span className="num">{remainingShort(ms, lang)}</span>
          </span>
        )}
      </div>
      {!compact && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
          <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}

// ─── ProductImage (foto ilustrada o subida) ─────────────
export function ProductImage({ foto, categoria, className, size = 'md' }: { foto?: string; categoria: Categoria; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const isImg = foto && (foto.startsWith('data:') || foto.startsWith('http') || foto.startsWith('/'))
  const [a, b] = CAT_GRADIENT[categoria]
  if (isImg) return <img src={foto} alt="" className={cn('object-cover', className)} />
  const fs = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-7xl' : 'text-4xl'
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden', className)} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,.9), transparent 55%)' }} />
      <span className={cn('relative drop-shadow-sm', fs)} aria-hidden>{foto || '🛍️'}</span>
    </div>
  )
}

// ─── InfoDot ("En desarrollo") ──────────────────────────
export function InfoDot({ text, className }: { text: string; className?: string }) {
  const { t } = useT()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={t('common.inDev')} className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full text-text-2 transition hover:bg-bg-2 hover:text-acento', className)}>
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--warning))]">
          <Wrench className="h-3 w-3" /> {t('common.inDev')}
        </div>
        <p className="text-xs text-text-2">{text}</p>
      </PopoverContent>
    </Popover>
  )
}

// ─── PreviewBanner ──────────────────────────────────────
export function PreviewBanner({ bullets }: { bullets: string[] }) {
  const { t } = useT()
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 overflow-hidden rounded-2xl border border-acento/20 bg-gradient-to-r from-acento-soft via-card to-card p-4 no-print"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-acento px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-white" /> {t('banner.pill1')}
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold tracking-wider text-text-2">{t('banner.pill2')}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold">{t('banner.title')}</div>
          <ul className="mt-1.5 grid gap-x-5 gap-y-1 text-xs text-text-2 sm:grid-cols-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-1.5">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-acento" /> <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

// ─── DevNotice ──────────────────────────────────────────
export function DevNotice({ feature, now, later }: { feature: string; now: string; later: string }) {
  const { t } = useT()
  return (
    <div className="mb-5 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft p-3.5 text-xs no-print">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-[rgb(var(--warning))]">
        <Wrench className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="font-bold text-text">
          {feature} · <span className="text-[rgb(var(--warning))]">{t('devnotice.suffix')}</span>
        </div>
        <div className="mt-0.5 text-text-2">
          <b className="font-semibold text-text">{t('devnotice.now')}:</b> {now} <span className="mx-1 text-muted">·</span>
          <b className="font-semibold text-text">{t('devnotice.later')}:</b> {later}
        </div>
      </div>
    </div>
  )
}

// ─── EmptyState ─────────────────────────────────────────
export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-acento/15 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-acento shadow-card [&_svg]:h-7 [&_svg]:w-7">{icon}</div>
      </div>
      <div className="text-[15px] font-bold">{title}</div>
      {text && <p className="mt-1 max-w-sm text-sm text-text-2">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Table helpers ──────────────────────────────────────
const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' } as const
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('scrollbar-thin overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  )
}
export function Th({ children, className, align = 'left' }: { children?: React.ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <th className={cn('whitespace-nowrap border-b border-border bg-bg-2/60 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-text-2', ALIGN[align], className)}>
      {children}
    </th>
  )
}
export function Td({ children, className, align = 'left', ...p }: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <td className={cn('border-b border-border px-4 py-3 align-middle', ALIGN[align], className)} {...p}>
      {children}
    </td>
  )
}

export function Pager({ page, pages, onPage, total }: { page: number; pages: number; onPage: (p: number) => void; total: number }) {
  const { L } = useT()
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-text-2">
      <span className="num">{L('{n} resultados', '{n} results', { n: total })}</span>
      <div className="flex items-center gap-1">
        <button className="rounded-lg border border-border px-2.5 py-1 font-semibold transition hover:bg-bg-2 disabled:opacity-40" disabled={page <= 0} onClick={() => onPage(page - 1)}>
          ←
        </button>
        <span className="num px-2">
          {page + 1} / {pages}
        </span>
        <button className="rounded-lg border border-border px-2.5 py-1 font-semibold transition hover:bg-bg-2 disabled:opacity-40" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          →
        </button>
      </div>
    </div>
  )
}

export function usePaged<T>(items: T[], size = 12) {
  const [page, setPage] = React.useState(0)
  const pages = Math.max(1, Math.ceil(items.length / size))
  const safe = Math.min(page, pages - 1)
  React.useEffect(() => {
    if (page !== safe) setPage(safe)
  }, [page, safe])
  return { rows: items.slice(safe * size, safe * size + size), page: safe, pages, setPage, total: items.length }
}

export function Avatar({ initials, className, tone = 'acento' }: { initials: string; className?: string; tone?: 'acento' | 'ok' | 'navy' | 'neutral' }) {
  const t = { acento: 'bg-acento text-white', ok: 'bg-ok text-white', navy: 'bg-text text-bg', neutral: 'bg-bg-2 text-text-2 border border-border' }[tone]
  return <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', t, className)}>{initials}</div>
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.04c0-5.21 4.24-9.45 9.46-9.45 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.69c0 5.21-4.24 9.45-9.47 9.45zm8.05-17.5A11.32 11.32 0 0 0 12.04.67C5.77.67.67 5.77.67 12.04c0 2 .52 3.96 1.52 5.68L.57 23.33l5.74-1.5a11.33 11.33 0 0 0 5.73 1.46h.01c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.89-3.33-8.04z" />
    </svg>
  )
}

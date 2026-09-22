import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...p} />
}

export function CardHeader({ title, subtitle, right, className }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold tracking-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-text-2">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

const badgeTones = {
  neutral: 'bg-bg-2 text-text-2 border-border',
  acento: 'bg-acento-soft text-acento border-acento/20',
  ok: 'bg-ok-soft text-ok border-ok/20',
  warning: 'bg-warning-soft text-[rgb(var(--warning))] border-warning/25',
  danger: 'bg-danger-soft text-danger border-danger/20',
  navy: 'bg-navy/10 text-navy border-navy/20',
  solidOk: 'bg-ok text-white border-ok',
  solidDanger: 'bg-danger text-white border-danger',
} as const
export type BadgeTone = keyof typeof badgeTones

export function Badge({ tone = 'neutral', className, pulse, ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; pulse?: boolean }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold', badgeTones[tone], className)}
      {...p}
    >
      {pulse && <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-current" />}
      {p.children}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-bg-2', className)} />
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border', className)} />
}

export function Progress({ value, className, tone = 'acento' }: { value: number; className?: string; tone?: 'acento' | 'ok' | 'warning' | 'danger' }) {
  const bg = { acento: 'bg-acento', ok: 'bg-ok', warning: 'bg-warning', danger: 'bg-danger' }[tone]
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-border', className)}>
      <div className={cn('h-full rounded-full transition-all', bg)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

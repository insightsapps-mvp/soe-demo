import * as React from 'react'
import * as S from '@radix-ui/react-select'
import * as Sw from '@radix-ui/react-switch'
import * as Sl from '@radix-ui/react-slider'
import * as Cb from '@radix-ui/react-checkbox'
import * as Tb from '@radix-ui/react-tabs'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Select
export function Select({
  value, onValueChange, options, className, placeholder, ariaLabel, size = 'md',
}: {
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
  placeholder?: string
  ariaLabel?: string
  size?: 'sm' | 'md'
}) {
  return (
    <S.Root value={value} onValueChange={onValueChange}>
      <S.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-[10px] border border-border bg-card px-3 text-sm text-text outline-none transition hover:border-border-strong focus:border-acento focus:ring-2 focus:ring-acento/20',
          size === 'sm' ? 'h-8 text-xs' : 'h-10',
          className,
        )}
      >
        <S.Value placeholder={placeholder} />
        <S.Icon>
          <ChevronDown className="h-4 w-4 text-text-2" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content position="popper" sideOffset={6} className="soe-pop z-[95] max-h-[320px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-pop">
          <S.Viewport>
            {options.map((o) => (
              <S.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none data-[highlighted]:bg-bg-2 data-[state=checked]:font-semibold"
              >
                <S.ItemIndicator className="absolute left-2.5">
                  <Check className="h-3.5 w-3.5 text-acento" />
                </S.ItemIndicator>
                <S.ItemText>{o.label}</S.ItemText>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  )
}

// Switch
export const Switch = React.forwardRef<React.ElementRef<typeof Sw.Root>, React.ComponentPropsWithoutRef<typeof Sw.Root>>(({ className, ...p }, ref) => (
  <Sw.Root
    ref={ref}
    className={cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-border-strong transition data-[state=checked]:bg-acento', className)}
    {...p}
  >
    <Sw.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-5" />
  </Sw.Root>
))
Switch.displayName = 'Switch'

// Slider
export const Slider = React.forwardRef<React.ElementRef<typeof Sl.Root>, React.ComponentPropsWithoutRef<typeof Sl.Root>>(({ className, ...p }, ref) => (
  <Sl.Root ref={ref} className={cn('relative flex h-5 w-full touch-none select-none items-center', className)} {...p}>
    <Sl.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-border">
      <Sl.Range className="absolute h-full bg-acento" />
    </Sl.Track>
    <Sl.Thumb aria-label="radio" className="block h-5 w-5 rounded-full border-2 border-acento bg-card shadow transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-acento/25" />
  </Sl.Root>
))
Slider.displayName = 'Slider'

// Checkbox
export const Checkbox = React.forwardRef<React.ElementRef<typeof Cb.Root>, React.ComponentPropsWithoutRef<typeof Cb.Root>>(({ className, ...p }, ref) => (
  <Cb.Root
    ref={ref}
    className={cn('peer h-4 w-4 shrink-0 rounded-[5px] border border-border-strong bg-card transition data-[state=checked]:border-acento data-[state=checked]:bg-acento', className)}
    {...p}
  >
    <Cb.Indicator className="flex items-center justify-center text-white">
      <Check className="h-3 w-3" strokeWidth={3} />
    </Cb.Indicator>
  </Cb.Root>
))
Checkbox.displayName = 'Checkbox'

// Tabs
export const Tabs = Tb.Root
export const TabsList = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof Tb.List>) => (
  <Tb.List className={cn('inline-flex items-center gap-1 rounded-xl border border-border bg-bg-2 p-1', className)} {...p} />
)
export const TabsTrigger = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof Tb.Trigger>) => (
  <Tb.Trigger
    className={cn(
      'rounded-lg px-3 py-1.5 text-xs font-semibold text-text-2 transition data-[state=active]:bg-card data-[state=active]:text-text data-[state=active]:shadow-sm',
      className,
    )}
    {...p}
  />
)
export const TabsContent = Tb.Content

// Segmented control
export function Segmented<T extends string>({
  value, onChange, options, className, size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode; title?: string }[]
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-[10px] border border-border bg-bg-2 p-0.5', className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-[8px] font-semibold transition',
            size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
            value === o.value ? 'bg-card text-text shadow-sm' : 'text-text-2 hover:text-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string | null; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold text-text">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-text-2">{hint}</span> : null}
    </label>
  )
}

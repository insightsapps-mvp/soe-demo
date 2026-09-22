import { useEffect, useState } from 'react'
import { usePrefs } from '@/store/usePrefs'

export interface ChartColors {
  acento: string
  acentoSoft: string
  ok: string
  warning: string
  danger: string
  text: string
  text2: string
  muted: string
  border: string
  card: string
  navy: string
}

const read = (): ChartColors => {
  const cs = getComputedStyle(document.documentElement)
  const v = (n: string) => `rgb(${cs.getPropertyValue(`--${n}`).trim().split(/\s+/).join(',')})`
  return {
    acento: v('acento'), acentoSoft: v('acento-soft'), ok: v('ok'), warning: v('warning'), danger: v('danger'),
    text: v('text'), text2: v('text-2'), muted: v('muted'), border: v('border'), card: v('card'), navy: v('navy'),
  }
}

/** Colores de tokens resueltos (Recharts necesita valores concretos) */
export function useChartColors() {
  const theme = usePrefs((s) => s.theme)
  const [c, setC] = useState<ChartColors>(read)
  useEffect(() => {
    const id = requestAnimationFrame(() => setC(read()))
    return () => cancelAnimationFrame(id)
  }, [theme])
  return c
}

export const axisProps = (c: ChartColors) => ({
  stroke: c.muted,
  tick: { fill: c.text2, fontSize: 11 },
  tickLine: false,
  axisLine: false,
})

export function ChartTooltip({ active, payload, label, fmt, labelFmt }: {
  active?: boolean
  payload?: { value: number; name?: string; color?: string; dataKey?: string }[]
  label?: string | number
  fmt?: (v: number, key?: string) => string
  labelFmt?: (l: string | number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-pop">
      {label !== undefined && <div className="mb-1 font-semibold text-text">{labelFmt ? labelFmt(label) : label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-text-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name && <span>{p.name}</span>}
          <span className="num ml-auto font-semibold text-text">{fmt ? fmt(p.value, p.dataKey) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

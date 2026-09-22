export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Overlay con máscara SVG (agujero redondeado) — nunca box-shadow 9999px */
export function Spotlight({ rect, onBackdrop }: { rect: Rect | null; onBackdrop: () => void }) {
  const pad = 8
  const r = rect ? { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 } : null
  return (
    <div className="fixed inset-0 z-[9000]" onClick={onBackdrop}>
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id="soe-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {r && <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={12} fill="black" style={{ transition: 'all .3s cubic-bezier(.2,.8,.2,1)' }} />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(10,10,10,.55)" mask="url(#soe-tour-mask)" />
      </svg>
      {r && (
        <div
          className="pointer-events-none absolute rounded-xl"
          style={{
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            boxShadow: '0 0 0 2px rgb(var(--acento)), 0 0 24px 4px rgb(var(--acento) / .45)',
            transition: 'all .3s cubic-bezier(.2,.8,.2,1)',
          }}
        >
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ring rounded-full bg-blue-500/70" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
          </span>
        </div>
      )}
    </div>
  )
}

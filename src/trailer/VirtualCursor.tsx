export interface CursorState {
  x: number
  y: number
  down: boolean
}

/** Cursor virtual azul — se mueve con left/top (no transform sobre elementos centrados) */
export function VirtualCursor({ state }: { state: CursorState }) {
  return (
    <div
      className="pointer-events-none fixed z-[9994]"
      style={{ left: state.x, top: state.y, transition: 'left .7s cubic-bezier(.2,.8,.2,1), top .7s cubic-bezier(.2,.8,.2,1)' }}
    >
      <div
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-blue-500/30"
        style={{ scale: state.down ? '1.6' : '1', opacity: state.down ? 0.9 : 0.5, transition: 'scale .15s, opacity .15s' }}
      />
      <svg width="26" height="26" viewBox="0 0 24 24" className="relative drop-shadow-lg" style={{ scale: state.down ? '0.88' : '1', transition: 'scale .12s' }}>
        <path d="M4 2.5l15 8.2-6.6 1.6-2.9 6.4L4 2.5z" fill="#2563eb" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

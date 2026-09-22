import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react'
import { useSession } from '@/store/useSession'
import { useT } from '@/i18n/useT'
import { getTourSteps } from './getTourSteps'
import { Spotlight, type Rect } from './Spotlight'
import { markTourCompletado, tourCompletado, useTour, welcomeSeen } from './useTour'
import { TourEndModal } from './TourEndModal'
import { Button } from '@/components/ui/button'
import { useTrailer } from '@/trailer/useTrailer'

const CARD_W = 330

function findTarget(sel: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${sel}"], [data-tour-hero="${sel}"]`))
  return els.find((e) => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }) ?? null
}

export function TourProvider() {
  const role = useSession((s) => s.role)!
  const trailer = useTrailer((s) => s.running)
  const { lang, L } = useT()
  const { active, runId, stop, setEndOpen, setSheet } = useTour()
  const steps = useMemo(() => getTourSteps(role, lang), [role, lang])
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const timers = useRef<number[]>([])
  const [vw, setVw] = useState(() => window.innerWidth)
  const [vh, setVh] = useState(() => window.innerHeight)

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }, [])

  // Reanudar al entrar si el welcome ya se vio en esta sesión y el rol no completó el tour
  useEffect(() => {
    if (!trailer && welcomeSeen() && !tourCompletado(role)) {
      const t = window.setTimeout(() => useTour.getState().start(), 700)
      return () => clearTimeout(t)
    }
    // solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (active) setI(0)
  }, [runId, active])

  useEffect(() => {
    if (trailer && active) stop()
  }, [trailer, active, stop])

  const step = steps[Math.min(i, steps.length - 1)]
  const mobile = vw < 1024

  // En mobile los destinos viven en el Sheet del menú: se abre mientras dura el tour
  useEffect(() => {
    setSheet(active && mobile && !!step?.target)
  }, [active, mobile, step, setSheet])

  const measure = useCallback(
    (scroll: boolean) => {
      if (!step?.target) {
        setRect(null)
        return
      }
      const el = findTarget(step.target)
      if (!el) return false
      if (scroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      const r = el.getBoundingClientRect()
      if (r.width === 0) return false
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height })
      return true
    },
    [step],
  )

  useLayoutEffect(() => {
    if (!active) return
    clearTimers()
    setRect(null)
    if (!step?.target) return
    const first = window.setTimeout(() => {
      const el = findTarget(step.target!)
      el?.scrollIntoView({ block: 'center' })
      const t2 = window.setTimeout(() => {
        if (!measure(false)) {
          const t3 = window.setTimeout(() => measure(false), 220)
          timers.current.push(t3)
        }
      }, 260)
      timers.current.push(t2)
    }, mobile ? 320 : 30)
    timers.current.push(first)
    return clearTimers
  }, [active, step, measure, clearTimers, mobile])

  useEffect(() => {
    if (!active) return
    const on = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
      measure(false)
    }
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
    }
  }, [active, measure])

  const teardown = useCallback(
    (showEnd: boolean) => {
      clearTimers()
      stop()
      setSheet(false)
      setRect(null)
      markTourCompletado(role)
      if (showEnd) setEndOpen(true)
    },
    [clearTimers, role, setEndOpen, setSheet, stop],
  )

  const next = useCallback(() => {
    if (i >= steps.length - 1) teardown(true)
    else setI((x) => x + 1)
  }, [i, steps.length, teardown])
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') teardown(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, next, prev, teardown])

  if (!active || !step) return <TourEndModal />

  const centered = !step.target
  let pos: React.CSSProperties | undefined
  if (!centered && rect) {
    const w = Math.min(CARD_W, vw - 24)
    if (rect.x + rect.w + 16 + w < vw) {
      pos = { left: rect.x + rect.w + 18, top: Math.max(12, Math.min(vh - 260, rect.y + rect.h / 2 - 90)), width: w }
    } else if (rect.y + rect.h + 220 < vh) {
      pos = { left: Math.max(12, Math.min(vw - w - 12, rect.x)), top: rect.y + rect.h + 16, width: w }
    } else {
      pos = { left: Math.max(12, Math.min(vw - w - 12, rect.x)), top: Math.max(12, rect.y - 216), width: w }
    }
  }

  const card = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-acento text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <span className="num text-[11px] font-semibold text-text-2">
          {i + 1} / {steps.length}
        </span>
        <button onClick={() => teardown(true)} className="ml-auto rounded-md p-1 text-text-2 hover:bg-bg-2 hover:text-text" aria-label="close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 text-[16px] font-bold leading-snug">{step.title}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-2">{step.body}</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-acento transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button onClick={() => teardown(true)} className="text-xs font-semibold text-text-2 hover:text-text">
          {L('Saltar tour', 'Skip tour')}
        </button>
        <div className="flex gap-1.5">
          {i > 0 && (
            <Button size="sm" variant="secondary" onClick={prev}>
              <ArrowLeft />
            </Button>
          )}
          <Button size="sm" onClick={next}>
            {i === steps.length - 1 ? L('Terminar', 'Finish') : i === 0 ? L('Empezar', 'Start') : L('Siguiente', 'Next')} <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(
    <>
      <Spotlight rect={centered ? null : rect} onBackdrop={() => teardown(true)} />
      {centered ? (
        <motion.div
          key={`c-${i}`}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9001] m-auto h-fit max-h-[88vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {card}
        </motion.div>
      ) : (
        pos && (
          <motion.div
            key={`t-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={pos}
            className="fixed z-[9001] rounded-2xl border border-border bg-card p-4 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {card}
          </motion.div>
        )
      )}
    </>,
    document.body,
  )
}

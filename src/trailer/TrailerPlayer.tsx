import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useTrailer } from './useTrailer'
import { SCENES, type Action } from './scenes'
import { useDemoStore } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { VirtualCursor, type CursorState } from './VirtualCursor'
import { WHATSAPP_URL } from '@/config/brand'
import { WhatsAppIcon } from '@/components/shared/all'
import { BrandMark } from '@/components/layout/Sidebar'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function waitFor(sel: string, timeout = 3500): Promise<HTMLElement | null> {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const el = Array.from(document.querySelectorAll<HTMLElement>(`[data-trailer="${sel}"]`)).find((e) => e.getBoundingClientRect().width > 0)
    if (el) return el
    await sleep(120)
  }
  return null
}

function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

interface Ring {
  x: number
  y: number
  w: number
  h: number
}

export function TrailerPlayer() {
  const running = useTrailer((s) => s.running)
  const stop = useTrailer((s) => s.stop)
  const navigate = useNavigate()
  const { b, L } = useT()
  const [scene, setScene] = useState(0)
  const [cursor, setCursor] = useState<CursorState>({ x: -60, y: -60, down: false })
  const [ring, setRing] = useState<Ring | null>(null)
  const token = useRef(0)

  const point = useCallback(async (el: HTMLElement, my: number) => {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    await sleep(450)
    if (token.current !== my) return null
    const r = el.getBoundingClientRect()
    setRing({ x: r.left - 6, y: r.top - 6, w: r.width + 12, h: r.height + 12 })
    setCursor((c) => ({ ...c, x: r.left + Math.min(r.width / 2, 120), y: r.top + Math.min(r.height / 2, 60) }))
    await sleep(750)
    return r
  }, [])

  const runAction = useCallback(
    async (a: Action, my: number) => {
      if (a.kind === 'escape') {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await sleep(200)
        return
      }
      const el = await waitFor(a.target)
      if (!el || token.current !== my) return
      if (a.kind === 'scroll') {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        await sleep(500)
        return
      }
      await point(el, my)
      if (token.current !== my) return
      if (a.kind === 'click') {
        setCursor((c) => ({ ...c, down: true }))
        await sleep(160)
        el.click()
        setCursor((c) => ({ ...c, down: false }))
        await sleep(a.wait ?? 600)
      } else if (a.kind === 'type') {
        const input = el as HTMLInputElement
        input.focus()
        const text = b(a.text)
        for (let i = 1; i <= text.length; i++) {
          if (token.current !== my) return
          setNativeValue(input, text.slice(0, i))
          await sleep(38)
        }
        await sleep(300)
      } else {
        await sleep(900)
      }
    },
    [b, point],
  )

  useEffect(() => {
    if (!running) return
    const my = ++token.current
    let i = 0
    ;(async () => {
      await sleep(500)
      while (token.current === my) {
        const s = SCENES[i]
        setScene(i)
        setRing(null)
        if (i === 0) useDemoStore.getState().beginEphemeral()
        const path = typeof s.path === 'function' ? s.path(useDemoStore.getState().data) : s.path
        if (path) navigate(path)
        const t0 = Date.now()
        await sleep(700)
        window.scrollTo({ top: 0 })
        for (const a of s.actions) {
          if (token.current !== my) return
          await runAction(a, my)
        }
        const left = s.duration - (Date.now() - t0)
        if (left > 0) await sleep(left)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        i = (i + 1) % SCENES.length
      }
    })()
    return () => {
      token.current++
    }
  }, [running, navigate, runAction])

  const exit = useCallback(() => {
    token.current++
    setRing(null)
    stop()
    navigate('/login', { replace: true })
  }, [navigate, stop])

  useEffect(() => {
    if (!running) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && e.isTrusted && exit()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, exit])

  if (!running) return null
  const s = SCENES[scene]

  return (
    <>
      {/* bloquea la interacción manual mientras corre */}
      <div className="fixed inset-0 z-[9990]" />
      {ring && (
        <div
          className="pointer-events-none fixed z-[9991] rounded-2xl"
          style={{
            left: ring.x,
            top: ring.y,
            width: ring.w,
            height: ring.h,
            boxShadow: '0 0 0 3px rgba(37,99,235,.9), 0 0 0 9px rgba(37,99,235,.2)',
            transition: 'all .45s cubic-bezier(.2,.8,.2,1)',
          }}
        />
      )}
      <VirtualCursor state={cursor} />
      {s.cta && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[9992] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15 }} className="fixed inset-0 m-auto h-fit max-h-[88vh] w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-white/10 bg-card p-8 text-center shadow-pop">
            <div className="flex justify-center">
              <BrandMark />
            </div>
            <h2 className="mt-6 text-[30px] font-extrabold leading-tight tracking-tight">
              {L('Lo que sobra hoy,', 'What’s left today')} <span className="text-acento">{L('no se pierde mañana.', 'isn’t wasted tomorrow.')}</span>
            </h2>
            <p className="mt-2 text-sm text-text-2">{L('Una plataforma de Insights para Alex y Soe.', 'A platform by Insights for Alex and Soe.')}</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="relative z-[9994] mt-6 inline-flex h-12 items-center gap-2 rounded-[10px] bg-acento px-6 font-bold text-white shadow-glow transition hover:bg-acento-hover">
              <WhatsAppIcon className="h-5 w-5" /> {L('Quiero mi app →', 'I want my app →')}
            </a>
          </motion.div>
        </motion.div>
      )}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[9993] flex justify-center px-4">
        <motion.div
          key={scene}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-xl rounded-2xl border border-white/20 bg-black/55 px-5 py-4 text-white shadow-pop backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#FF9A5A]">
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-[#FF9A5A]" /> {b(s.title)}
            <span className="num ml-auto text-white/60">
              {scene + 1}/{SCENES.length}
            </span>
          </div>
          <div className="mt-1 text-[17px] font-semibold leading-snug">{b(s.caption)}</div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
            <motion.div key={`p-${scene}`} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: s.duration / 1000, ease: 'linear' }} className="h-full bg-[#FF9A5A]" />
          </div>
        </motion.div>
      </div>
      <button onClick={exit} className="fixed right-4 top-4 z-[9994] inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-black/80">
        <X className="h-3.5 w-3.5" /> {L('Salir del demo', 'Exit demo')}
      </button>
    </>
  )
}

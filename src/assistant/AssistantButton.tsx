import { useCallback, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Maximize2, Sparkles, X } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { AssistantChat } from './AssistantChat'

export function AssistantButton() {
  const { pathname } = useLocation()
  const { L } = useT()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  if (pathname === '/agente') return null
  return (
    <div data-soe-floating>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-36 right-3 z-[60] flex h-[min(560px,calc(100vh-10rem))] w-[min(400px,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-pop lg:bottom-24 lg:right-6"
        >
          <div className="flex items-center gap-2.5 border-b border-border bg-gradient-to-r from-acento-soft to-card px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-acento text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">Paula</div>
              <div className="flex items-center gap-1 text-[11px] text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {L('En línea', 'Online')}
              </div>
            </div>
            <Link to="/agente" onClick={close} className="rounded-lg p-1.5 text-text-2 hover:bg-card hover:text-text" aria-label={L('Pantalla completa', 'Full screen')}>
              <Maximize2 className="h-4 w-4" />
            </Link>
            <button onClick={close} className="rounded-lg p-1.5 text-text-2 hover:bg-card hover:text-text" aria-label="close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <AssistantChat onNavigate={close} />
          </div>
        </motion.div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={L('Hablar con Paula', 'Talk to Paula')}
        className="fixed bottom-20 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-acento text-white shadow-glow transition hover:scale-105 hover:bg-acento-hover lg:bottom-6 lg:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        {!open && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ring rounded-full bg-white/70" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-acento bg-white" />
          </span>
        )}
      </button>
    </div>
  )
}

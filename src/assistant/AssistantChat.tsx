import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, SendHorizontal, Sparkles } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { useDemoStore } from '@/store/useDemoStore'
import { respond, SUGGESTIONS, type AgentReply } from './responder'
import { cn } from '@/lib/utils'
import { create } from 'zustand'

interface Msg {
  id: number
  from: 'user' | 'agent'
  text: string
  reply?: AgentReply
}

/** Historial compartido entre widget y página /agente */
export const useChat = create<{ msgs: Msg[]; push: (m: Omit<Msg, 'id'>) => void }>((set) => ({
  msgs: [],
  push: (m) => set((s) => ({ msgs: [...s.msgs, { ...m, id: s.msgs.length + 1 }] })),
}))

export function AssistantChat({ onNavigate, big }: { onNavigate?: () => void; big?: boolean }) {
  const { L, b, lang } = useT()
  const msgs = useChat((s) => s.msgs)
  const push = useChat((s) => s.push)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [msgs.length, typing])

  const ask = useCallback(
    (q: string) => {
      const v = q.trim()
      if (!v || typing) return
      push({ from: 'user', text: v })
      setText('')
      setTyping(true)
      setTimeout(() => {
        const reply = respond(v, useDemoStore.getState().data, lang)
        push({ from: 'agent', text: reply.text, reply })
        setTyping(false)
      }, 650 + Math.random() * 400)
    },
    [lang, push, typing],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn('scrollbar-thin flex-1 overflow-y-auto', big ? 'px-4 py-6 sm:px-8' : 'p-4')}>
        <div className={cn('grid gap-3', big && 'mx-auto max-w-2xl')}>
          <AgentBubble text={L('Hola, soy Paula, tu agente de IA. Conozco los comercios, productos y ventas de la plataforma. ¿Qué necesitás saber?', 'Hi, I’m Paula, your AI agent. I know the platform’s shops, products and sales. What do you need to know?')} />
          {msgs.length === 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s[0]} onClick={() => ask(b(s))} className="rounded-full border border-acento/30 bg-acento-soft px-3 py-1.5 text-left text-xs font-semibold text-acento transition hover:bg-acento hover:text-white">
                  {b(s)}
                </button>
              ))}
            </div>
          )}
          {msgs.map((m) =>
            m.from === 'user' ? (
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-acento px-3.5 py-2.5 text-sm text-white">
                {m.text}
              </motion.div>
            ) : (
              <AgentBubble key={m.id} text={m.text} reply={m.reply} onNavigate={onNavigate} />
            ),
          )}
          {typing && (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-bg-2 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-text-2" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}
          {msgs.length > 0 && !typing && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS.filter((s) => !msgs.some((m) => m.text === b(s))).slice(0, 3).map((s) => (
                <button key={s[0]} onClick={() => ask(b(s))} className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text-2 transition hover:border-acento/40 hover:text-acento">
                  {b(s)}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className={cn('border-t border-border bg-card', big ? 'px-4 py-4 sm:px-8' : 'p-3')}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(text)
          }}
          className={cn('flex gap-2', big && 'mx-auto max-w-2xl')}
        >
          <input
            data-trailer="agente-input"
            className="input"
            placeholder={L('Preguntale a Paula sobre comercios, ventas, vencimientos…', 'Ask Paula about shops, sales, expiry…')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" data-trailer="agente-send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-acento text-white transition hover:bg-acento-hover disabled:opacity-50" disabled={!text.trim()} aria-label="send">
            <SendHorizontal className="h-4 w-4" />
          </button>
        </form>
        <div className={cn('mt-2 text-center text-[10.5px] text-muted', big && 'mx-auto max-w-2xl')}>{L('Versión demo — conectar API para respuestas en tiempo real', 'Demo version — connect an API for real-time answers')}</div>
      </div>
    </div>
  )
}

function AgentBubble({ text, reply, onNavigate }: { text: string; reply?: AgentReply; onNavigate?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-[92%] gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-acento text-white">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-border bg-bg-2 px-3.5 py-2.5 text-sm">
        <p>{text}</p>
        {reply?.bullets && (
          <ul className="mt-2 grid gap-1">
            {reply.bullets.map((b) => (
              <li key={b} className="flex gap-1.5 text-[13px] text-text-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-acento" /> <span className="num-inline">{b}</span>
              </li>
            ))}
          </ul>
        )}
        {reply?.link && (
          <Link to={reply.link.to} onClick={onNavigate} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-acento hover:underline">
            {reply.link.label} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

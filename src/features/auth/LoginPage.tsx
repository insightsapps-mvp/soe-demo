import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BadgePercent, Coins, Eye, EyeOff, Leaf, MapPin, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useT } from '@/i18n/useT'
import { useSession } from '@/store/useSession'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/form'
import { BrandMark } from '@/components/layout/Sidebar'
import { LangToggle, ThemeToggle } from '@/components/layout/Topbar'
import { WhatsAppIcon } from '@/components/shared'
import { WHATSAPP_URL } from '@/config/brand'
import { cn } from '@/lib/utils'
import { useTrailer } from '@/trailer/useTrailer'
import type { Role } from '@/domain/types'

const PILLS: { role: Role; label: [string, string]; email: string; tone: string }[] = [
  { role: 'admin', label: ['Soe · Administradora', 'Soe · Administrator'], email: 'soe@soe.demo', tone: 'bg-text text-bg' },
  { role: 'comercio', label: ['Panadería La Espiga · Comercio', 'Panadería La Espiga · Shop'], email: 'comercio@soe.demo', tone: 'bg-acento text-white' },
  { role: 'cliente', label: ['María José · Cliente', 'María José · Customer'], email: 'cliente@soe.demo', tone: 'bg-ok text-white' },
]

export default function LoginPage() {
  const { L, b } = useT()
  const navigate = useNavigate()
  const login = useSession((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startTrailer = useTrailer((s) => s.start)

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (login(email, password, remember)) {
        // Regla: el login SIEMPRE aterriza en /propuesta, sin importar el rol
        navigate('/propuesta', { replace: true })
      } else {
        setError(L('Usuario o contraseña incorrectos. Probá con una de las cuentas demo.', 'Wrong user or password. Try one of the demo accounts.'))
      }
    },
    [L, email, login, navigate, password, remember],
  )

  const features = [
    { icon: MapPin, t: L('Geolocalización en vivo', 'Live geolocation'), d: L('Ofertas en un radio de 1 a 10 km', 'Deals within a 1–10 km radius') },
    { icon: BadgePercent, t: L('Descuentos automáticos', 'Automatic discounts'), d: L('Precio final calculado al instante', 'Final price calculated instantly') },
    { icon: Coins, t: L('Pagos en Bs, USD o cripto', 'Pay in Bs, USD or crypto'), d: 'Binance · Zelle · Pago Móvil' },
    { icon: Leaf, t: L('Impacto medido en kilos salvados', 'Impact measured in kilos saved'), d: L('Cada venta es comida que no se perdió', 'Every sale is food not wasted') },
  ]

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Hero */}
      <div className="glow-bg relative hidden w-[55%] flex-col justify-between overflow-hidden border-r border-border px-14 py-10 lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-acento/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-warning/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <BrandMark />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-acento/30 bg-card/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-acento backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-acento" /> DEMO PREVIEW
          </span>
        </div>
        <div className="relative max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="whitespace-nowrap text-[40px] font-extrabold leading-[1.04] tracking-[-0.03em] xl:text-[50px] 2xl:text-[58px]"
          >
            {L('Lo que sobra hoy,', 'What’s left today')}
            <br />
            <span className="text-acento">{L('no se pierde mañana.', 'isn’t wasted tomorrow.')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }} className="mt-5 max-w-md text-[15px] leading-relaxed text-text-2">
            {L(
              'Comercios publican productos por vencer con descuento. La gente cerca los encuentra antes de que se acaben.',
              'Shops list products close to expiry at a discount. People nearby find them before they run out.',
            )}
          </motion.p>
          <div className="mt-9 grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                className="flex gap-3 rounded-2xl border border-border bg-card/70 p-3.5 backdrop-blur"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-acento-soft text-acento">
                  <f.icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <div className="text-[13px] font-bold">{f.t}</div>
                  <div className="mt-0.5 text-xs text-text-2">{f.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-muted">
          {L('Caracas · Valencia · Maracaibo · Barquisimeto', 'Caracas · Valencia · Maracaibo · Barquisimeto')} — Powered by Insights
        </div>
      </div>

      {/* Card */}
      <div className="relative flex flex-1 flex-col px-4 py-5 sm:px-8 lg:w-[45%]">
        <div className="flex items-center justify-between gap-3">
          <div className="lg:hidden">
            <BrandMark small />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-acento/25 bg-acento-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-acento sm:inline lg:hidden">DEMO PREVIEW</span>
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[400px]">
            <div className="mb-6 lg:hidden">
              <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">
                {L('Lo que sobra hoy,', 'What’s left today')} <span className="text-acento">{L('no se pierde mañana.', 'isn’t wasted tomorrow.')}</span>
              </h1>
            </div>
            <div className="card p-6 sm:p-7">
              <h2 className="text-xl font-bold tracking-tight">{L('Entrá a Soe', 'Sign in to Soe')}</h2>
              <p className="mt-1 text-sm text-text-2">{L('Elegí una cuenta demo o ingresá tus credenciales.', 'Pick a demo account or enter your credentials.')}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {PILLS.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => {
                      setEmail(p.email)
                      setPassword('demo2026')
                      setError(null)
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition',
                      email === p.email ? 'border-acento bg-acento-soft text-acento' : 'border-border bg-bg-2 text-text-2 hover:border-border-strong hover:text-text',
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', p.tone)} />
                    {b(p.label)}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-5 grid gap-3.5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{L('Usuario', 'User')}</span>
                  <input className="input" type="email" autoComplete="username" placeholder="nombre@soe.demo" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{L('Contraseña', 'Password')}</span>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-2 hover:text-text" aria-label="toggle password">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-text-2">
                    <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} /> {L('Recordarme', 'Remember me')}
                  </label>
                  <button
                    type="button"
                    className="font-semibold text-acento hover:underline"
                    onClick={() => toast.info(L('En la demo usá las cuentas de arriba · contraseña demo2026', 'In the demo use the accounts above · password demo2026'))}
                  >
                    {L('¿Olvidaste tu contraseña?', 'Forgot your password?')}
                  </button>
                </div>
                {error && <div className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</div>}
                <Button type="submit" size="lg" className="mt-1 w-full">
                  {L('Entrar', 'Sign in')} <ArrowRight />
                </Button>
              </form>

              <button
                type="button"
                onClick={() => startTrailer()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] py-2 text-sm font-semibold text-text-2 transition hover:bg-bg-2 hover:text-acento"
              >
                <PlayCircle className="h-4 w-4 text-acento" /> {L('Ver demo automática de la plataforma', 'Watch the automatic platform demo')}
              </button>
            </div>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 text-sm text-text-2 transition hover:text-acento">
              <WhatsAppIcon className="h-4 w-4 text-ok" />
              {L('¿No tenés acceso?', 'No access?')} <span className="font-semibold text-acento">{L('Hablemos por WhatsApp', "Let's talk on WhatsApp")}</span>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

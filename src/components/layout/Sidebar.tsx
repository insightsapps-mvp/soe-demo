import { NavLink, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { Check, ChevronsUpDown, Globe, LogOut, Moon, RotateCcw, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { NAV } from '@/config/nav'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { useSession, ROLE_PERSONA, ROLE_HOME } from '@/store/useSession'
import { usePrefs } from '@/store/usePrefs'
import { useDemoStore } from '@/store/useDemoStore'
import type { Role } from '@/domain/types'
import { Avatar, WhatsAppIcon } from '@/components/shared'
import { WHATSAPP_URL } from '@/config/brand'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/overlays'
import { tourCompletado, useTour } from '@/tour/useTour'

export function BrandMark({ className, small }: { className?: string; small?: boolean }) {
  const { L } = useT()
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('relative flex items-center justify-center rounded-[10px] bg-acento text-white shadow-glow', small ? 'h-7 w-7' : 'h-9 w-9')}>
        <svg viewBox="0 0 32 32" className={small ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden>
          <path d="M16 5c4.6 3.9 7.5 8 7.5 12.2a7.5 7.5 0 0 1-15 0C8.5 13 11.4 8.9 16 5z" fill="#fff" />
          <circle cx="16" cy="17.8" r="2.8" fill="rgb(var(--acento))" />
        </svg>
      </div>
      <div className="leading-none">
        <div className={cn('font-extrabold tracking-tight', small ? 'text-[15px]' : 'text-[17px]')}>SOE</div>
        {!small && <div className="mt-0.5 text-[10px] font-medium text-text-2">{L('marketplace antidesperdicio', 'anti-waste marketplace')}</div>}
      </div>
    </div>
  )
}

export const ROLE_TONE: Record<Role, 'navy' | 'acento' | 'ok'> = { admin: 'navy', comercio: 'acento', cliente: 'ok' }

export function useSwitchRole(onDone?: () => void) {
  const navigate = useNavigate()
  const switchRole = useSession((s) => s.switchRole)
  const current = useSession((s) => s.role)
  const { t } = useT()
  return useCallback(
    (r: Role) => {
      if (r === current) return
      switchRole(r)
      navigate(ROLE_HOME[r])
      toast.success(t('switcher.title') + ' · ' + t(`role.${r}` as const))
      onDone?.()
      // el tour se re-dispara al cambiar de rol, si ese rol no lo completó
      if (!tourCompletado(r) && useTour.getState().welcomeDone) setTimeout(() => useTour.getState().start(), 500)
    },
    [current, navigate, onDone, switchRole, t],
  )
}

export function RoleSwitcher({ onDone }: { onDone?: () => void }) {
  const { t } = useT()
  const role = useSession((s) => s.role)
  const doSwitch = useSwitchRole(onDone)
  const opts: { r: Role; label: string }[] = [
    { r: 'admin', label: `Alex · ${t('role.adminShort')}` },
    { r: 'comercio', label: `La Espiga · ${t('role.comercio')}` },
    { r: 'cliente', label: `María José · ${t('role.cliente')}` },
  ]
  const activeCls: Record<Role, string> = {
    admin: 'border-text/80 bg-text text-bg',
    comercio: 'border-acento bg-acento text-white',
    cliente: 'border-ok bg-ok text-white',
  }
  return (
    <div data-tour="role-switcher" className="rounded-xl border border-border bg-bg-2 p-2">
      <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{t('switcher.title')}</div>
      <div className="grid gap-1">
        {opts.map((o) => {
          const active = role === o.r
          return (
            <button
              key={o.r}
              onClick={() => doSwitch(o.r)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs font-semibold transition',
                active ? activeCls[o.r] : 'border-transparent text-text-2 hover:bg-card hover:text-text',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                  active ? 'bg-white/20' : o.r === 'admin' ? 'bg-text/10 text-text' : o.r === 'comercio' ? 'bg-acento-soft text-acento' : 'bg-ok-soft text-ok',
                )}
              >
                {ROLE_PERSONA[o.r].initials.slice(0, 2)}
              </span>
              <span className="truncate">{o.label}</span>
              {active && <Check className="ml-auto h-3.5 w-3.5" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function WhatsAppCta({ compact }: { compact?: boolean }) {
  const { t } = useT()
  return (
    <div data-tour="whatsapp-cta" className="relative overflow-hidden rounded-xl border border-acento/25 bg-gradient-to-br from-acento-soft to-card p-3">
      <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-acento px-2 py-0.5 text-[9.5px] font-bold tracking-wider text-white">
        <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-white" /> {t('common.demoPreview')}
      </div>
      {!compact && <p className="mb-2 text-xs font-semibold leading-snug text-text">{t('cta.title')}</p>}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="flex h-9 items-center justify-center gap-2 rounded-[10px] bg-acento text-xs font-bold text-white shadow-sm transition hover:bg-acento-hover"
      >
        <WhatsAppIcon className="h-4 w-4" /> {t('cta.button')}
      </a>
      <div className="mt-1.5 text-center text-[10px] text-muted">{t('common.poweredBy')}</div>
    </div>
  )
}

export function UserMenu({ align = 'start', trigger }: { align?: 'start' | 'end'; trigger?: React.ReactNode }) {
  const { t } = useT()
  const role = useSession((s) => s.role)!
  const user = useSession((s) => s.user)
  const logout = useSession((s) => s.logout)
  const { lang, setLang, theme, setTheme } = usePrefs()
  const reset = useDemoStore((s) => s.reset)
  const navigate = useNavigate()
  const p = ROLE_PERSONA[role]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-bg-2">
            <Avatar initials={p.initials} tone={ROLE_TONE[role]} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{p.name}</div>
              <div className="truncate text-[11px] text-text-2">{t(`role.${role}` as const)}</div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side="top" className="w-60">
        <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTheme(theme === 'dark' ? 'light' : 'dark') }}>
          {theme === 'dark' ? <Sun /> : <Moon />} {t('common.theme')}: {theme === 'dark' ? t('common.dark') : t('common.light')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setLang(lang === 'es' ? 'en' : 'es') }}>
          <Globe /> {t('common.language')}: {lang === 'es' ? 'Español' : 'English'}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { reset(); toast.success(t('common.resetDone')) }}>
          <RotateCcw /> {t('common.resetDemo')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { logout(); navigate('/login') }} className="text-danger [&_svg]:text-danger">
          <LogOut /> {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useT()
  const role = useSession((s) => s.role)!
  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-5">
        <BrandMark />
      </div>
      <nav data-tour="sidebar-nav" className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-3">
        {NAV[role].map((sec) => (
          <div key={sec.id} className="mt-4 first:mt-1">
            <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{t(sec.label)}</div>
            <div className="grid gap-0.5">
              {sec.items.map((it) => (
                <NavLink
                  key={it.id}
                  to={it.path}
                  end={it.exact}
                  data-tour={`nav-${it.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition',
                      isActive ? 'bg-acento-soft font-semibold text-acento' : 'text-text-2 hover:bg-bg-2 hover:text-text',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <it.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-acento' : 'text-muted group-hover:text-text-2')} />
                      <span className="truncate">{t(it.label)}</span>
                      {it.id === 'propuesta' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-acento" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="grid shrink-0 gap-2 border-t border-border p-3">
        <RoleSwitcher onDone={onNavigate} />
        <WhatsAppCta />
        <UserMenu />
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside data-soe-floating className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col self-start border-r border-border bg-card lg:flex">
      <SidebarContent />
    </aside>
  )
}

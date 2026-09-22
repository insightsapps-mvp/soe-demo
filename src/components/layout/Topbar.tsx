import { useCallback, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, Moon, MoreHorizontal, Sparkles, Sun } from 'lucide-react'
import { Dialog, SheetContent } from '@/components/ui/dialog'
import * as D from '@radix-ui/react-dialog'
import { useT } from '@/i18n/useT'
import { usePrefs } from '@/store/usePrefs'
import { useSession } from '@/store/useSession'
import { BOTTOM_NAV, flatNav } from '@/config/nav'
import { cn } from '@/lib/utils'
import { Segmented } from '@/components/ui/form'
import { BrandMark, SidebarContent } from './Sidebar'
import { useTour } from '@/tour/useTour'

export function LangToggle({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { lang, setLang } = usePrefs()
  return <Segmented size={size} value={lang} onChange={setLang} options={[{ value: 'es', label: 'ES' }, { value: 'en', label: 'EN' }]} />
}

export function ThemeToggle() {
  const { theme, toggleTheme } = usePrefs()
  const { t } = useT()
  return (
    <button
      onClick={toggleTheme}
      aria-label={t('common.theme')}
      className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-card text-text-2 transition hover:text-text"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function Topbar() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const startTour = useTour((s) => s.start)
  const tourActive = useTour((s) => s.active)
  const tourSheet = useTour((s) => s.sheet)
  const trailer = useSession((s) => s.trailer)
  return (
    <header data-soe-floating className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-bg/85 px-4 backdrop-blur-md lg:h-16 lg:px-8">
      <Dialog open={open || tourSheet} onOpenChange={setOpen} modal={!tourActive}>
        <D.Trigger asChild>
          <button data-tour-mobile="menu" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-[10px] text-text-2 hover:bg-bg-2 lg:hidden" aria-label={t('common.menu')}>
            <Menu className="h-5 w-5" />
          </button>
        </D.Trigger>
        <SheetContent side="left" aria-describedby={undefined}>
          <D.Title className="sr-only">{t('common.menu')}</D.Title>
          <SidebarContent onNavigate={close} />
        </SheetContent>
      </Dialog>
      <div className="lg:hidden">
        <BrandMark small />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-acento/25 bg-acento-soft px-2.5 py-1 text-[10px] font-bold tracking-wider text-acento">
          <span className="h-1.5 w-1.5 animate-pulsedot rounded-full bg-acento" /> {t('common.demoPreview')}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {!trailer && (
          <button
            onClick={startTour}
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-card px-2.5 text-xs font-semibold text-text transition hover:border-acento/40 hover:text-acento"
          >
            <Sparkles className="h-3.5 w-3.5 text-acento" /> {t('common.tour')}
          </button>
        )}
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}

export function BottomNav() {
  const { t } = useT()
  const role = useSession((s) => s.role)!
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const loc = useLocation()
  const items = BOTTOM_NAV[role].map((id) => flatNav(role).find((i) => i.id === id)!)
  const moreActive = !items.some((i) => (i.exact ? loc.pathname === i.path : loc.pathname.startsWith(i.path)))
  return (
    <nav data-soe-floating className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) => (
          <NavLink
            key={it.id}
            to={it.path}
            end={it.exact}
            className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition', isActive ? 'text-acento' : 'text-text-2')}
          >
            <it.icon className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{t(it.label)}</span>
          </NavLink>
        ))}
        <Dialog open={open} onOpenChange={setOpen}>
          <D.Trigger asChild>
            <button className={cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold', moreActive ? 'text-acento' : 'text-text-2')}>
              <MoreHorizontal className="h-5 w-5" />
              {t('nav.mas')}
            </button>
          </D.Trigger>
          <SheetContent side="right" aria-describedby={undefined}>
            <D.Title className="sr-only">{t('nav.mas')}</D.Title>
            <SidebarContent onNavigate={close} />
          </SheetContent>
        </Dialog>
      </div>
    </nav>
  )
}

import { Suspense, useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Sidebar } from './Sidebar'
import { BottomNav, Topbar } from './Topbar'
import { useSession } from '@/store/useSession'
import { canAccess, roleForPath } from '@/config/permissions'
import { useT } from '@/i18n/useT'
import { AssistantButton } from '@/assistant/AssistantButton'
import { WelcomeModal } from '@/tour/WelcomeModal'
import { TourProvider } from '@/tour/TourProvider'
import { Skeleton } from '@/components/ui/misc'

export function RequireAuth() {
  const user = useSession((s) => s.user)
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <AppShell />
}

/** Si se abre una ruta de otro rol (p. ej. desde "Ver en el demo"), la vista cambia sola a ese rol */
function RoleGuard() {
  const role = useSession((s) => s.role)!
  const switchRole = useSession((s) => s.switchRole)
  const { pathname } = useLocation()
  const { t } = useT()
  const allowed = canAccess(role, pathname)
  const owner = roleForPath(pathname)
  useEffect(() => {
    if (!allowed && owner) {
      switchRole(owner)
      if (!useSession.getState().trailer) toast(t('switcher.title') + ' · ' + t(`role.${owner}` as const))
    }
  }, [allowed, owner, switchRole, t])
  if (!allowed && !owner) return <Navigate to="/propuesta" replace />
  if (!allowed) return null
  return <Outlet />
}

function PageFallback() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </div>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  const full = pathname === '/agente'
  return (
    <div className="flex min-h-screen bg-bg-2/50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main ref={mainRef} className={full ? 'flex-1 px-0 pb-16 lg:pb-0' : 'mx-auto w-full max-w-[1320px] flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7'}>
          <Suspense fallback={<PageFallback />}>
            <RoleGuard />
          </Suspense>
        </main>
      </div>
      <BottomNav />
      <AssistantButton />
      <WelcomeModal />
      <TourProvider />
    </div>
  )
}

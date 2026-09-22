import { create } from 'zustand'
import type { Role } from '@/domain/types'
import { skey } from '@/config/brand'
import { HERO_CLIENT_ID, HERO_COMERCIO_ID } from '@/data/seed'

export interface DemoUser {
  email: string
  role: Role
}

export const DEMO_ACCOUNTS: { email: string; password: string; role: Role }[] = [
  { email: 'alex@soe.demo', password: 'demo2026', role: 'admin' },
  { email: 'comercio@soe.demo', password: 'demo2026', role: 'comercio' },
  { email: 'cliente@soe.demo', password: 'demo2026', role: 'cliente' },
]

export const ROLE_PERSONA: Record<Role, { name: string; short: string; initials: string; entityId?: string }> = {
  admin: { name: 'Alex', short: 'Alex', initials: 'A' },
  comercio: { name: 'Panadería La Espiga', short: 'La Espiga', initials: 'LE', entityId: HERO_COMERCIO_ID },
  cliente: { name: 'María José Pérez', short: 'María José', initials: 'MJ', entityId: HERO_CLIENT_ID },
}

export const ROLE_HOME: Record<Role, string> = { admin: '/dashboard', comercio: '/mi-negocio', cliente: '/explorar' }

const SESSION_KEY = skey('session')

function readSession(): { user: DemoUser | null; role: Role | null } {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY)
    if (!raw) return { user: null, role: null }
    const v = JSON.parse(raw)
    return { user: v.user ?? null, role: v.role ?? v.user?.role ?? null }
  } catch {
    return { user: null, role: null }
  }
}

interface Session {
  user: DemoUser | null
  role: Role | null
  trailer: boolean
  login: (email: string, password: string, remember: boolean) => boolean
  loginAs: (role: Role, opts?: { trailer?: boolean }) => void
  switchRole: (role: Role) => void
  logout: () => void
  setTrailer: (v: boolean) => void
}

const persist = (user: DemoUser | null, role: Role | null, remember?: boolean) => {
  try {
    const raw = JSON.stringify({ user, role })
    if (!user) {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
      return
    }
    sessionStorage.setItem(SESSION_KEY, raw)
    if (remember) localStorage.setItem(SESSION_KEY, raw)
    else if (remember === false) localStorage.removeItem(SESSION_KEY)
    else if (localStorage.getItem(SESSION_KEY)) localStorage.setItem(SESSION_KEY, raw)
  } catch {
    /* noop */
  }
}

export const useSession = create<Session>((set, get) => ({
  ...readSession(),
  trailer: false,
  login: (email, password, remember) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && a.password === password)
    if (!acc) return false
    const user = { email: acc.email, role: acc.role }
    persist(user, acc.role, remember)
    set({ user, role: acc.role })
    return true
  },
  loginAs: (role, opts) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!
    const user = { email: acc.email, role }
    if (!opts?.trailer) persist(user, role)
    set({ user, role, trailer: !!opts?.trailer })
  },
  switchRole: (role) => {
    if (!get().trailer) persist(get().user, role)
    set({ role })
  },
  logout: () => {
    persist(null, null)
    try {
      sessionStorage.removeItem(skey('welcome_modal_seen'))
    } catch {
      /* noop */
    }
    set({ user: null, role: null, trailer: false })
  },
  setTrailer: (v) => set({ trailer: v }),
}))

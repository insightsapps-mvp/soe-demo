import { create } from 'zustand'
import type { Role } from '@/domain/types'
import { skey } from '@/config/brand'

const doneKey = (r: Role) => skey(`tour_completed_${r}`)

export const tourCompletado = (r: Role) => {
  try {
    return localStorage.getItem(doneKey(r)) === '1'
  } catch {
    return false
  }
}
export const markTourCompletado = (r: Role) => {
  try {
    localStorage.setItem(doneKey(r), '1')
  } catch {
    /* noop */
  }
}

export const WELCOME_KEY = skey('welcome_modal_seen')
export const welcomeSeen = () => {
  try {
    return sessionStorage.getItem(WELCOME_KEY) === '1'
  } catch {
    return false
  }
}

interface TourState {
  active: boolean
  /** incrementa para relanzar */
  runId: number
  welcomeDone: boolean
  endOpen: boolean
  /** en mobile, el Sheet del menú queda abierto mientras dura el tour */
  sheet: boolean
  setSheet: (v: boolean) => void
  start: () => void
  stop: () => void
  setWelcomeDone: (v: boolean) => void
  setEndOpen: (v: boolean) => void
}

export const useTour = create<TourState>((set) => ({
  active: false,
  runId: 0,
  welcomeDone: welcomeSeen(),
  endOpen: false,
  sheet: false,
  setSheet: (v) => set((s) => (s.sheet === v ? s : { sheet: v })),
  start: () => set((s) => ({ active: true, runId: s.runId + 1, endOpen: false })),
  stop: () => set({ active: false }),
  setWelcomeDone: (v) => set({ welcomeDone: v }),
  setEndOpen: (v) => set({ endOpen: v }),
}))

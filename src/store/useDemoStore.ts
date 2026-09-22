import { create } from 'zustand'
import { useEffect, useState } from 'react'
import { buildSeed, type SeedState } from '@/data/seed'
import { applyMutation, type Mutation } from './mutations'
import { assertDemoIntegrity } from '@/domain/integrity'
import { skey } from '@/config/brand'

const LOG_KEY = skey('mutations')

function readLog(): Mutation[] {
  try {
    const raw = sessionStorage.getItem(LOG_KEY)
    return raw ? (JSON.parse(raw) as Mutation[]) : []
  } catch {
    return []
  }
}
function writeLog(log: Mutation[]) {
  try {
    sessionStorage.setItem(LOG_KEY, JSON.stringify(log))
  } catch {
    /* almacenamiento lleno o bloqueado: la demo sigue en memoria */
  }
}

const seed = buildSeed()
const replay = (log: Mutation[]) => log.reduce(applyMutation, seed)

interface DemoStore {
  data: SeedState
  log: Mutation[]
  /** false durante el Modo Trailer: las mutaciones no se guardan */
  persist: boolean
  dispatch: (m: Mutation) => void
  reset: () => void
  beginEphemeral: () => void
  endEphemeral: () => void
}

const initialLog = readLog()

export const useDemoStore = create<DemoStore>((set, get) => ({
  data: replay(initialLog),
  log: initialLog,
  persist: true,
  dispatch: (m) => {
    const { data, log, persist } = get()
    const next = applyMutation(data, m)
    const nextLog = [...log, m]
    if (persist) writeLog(nextLog)
    set({ data: next, log: nextLog })
    if (import.meta.env.DEV) assertDemoIntegrity(next, Date.now())
  },
  reset: () => {
    writeLog([])
    set({ data: seed, log: [] })
  },
  beginEphemeral: () => set({ persist: false, data: seed, log: [] }),
  endEphemeral: () => {
    const log = readLog()
    set({ persist: true, data: replay(log), log })
  },
}))

if (import.meta.env.DEV) assertDemoIntegrity(useDemoStore.getState().data, Date.now())

export const useData = () => useDemoStore((s) => s.data)
export const useDispatch = () => useDemoStore((s) => s.dispatch)

/** Reloj compartido para countdowns y filtros por tiempo */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

let idCounter = 0
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(idCounter++).toString(36)}`

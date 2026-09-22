import { create } from 'zustand'
import { useSession } from '@/store/useSession'
import { useDemoStore } from '@/store/useDemoStore'

interface TrailerState {
  running: boolean
  start: () => void
  stop: () => void
}

/** Modo Trailer: entra como Admin con datos semilla y no persiste mutaciones */
export const useTrailer = create<TrailerState>((set) => ({
  running: false,
  start: () => {
    useDemoStore.getState().beginEphemeral()
    useSession.getState().loginAs('admin', { trailer: true })
    set({ running: true })
  },
  stop: () => {
    set({ running: false })
    useDemoStore.getState().endEphemeral()
    useSession.getState().logout()
  },
}))

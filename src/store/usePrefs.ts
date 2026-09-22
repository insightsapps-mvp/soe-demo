import { create } from 'zustand'
import type { Lang } from '@/domain/types'
import { skey } from '@/config/brand'

type Theme = 'light' | 'dark'

const read = <T extends string>(k: string, fallback: T, allowed: T[]): T => {
  try {
    const v = localStorage.getItem(skey(k)) as T | null
    return v && allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(skey(k), v)
  } catch {
    /* noop */
  }
}

interface Prefs {
  lang: Lang
  theme: Theme
  setLang: (l: Lang) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

export const usePrefs = create<Prefs>((set, get) => ({
  lang: read<Lang>('lang', 'es', ['es', 'en']),
  theme: read<Theme>('theme', 'light', ['light', 'dark']),
  setLang: (lang) => {
    write('lang', lang)
    document.documentElement.lang = lang
    set({ lang })
  },
  setTheme: (theme) => {
    write('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))

export const useLang = () => usePrefs((s) => s.lang)

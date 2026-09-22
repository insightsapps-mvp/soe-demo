import { useCallback, useMemo } from 'react'
import { dict, type DictKey } from './dict'
import { useLang } from '@/store/usePrefs'
import type { Bi, Lang } from '@/domain/types'

type Vars = Record<string, string | number>

const interp = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : s)

export function translate(lang: Lang, key: DictKey, vars?: Vars) {
  const pair = dict[key]
  return interp(pair ? pair[lang === 'es' ? 0 : 1] : key, vars)
}

/** Hook de i18n: t(clave) para el diccionario, L(es, en) para copys inline, b([es,en]) para datos bilingües */
export function useT() {
  const lang = useLang()
  const t = useCallback((key: DictKey, vars?: Vars) => translate(lang, key, vars), [lang])
  const L = useCallback((es: string, en: string, vars?: Vars) => interp(lang === 'es' ? es : en, vars), [lang])
  const b = useCallback((pair: Bi | readonly [string, string], vars?: Vars) => interp(pair[lang === 'es' ? 0 : 1], vars), [lang])
  return useMemo(() => ({ t, L, b, lang }), [t, L, b, lang])
}

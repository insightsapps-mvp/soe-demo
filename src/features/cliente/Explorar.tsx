import { useCallback, useEffect, useMemo, useState } from 'react'
import { Circle, Marker, Popup } from 'react-leaflet'
import { Bell, ChevronDown, Clock3, History, Map as MapIcon, MapPin, Search, SearchX, X } from 'lucide-react'
import { useData, useDispatch, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { CATEGORIAS, nearbyFeed, isLive, vencMs, type FeedItem } from '@/domain/selectors'
import { DevNotice, EmptyState, PreviewBanner } from '@/components/shared/all'
import { Select, Slider } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlays'
import { catKey } from '@/i18n/enums'
import { CLIENT_LOCATION, formatKm } from '@/domain/geo'
import { GEO_RADIUS_DEFAULT_KM, GEO_RADIUS_MAX_KM, GEO_RADIUS_MIN_KM, skey } from '@/config/brand'
import { MapBase, meIcon, pinIcon } from '@/components/shared/MapBase'
import { ProductCard } from './ProductCard'
import { HERO_CLIENT_ID } from '@/data/seed'
import { HOUR, remainingShort } from '@/domain/dates'
import { cn, normalize } from '@/lib/utils'
import type { Categoria } from '@/domain/types'
import { CAT_EMOJI } from '@/data/productos'
import { useNavigate } from 'react-router-dom'

type Orden = 'distancia' | 'descuento' | 'vence'
const RADIUS_KEY = skey('radius')

export default function Explorar() {
  const d = useData()
  const now = useNow()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, L, b, lang } = useT()
  const [radius, setRadius] = useState(() => {
    try {
      return Number(sessionStorage.getItem(RADIUS_KEY)) || GEO_RADIUS_DEFAULT_KM
    } catch {
      return GEO_RADIUS_DEFAULT_KM
    }
  })
  const [cat, setCat] = useState<'all' | Categoria>('all')
  const [orden, setOrden] = useState<Orden>('distancia')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [limit, setLimit] = useState(24)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(skey('fav_alert_dismissed')) === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      sessionStorage.setItem(RADIUS_KEY, String(radius))
    } catch {
      /* noop */
    }
  }, [radius])

  const me = d.clientes.find((c) => c.id === HERO_CLIENT_ID)!
  const favs = useMemo(() => new Set(me.favoritos), [me.favoritos])
  const all = useMemo(() => nearbyFeed(d, now, CLIENT_LOCATION, radius), [d, now, radius])
  const favAlert = useMemo(
    () => d.productos.filter((p) => favs.has(p.id) && isLive(p, now) && vencMs(p) - now < 48 * HOUR).sort((a, b2) => vencMs(a) - vencMs(b2)),
    [d.productos, favs, now],
  )

  const feed = useMemo(() => {
    const nq = normalize(q)
    const list = all.filter((x) => (cat === 'all' || x.p.categoria === cat) && (!sel || x.c.id === sel) && (!nq || normalize(`${b(x.p.nombre)} ${x.c.nombre}`).includes(nq)))
    const sorters: Record<Orden, (a: FeedItem, b: FeedItem) => number> = {
      distancia: (a, b2) => a.km - b2.km || vencMs(a.p) - vencMs(b2.p),
      descuento: (a, b2) => b2.p.descuentoPct - a.p.descuentoPct,
      vence: (a, b2) => vencMs(a.p) - vencMs(b2.p),
    }
    return list.sort(sorters[orden])
  }, [all, cat, sel, q, orden, b])

  const byComercio = useMemo(() => {
    const m = new Map<string, { c: FeedItem['c']; n: number; km: number }>()
    for (const x of all.filter((x) => cat === 'all' || x.p.categoria === cat)) {
      const e = m.get(x.c.id)
      if (e) e.n++
      else m.set(x.c.id, { c: x.c, n: 1, km: x.km })
    }
    return [...m.values()]
  }, [all, cat])

  const catCounts = useMemo(() => {
    const m: Record<string, number> = { all: all.length }
    for (const x of all) m[x.p.categoria] = (m[x.p.categoria] ?? 0) + 1
    return m
  }, [all])

  const submitSearch = useCallback(() => {
    if (q.trim()) dispatch({ type: 'search', q: q.trim() })
  }, [dispatch, q])

  const selComercio = sel ? d.comercios.find((c) => c.id === sel) : null

  const map = (
    <div data-trailer="mapa" className="relative h-full min-h-[300px] overflow-hidden rounded-2xl border border-border shadow-card">
      <MapBase center={CLIENT_LOCATION} zoom={radius > 6 ? 12 : radius > 3 ? 13 : 14}>
        <Circle center={[CLIENT_LOCATION.lat, CLIENT_LOCATION.lng]} radius={radius * 1000} pathOptions={{ color: '#F5711A', weight: 1.5, fillColor: '#F5711A', fillOpacity: 0.06, dashArray: '6 6' }} />
        <Marker position={[CLIENT_LOCATION.lat, CLIENT_LOCATION.lng]} icon={meIcon()} />
        {byComercio.map(({ c, n, km }) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={pinIcon(String(n), { active: sel === c.id || hover === c.id })}
            eventHandlers={{ click: () => setSel((s) => (s === c.id ? null : c.id)) }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold">{c.nombre}</div>
                <div>
                  {n} {L('ofertas', 'deals')} · {formatKm(km, lang)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapBase>
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-xl border border-border bg-card/95 px-3 py-2 shadow-card backdrop-blur">
        <div className="num text-lg font-bold leading-none text-acento">{all.length}</div>
        <div className="text-[10.5px] font-semibold text-text-2">
          {L('ofertas activas en {r} km', 'live deals within {r} km', { r: radius })}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Geolocalización real del dispositivo', 'Real device geolocation'),
          L('Notificaciones push cuando un favorito está por vencer', 'Push notifications when a favorite is about to expire'),
          L('Inventario sincronizado en vivo con cada comercio', 'Inventory synced live with every shop'),
        ]}
      />
      <DevNotice
        feature={L('Geolocalización con GPS real del dispositivo', 'Geolocation with the device’s real GPS')}
        now={L('la ubicación es simulada (Caracas, Chacao).', 'location is simulated (Caracas, Chacao).')}
        later={L('usa el GPS real del celular del usuario.', 'it uses the real GPS of the user’s phone.')}
      />

      {favAlert.length > 0 && !dismissed && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-acento/30 bg-acento-soft p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-acento text-white">
            <Bell className="h-4 w-4" />
          </div>
          <button className="min-w-0 flex-1 text-left" onClick={() => navigate(`/explorar/${favAlert[0].id}`)}>
            <div className="text-sm font-bold">
              {L('Tu favorito "{n}" vence en {t}', 'Your favorite "{n}" expires in {t}', { n: b(favAlert[0].nombre), t: remainingShort(vencMs(favAlert[0]) - now, lang) })}
            </div>
            <div className="text-xs text-text-2">
              {favAlert.length > 1
                ? L('Y {n} favoritos más vencen en las próximas 48 h.', 'And {n} more favorites expire in the next 48 h.', { n: favAlert.length - 1 })
                : L('Todavía estás a tiempo. Tocá para verlo.', 'There’s still time. Tap to see it.')}
            </div>
          </button>
          <button
            aria-label={t('common.close')}
            className="rounded-lg p-1 text-text-2 hover:bg-card"
            onClick={() => {
              setDismissed(true)
              try {
                sessionStorage.setItem(skey('fav_alert_dismissed'), '1')
              } catch {
                /* noop */
              }
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="kicker mb-2">{L('OFERTAS CERCA TUYO', 'DEALS NEAR YOU')}</div>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{L('Explorar ofertas', 'Explore deals')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-acento" /> Caracas, Chacao
          </span>
          <div className="flex h-9 min-w-[220px] flex-1 items-center gap-3 rounded-full border border-border bg-card px-3.5 shadow-sm sm:flex-none">
            <span className="whitespace-nowrap text-xs font-semibold text-text-2">{L('Radio', 'Radius')}</span>
            <Slider value={[radius]} min={GEO_RADIUS_MIN_KM} max={GEO_RADIUS_MAX_KM} step={1} onValueChange={([v]) => setRadius(v)} className="w-28" />
            <span className="num w-12 text-right text-xs font-bold text-acento">{radius} km</span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Popover>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <PopoverTrigger asChild>
              <input
                className="input pl-9"
                placeholder={L('Buscar pan, queso, protector solar…', 'Search bread, cheese, sunscreen…')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                onBlur={submitSearch}
              />
            </PopoverTrigger>
          </div>
          <PopoverContent align="start" className="w-72 p-1.5" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="label-xs flex items-center gap-1.5 px-2 py-1.5">
              <History className="h-3 w-3" /> {L('Búsquedas recientes', 'Recent searches')}
            </div>
            {d.busquedas.map((s) => (
              <button key={s} onClick={() => setQ(s)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-bg-2">
                <Clock3 className="h-3.5 w-3.5 text-muted" /> {s}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <div className="flex gap-2">
          <Select
            value={orden}
            onValueChange={(v) => setOrden(v as Orden)}
            className="flex-1 sm:w-48"
            ariaLabel={L('Orden', 'Sort')}
            options={[
              { value: 'distancia', label: L('Más cerca', 'Nearest') },
              { value: 'descuento', label: L('Mayor descuento', 'Biggest discount') },
              { value: 'vence', label: L('Por vencer pronto', 'Expiring soon') },
            ]}
          />
          <Button variant="secondary" className="lg:hidden" onClick={() => setShowMap((v) => !v)}>
            <MapIcon /> {showMap ? L('Ocultar mapa', 'Hide map') : L('Ver mapa', 'Show map')}
            <ChevronDown className={cn('transition', showMap && 'rotate-180')} />
          </Button>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {(['all', ...CATEGORIAS] as const).map((k) => (
          <button
            key={k}
            onClick={() => setCat(k)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              cat === k ? 'border-acento bg-acento text-white shadow-sm' : 'border-border bg-card text-text-2 hover:border-border-strong hover:text-text',
            )}
          >
            {k !== 'all' && <span aria-hidden>{CAT_EMOJI[k]}</span>}
            {k === 'all' ? t('common.all') : t(catKey(k))}
            <span className={cn('num text-[10px]', cat === k ? 'text-white/80' : 'text-muted')}>{catCounts[k] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={cn('lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-7rem)]', showMap ? 'block h-[320px]' : 'hidden')}>{map}</div>
        <div>
          {selComercio && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-acento/30 bg-acento-soft px-3 py-2 text-xs">
              <span>
                {L('Mostrando solo', 'Showing only')} <b>{selComercio.nombre}</b>
              </span>
              <button className="font-semibold text-acento" onClick={() => setSel(null)}>
                {L('Ver todos', 'Show all')} ✕
              </button>
            </div>
          )}
          <div className="mb-3 flex items-center justify-between text-xs text-text-2">
            <span>
              <b className="num text-text">{feed.length}</b> {L('ofertas', 'deals')} · {L('a menos de', 'within')} <span className="num">{radius} km</span>
            </span>
          </div>
          {feed.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<SearchX />}
                title={L('No hay ofertas con estos filtros', 'No deals with these filters')}
                text={radius < GEO_RADIUS_MAX_KM ? L('Probá ampliar el radio: hay más comercios un poco más lejos.', 'Try widening the radius: there are more shops a bit further away.') : L('Probá otra categoría o volvé más tarde.', 'Try another category or check back later.')}
                action={
                  radius < GEO_RADIUS_MAX_KM ? (
                    <Button onClick={() => setRadius(Math.min(GEO_RADIUS_MAX_KM, radius + 3))}>{L('Ampliar a {r} km', 'Widen to {r} km', { r: Math.min(GEO_RADIUS_MAX_KM, radius + 3) })}</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => { setCat('all'); setQ(''); setSel(null) }}>{t('common.clearFilters')}</Button>
                  )
                }
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
                {feed.slice(0, limit).map((x, i) => (
                  <ProductCard key={x.p.id} p={x.p} c={x.c} km={x.km} now={now} fav={favs.has(x.p.id)} onHover={setHover} active={hover === x.c.id} tourId={i === 0 ? 'primer-producto' : undefined} />
                ))}
              </div>
              {feed.length > limit && (
                <div className="mt-4 text-center">
                  <Button variant="secondary" onClick={() => setLimit((l) => l + 24)}>
                    {L('Ver más ofertas ({n})', 'Show more deals ({n})', { n: feed.length - limit })}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

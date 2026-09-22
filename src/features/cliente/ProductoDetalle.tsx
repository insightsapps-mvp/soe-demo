import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Marker } from 'react-leaflet'
import { ArrowLeft, Clock, Heart, MapPin, Navigation, PackageCheck, ShoppingCart, Store } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useDispatch, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { isLive } from '@/domain/selectors'
import { Badge, Card, EmptyState, ExpiryCountdown, PreviewBanner, ProductImage } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { catKey } from '@/i18n/enums'
import { formatMoney } from '@/domain/money'
import { CLIENT_LOCATION, formatKm, haversineKm } from '@/domain/geo'
import { convert, ratesFrom } from '@/domain/fx'
import { MapBase, pinIcon, meIcon } from '@/components/shared/MapBase'
import { Checkout } from './Checkout'
import { HERO_CLIENT_ID } from '@/data/seed'
import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'
import { CAT_GRADIENT } from '@/data/productos'

export default function ProductoDetalle() {
  const { productoId } = useParams()
  const d = useData()
  const now = useNow()
  const dispatch = useDispatch()
  const { t, L, b, lang } = useT()
  const p = d.productos.find((x) => x.id === productoId)
  const c = p ? d.comercios.find((x) => x.id === p.comercioId) : undefined
  const me = d.clientes.find((x) => x.id === HERO_CLIENT_ID)!
  const fav = !!p && me.favoritos.includes(p.id)
  const [open, setOpen] = useState(false)
  const [img, setImg] = useState(0)
  const rates = useMemo(() => ratesFrom(d.tasas), [d.tasas])
  const visited = useRef<string | null>(null)
  useEffect(() => {
    if (p && visited.current !== p.id) {
      visited.current = p.id
      dispatch({ type: 'visit', productoId: p.id })
    }
  }, [p, dispatch])
  const otros = useMemo(() => (p ? d.productos.filter((x) => x.comercioId === p.comercioId && x.id !== p.id && isLive(x, now)).slice(0, 3) : []), [d.productos, p, now])

  if (!p || !c) {
    return <EmptyState icon={<Store />} title={L('Producto no encontrado', 'Product not found')} action={<Button asChild variant="secondary"><Link to="/explorar">{t('common.back')}</Link></Button>} />
  }
  const live = isLive(p, now)
  const km = haversineKm(CLIENT_LOCATION, c)
  const gallery = p.fotos.length > 1 ? p.fotos : [p.fotos[0], p.fotos[0], p.fotos[0]]
  const [g1, g2] = CAT_GRADIENT[p.categoria]
  const otra = p.moneda === 'VES' ? 'USD' : 'VES'

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Fotos reales del comercio con moderación', 'Real shop photos with moderation'),
          L('Reserva con retiro en tienda', 'Reserve and pick up in store'),
          L('Reseñas de otros clientes', 'Reviews from other customers'),
        ]}
      />
      <Link to="/explorar" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-acento">
        <ArrowLeft className="h-3.5 w-3.5" /> {L('Volver a ofertas', 'Back to deals')}
      </Link>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-card">
            <ProductImage
              foto={gallery[img]}
              categoria={p.categoria}
              size="lg"
              className={cn('h-[280px] w-full sm:h-[360px]', img === 1 && 'hue-rotate-15', img === 2 && 'saturate-150')}
            />
            <span className="num absolute left-4 top-4 rounded-full bg-ok px-3 py-1 text-sm font-bold text-white shadow">-{p.descuentoPct}%</span>
            {!live && <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-bold text-white backdrop-blur-[2px]">{p.estado === 'vendido' ? L('Vendido · no se perdió 🎉', 'Sold · nothing wasted 🎉') : L('Esta oferta ya no está disponible', 'This deal is no longer available')}</div>}
          </div>
          <div className="mt-3 flex gap-2">
            {gallery.map((f, i) => (
              <button key={i} onClick={() => setImg(i)} className={cn('h-16 w-16 overflow-hidden rounded-xl border-2 transition', img === i ? 'border-acento' : 'border-transparent opacity-70 hover:opacity-100')} style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
                <ProductImage foto={f} categoria={p.categoria} size="sm" className={cn('h-full w-full', i === 1 && 'hue-rotate-15', i === 2 && 'saturate-150')} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{t(catKey(p.categoria))}</Badge>
            <span className="num text-xs text-muted">{p.codigo}</span>
          </div>
          <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight">{b(p.nombre)}</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-2">{b(p.descripcion)}</p>

          <Card className="mt-5 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="num text-sm text-muted line-through">{formatMoney(p.precioOriginalCents, p.moneda, lang)}</div>
                <div className="num text-[34px] font-bold leading-none text-acento">{formatMoney(p.precioFinalCents, p.moneda, lang)}</div>
                <div className="num mt-1 text-xs text-text-2">≈ {formatMoney(convert(p.precioFinalCents, p.moneda, otra, rates), otra, lang)}</div>
              </div>
              <div className="text-right">
                <div className="num rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok">
                  {L('Ahorrás', 'You save')} {formatMoney(p.precioOriginalCents - p.precioFinalCents, p.moneda, lang)}
                </div>
              </div>
            </div>
            {live && (
              <div className="mt-4 rounded-xl bg-bg-2 p-3">
                <ExpiryCountdown vencimiento={p.vencimiento} now={now} />
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button size="lg" className="flex-1" disabled={!live} onClick={() => setOpen(true)} data-trailer="comprar-producto">
                {live ? <ShoppingCart /> : <PackageCheck />} {live ? L('Comprar', 'Buy') : L('No disponible', 'Unavailable')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                aria-label={L('Favorito', 'Favorite')}
                onClick={() => {
                  dispatch({ type: 'favorite', clienteId: HERO_CLIENT_ID, productoId: p.id })
                  toast.success(fav ? L('Quitado de favoritos', 'Removed from favorites') : L('Guardado · te avisamos 48 h antes de que venza', 'Saved · we’ll alert you 48 h before it expires'))
                }}
              >
                <Heart className={fav ? 'fill-danger text-danger' : ''} />
              </Button>
            </div>
          </Card>

          <Card className="mt-4 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-acento-soft text-acento">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{c.nombre}</div>
                <div className="mt-0.5 flex items-start gap-1 text-xs text-text-2">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {c.direccion}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-text-2">
                  <Clock className="h-3 w-3" /> {b(c.horario)}
                </div>
              </div>
              <span className="num shrink-0 text-sm font-bold text-acento">{formatKm(km, lang)}</span>
            </div>
            <div className="h-[160px] border-t border-border">
              <MapBase center={{ lat: (c.lat + CLIENT_LOCATION.lat) / 2, lng: (c.lng + CLIENT_LOCATION.lng) / 2 }} zoom={km > 4 ? 12 : 14} interactive={false}>
                <Marker position={[c.lat, c.lng]} icon={pinIcon('★', { active: true })} />
                <Marker position={[CLIENT_LOCATION.lat, CLIENT_LOCATION.lng]} icon={meIcon()} />
              </MapBase>
            </div>
            <div className="p-3">
              <Button asChild variant="secondary" className="w-full">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`} target="_blank" rel="noreferrer">
                  <Navigation /> {L('Cómo llegar', 'Get directions')}
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {otros.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">{L('Más ofertas de {c}', 'More deals from {c}', { c: c.nombre })}</h2>
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {otros.map((x) => (
              <ProductCard key={x.id} p={x} c={c} km={km} now={now} fav={me.favoritos.includes(x.id)} />
            ))}
          </div>
        </div>
      )}
      {(live || open) && <Checkout p={p} open={open} onOpenChange={setOpen} />}
    </div>
  )
}

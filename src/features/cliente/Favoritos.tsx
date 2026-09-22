import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, HeartOff } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useDispatch, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { EmptyState, PageHeader, PreviewBanner, ProductImage, Badge } from '@/components/shared/all'
import { Button } from '@/components/ui/button'
import { HERO_CLIENT_ID } from '@/data/seed'
import { isLive, vencMs } from '@/domain/selectors'
import { CLIENT_LOCATION, haversineKm } from '@/domain/geo'
import { ProductCard } from './ProductCard'
import { HOUR } from '@/domain/dates'

export default function Favoritos() {
  const d = useData()
  const now = useNow()
  const dispatch = useDispatch()
  const { L, b } = useT()
  const me = d.clientes.find((c) => c.id === HERO_CLIENT_ID)!
  const byId = useMemo(() => new Map(d.productos.map((p) => [p.id, p])), [d.productos])
  const comById = useMemo(() => new Map(d.comercios.map((c) => [c.id, c])), [d.comercios])
  const items = me.favoritos.map((id) => byId.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[]
  const live = items.filter((p) => isLive(p, now))
  const gone = items.filter((p) => !isLive(p, now))
  const soon = live.filter((p) => vencMs(p) - now < 48 * HOUR).length

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Push 48 h antes de que venza un favorito', 'Push 48 h before a favorite expires'),
          L('Alertas cuando tu comercio favorito publica', 'Alerts when your favorite shop posts'),
          L('Favoritos sincronizados entre dispositivos', 'Favorites synced across devices'),
        ]}
      />
      <PageHeader
        kicker={L('WISHLIST', 'WISHLIST')}
        title={L('Favoritos', 'Favorites')}
        subtitle={soon ? L('{n} de tus favoritos vencen en las próximas 48 h.', '{n} of your favorites expire in the next 48 h.', { n: soon }) : L('Te avisamos antes de que se acaben.', 'We’ll alert you before they run out.')}
      />
      {live.length === 0 && gone.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Heart />} title={L('Todavía no guardaste nada', 'You haven’t saved anything yet')} text={L('Tocá el corazón en cualquier oferta y te avisamos antes de que venza.', 'Tap the heart on any deal and we’ll alert you before it expires.')} action={<Button asChild><Link to="/explorar">{L('Explorar ofertas', 'Explore deals')}</Link></Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {live.map((p) => {
            const c = comById.get(p.comercioId)!
            return (
              <div key={p.id} className="relative">
                <ProductCard p={p} c={c} km={haversineKm(CLIENT_LOCATION, c)} now={now} fav />
              </div>
            )
          })}
        </div>
      )}
      {gone.length > 0 && (
        <div className="mt-8">
          <div className="label-xs mb-3">{L('Ya no disponibles', 'No longer available')}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {gone.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 opacity-80">
                <ProductImage foto={p.fotos[0]} categoria={p.categoria} size="sm" className="h-10 w-10 rounded-xl grayscale" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{b(p.nombre)}</div>
                  <Badge tone={p.estado === 'vendido' ? 'ok' : 'neutral'}>{p.estado === 'vendido' ? L('Se vendió', 'Sold out') : L('Venció', 'Expired')}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    dispatch({ type: 'favorite', clienteId: HERO_CLIENT_ID, productoId: p.id })
                    toast.success(L('Quitado de favoritos', 'Removed from favorites'))
                  }}
                >
                  <HeartOff /> {L('Quitar', 'Remove')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

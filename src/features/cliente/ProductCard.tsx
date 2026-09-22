import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Comercio, Producto } from '@/domain/types'
import { useT } from '@/i18n/useT'
import { useDispatch } from '@/store/useDemoStore'
import { ExpiryCountdown, ProductImage } from '@/components/shared/all'
import { formatMoney } from '@/domain/money'
import { formatKm } from '@/domain/geo'
import { HOUR } from '@/domain/dates'
import { HERO_CLIENT_ID } from '@/data/seed'
import { cn } from '@/lib/utils'

export const ProductCard = memo(function ProductCard({
  p, c, km, now, fav, onHover, active, tourId,
}: {
  p: Producto
  c: Comercio
  km?: number
  now: number
  fav: boolean
  onHover?: (id: string | null) => void
  active?: boolean
  tourId?: string
}) {
  const { L, b, lang } = useT()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const ms = new Date(p.vencimiento).getTime() - now
  const ahorro = p.precioOriginalCents - p.precioFinalCents
  return (
    <div
      role="link"
      tabIndex={0}
      data-trailer={tourId}
      onClick={() => navigate(`/explorar/${p.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/explorar/${p.id}`)}
      onMouseEnter={() => onHover?.(c.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-pop',
        active ? 'border-acento ring-2 ring-acento/20' : 'border-border',
      )}
    >
      <div className="relative">
        <ProductImage foto={p.fotos[0]} categoria={p.categoria} className="h-36 w-full transition duration-300 group-hover:scale-[1.03]" />
        <span className="num absolute left-2.5 top-2.5 rounded-full bg-ok px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">-{p.descuentoPct}%</span>
        <button
          aria-label={L('Favorito', 'Favorite')}
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'favorite', clienteId: HERO_CLIENT_ID, productoId: p.id })
            toast.success(fav ? L('Quitado de favoritos', 'Removed from favorites') : L('Guardado en favoritos · te avisamos antes de que venza', 'Saved to favorites · we’ll alert you before it expires'))
          }}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn('h-4 w-4', fav ? 'fill-danger text-danger' : 'text-text-2')} />
        </button>
        {ms < 24 * HOUR && (
          <div className="absolute inset-x-2.5 bottom-2.5 rounded-lg bg-card/95 px-2 py-1.5 shadow-sm backdrop-blur">
            <ExpiryCountdown vencimiento={p.vencimiento} now={now} />
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="truncate text-[14px] font-bold leading-snug">{b(p.nombre)}</div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-text-2">
          <span className="truncate">{c.nombre}</span>
          {km !== undefined && (
            <>
              <span className="text-muted">·</span>
              <MapPin className="h-3 w-3 shrink-0 text-acento" />
              <span className="num shrink-0 font-semibold text-text">{formatKm(km, lang)}</span>
            </>
          )}
        </div>
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <div>
            <div className="num text-[11px] text-muted line-through">{formatMoney(p.precioOriginalCents, p.moneda, lang)}</div>
            <div className="num text-lg font-bold leading-tight text-acento">{formatMoney(p.precioFinalCents, p.moneda, lang)}</div>
          </div>
          <span className="num rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok">
            {L('Ahorrás', 'Save')} {formatMoney(ahorro, p.moneda, lang)}
          </span>
        </div>
      </div>
    </div>
  )
})

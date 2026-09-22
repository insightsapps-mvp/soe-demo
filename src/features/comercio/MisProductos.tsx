import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download, Package, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { CATEGORIAS, effectiveEstado, vencMs } from '@/domain/selectors'
import { Card, DevNotice, EmptyState, PageHeader, PreviewBanner } from '@/components/shared/all'
import { Segmented, Select } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { catKey } from '@/i18n/enums'
import { ProductTable } from '@/features/shared/ProductTable'
import { ProductForm } from './ProductForm'
import { downloadCsv, normalize } from '@/lib/utils'
import { HERO_COMERCIO_ID } from '@/data/seed'
import type { Producto } from '@/domain/types'

type EstadoF = 'all' | 'activo' | 'vendido' | 'vencido'

export default function MisProductos() {
  const d = useData()
  const now = useNow()
  const { t, L, b } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<EstadoF>('all')
  const [cat, setCat] = useState('all')
  const [open, setOpen] = useState(false)
  const highlight = params.get('nuevo')

  const mine = useMemo(() => d.productos.filter((p) => p.comercioId === HERO_COMERCIO_ID && !p.dadoDeBaja), [d.productos])
  const counts = useMemo(() => {
    const c = { all: mine.length, activo: 0, vendido: 0, vencido: 0 }
    for (const p of mine) c[effectiveEstado(p, now)]++
    return c
  }, [mine, now])
  const filtered = useMemo(() => {
    const nq = normalize(q)
    const rank = (p: Producto) => (p.id === highlight ? -1 : { activo: 0, vencido: 1, vendido: 2 }[effectiveEstado(p, now)])
    return mine
      .filter((p) => (estado === 'all' || effectiveEstado(p, now) === estado) && (cat === 'all' || p.categoria === cat) && (!nq || normalize(`${b(p.nombre)} ${p.codigo}`).includes(nq)))
      .sort((a, b2) => rank(a) - rank(b2) || (effectiveEstado(a, now) === 'activo' ? vencMs(a) - vencMs(b2) : b2.publicadoEl.localeCompare(a.publicadoEl)))
  }, [mine, estado, cat, q, now, b, highlight])

  const onPublished = useCallback(
    (p: Producto) => {
      setOpen(false)
      setEstado('all')
      setParams({ nuevo: p.id }, { replace: true })
    },
    [setParams],
  )

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Carga masiva desde Excel o lector de código de barras', 'Bulk upload from Excel or barcode scanner'),
          L('Sincronización en segundos con la app del cliente', 'Syncs with the customer app in seconds'),
          L('Descuento sugerido según horas para vencer', 'Suggested discount based on hours to expiry'),
        ]}
      />
      <DevNotice
        feature={L('Publicación con moderación automática de imágenes', 'Publishing with automatic image moderation')}
        now={L('se publica directo, sin revisión.', 'listings go live directly, without review.')}
        later={L('cada foto pasa un chequeo automático antes de salir a producción.', 'each photo passes an automatic check before going live.')}
      />
      <PageHeader
        kicker={L('PORTAL', 'PORTAL')}
        title={L('Tus productos', 'Your products')}
        subtitle={L('Hacé clic en el precio, el descuento o el vencimiento de una fila para editarlo en línea.', 'Click a row’s price, discount or expiry to edit it inline.')}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                downloadCsv('la-espiga-productos.csv', [
                  ['Código', 'Producto', 'Categoría', 'Moneda', 'Precio original', 'Descuento %', 'Precio final', 'Vencimiento', 'Estado'],
                  ...filtered.map((p) => [p.codigo, b(p.nombre), t(catKey(p.categoria)), p.moneda, (p.precioOriginalCents / 100).toFixed(2), p.descuentoPct, (p.precioFinalCents / 100).toFixed(2), p.vencimiento, t(`estado.${effectiveEstado(p, now)}` as const)]),
                ])
                toast.success(L('CSV exportado con {n} productos', 'CSV exported with {n} products', { n: filtered.length }))
              }}
            >
              <Download /> {t('common.export')}
            </Button>
            <Button onClick={() => setOpen(true)} data-trailer="publicar-producto">
              <Plus /> {L('Publicar producto', 'Publish product')}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder={L('Buscar por nombre o código…', 'Search by name or code…')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="no-scrollbar overflow-x-auto">
            <Segmented
              value={estado}
              onChange={setEstado}
              options={[
                { value: 'all', label: `${t('common.all')} · ${counts.all}` },
                { value: 'activo', label: `${t('estado.activo')} · ${counts.activo}` },
                { value: 'vendido', label: `${t('estado.vendido')} · ${counts.vendido}` },
                { value: 'vencido', label: `${t('estado.vencido')} · ${counts.vencido}` },
              ]}
            />
          </div>
          <Select value={cat} onValueChange={setCat} className="lg:w-44" ariaLabel={t('common.category')} options={[{ value: 'all', label: L('Todas las categorías', 'All categories') }, ...CATEGORIAS.map((c) => ({ value: c, label: t(catKey(c)) }))]} />
        </div>
        {filtered.length ? (
          <ProductTable items={filtered} now={now} mode="merchant" pageSize={10} highlightId={highlight} />
        ) : (
          <EmptyState
            icon={<Package />}
            title={t('common.noResults')}
            action={
              <Button variant="secondary" onClick={() => { setQ(''); setCat('all'); setEstado('all') }}>
                {t('common.clearFilters')}
              </Button>
            }
          />
        )}
      </Card>
      <div className="mt-3 text-center text-xs text-text-2 sm:hidden">
        <button className="font-semibold text-acento" onClick={() => navigate('/mi-negocio/productos/nuevo')}>
          {L('Abrir formulario en pantalla completa', 'Open full-screen form')}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>{L('Publicar producto', 'Publish product')}</DialogTitle>
          <DialogDescription>{L('Aparece en el mapa de los clientes cercanos apenas lo guardás.', 'It shows up on nearby customers’ map as soon as you save it.')}</DialogDescription>
          <div className="mt-5">
            <ProductForm onDone={onPublished} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

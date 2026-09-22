import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Package, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { CATEGORIAS, effectiveEstado, inPeriod, vencMs } from '@/domain/selectors'
import { Card, EmptyState, KpiCard, PageHeader, PreviewBanner } from '@/components/shared/all'
import { Select } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/form'
import { catKey } from '@/i18n/enums'
import { ProductTable } from '@/features/shared/ProductTable'
import { downloadCsv, normalize } from '@/lib/utils'
import { HOUR } from '@/domain/dates'
import { formatNumber } from '@/domain/money'

type EstadoFilter = 'all' | 'activo' | 'vendido' | 'vencido' | 'baja'

export default function ProductosAdmin() {
  const d = useData()
  const now = useNow()
  const { t, L, b, lang } = useT()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<EstadoFilter>((params.get('estado') as EstadoFilter) || 'activo')
  const [cat, setCat] = useState('all')
  const urgOnly = params.get('urgentes') === '1'
  const comercios = useMemo(() => new Map(d.comercios.map((c) => [c.id, c])), [d.comercios])

  // vista del período: activos + los del último mes
  const base = useMemo(() => d.productos.filter((p) => p.estado === 'activo' || inPeriod(p.vencimiento, now) || inPeriod(p.publicadoEl, now)), [d.productos, now])
  const counts = useMemo(() => {
    const c = { activo: 0, vendido: 0, vencido: 0, baja: 0, urg: 0 }
    for (const p of base) {
      if (p.dadoDeBaja) c.baja++
      else {
        const e = effectiveEstado(p, now)
        c[e]++
        if (e === 'activo' && vencMs(p) - now < 6 * HOUR) c.urg++
      }
    }
    return c
  }, [base, now])

  const filtered = useMemo(() => {
    const nq = normalize(q)
    return base
      .filter((p) => {
        if (estado === 'baja') return !!p.dadoDeBaja
        if (estado !== 'all' && (p.dadoDeBaja || effectiveEstado(p, now) !== estado)) return false
        if (cat !== 'all' && p.categoria !== cat) return false
        if (urgOnly && !(effectiveEstado(p, now) === 'activo' && !p.dadoDeBaja && vencMs(p) - now < 6 * HOUR)) return false
        if (nq && !normalize(`${b(p.nombre)} ${p.codigo} ${comercios.get(p.comercioId)?.nombre ?? ''}`).includes(nq)) return false
        return true
      })
      .sort((a, b2) => (estado === 'activo' || urgOnly ? vencMs(a) - vencMs(b2) : b2.publicadoEl.localeCompare(a.publicadoEl)))
  }, [base, estado, cat, urgOnly, q, now, b, comercios])

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Moderación de publicaciones con reglas por categoría', 'Listing moderation with per-category rules'),
          L('Detección de precios fuera de rango', 'Out-of-range price detection'),
          L('Notificación automática al comercio al dar de baja', 'Automatic shop notification on removal'),
        ]}
      />
      <PageHeader
        kicker={L('PLATAFORMA', 'PLATFORM')}
        title={L('Productos de la plataforma', 'Platform products')}
        subtitle={L('Todos los comercios, en un solo lugar. Podés dar de baja por incumplimiento.', 'All shops in one place. You can remove listings for policy violations.')}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv('soe-productos.csv', [
                ['Código', 'Producto', 'Comercio', 'Categoría', 'Moneda', 'Precio original', 'Descuento %', 'Precio final', 'Vencimiento', 'Estado'],
                ...filtered.map((p) => [p.codigo, b(p.nombre), comercios.get(p.comercioId)?.nombre ?? '', t(catKey(p.categoria)), p.moneda, (p.precioOriginalCents / 100).toFixed(2), p.descuentoPct, (p.precioFinalCents / 100).toFixed(2), p.vencimiento, p.dadoDeBaja ? 'baja' : effectiveEstado(p, now)]),
              ])
              toast.success(L('CSV exportado', 'CSV exported'))
            }}
          >
            <Download /> {t('common.export')}
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={L('Activos', 'Live')} value={formatNumber(counts.activo, lang)} tone="acento" onClick={() => setEstado('activo')} />
        <KpiCard label={L('Vendidos (mes)', 'Sold (month)')} value={formatNumber(counts.vendido, lang)} tone="ok" onClick={() => setEstado('vendido')} />
        <KpiCard label={L('Vencidos (mes)', 'Expired (month)')} value={formatNumber(counts.vencido, lang)} tone="danger" onClick={() => setEstado('vencido')} />
        <KpiCard
          label={L('Por vencer <6h', 'Expiring <6h')}
          value={counts.urg}
          tone="warning"
          onClick={() => {
            setEstado('activo')
            setParams(urgOnly ? {} : { urgentes: '1' }, { replace: true })
          }}
        />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder={L('Buscar por producto, código o comercio…', 'Search by product, code or shop…')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <Select
              value={estado}
              onValueChange={(v) => setEstado(v as EstadoFilter)}
              className="md:w-40"
              ariaLabel={t('common.status')}
              options={[
                { value: 'all', label: L('Todos los estados', 'All statuses') },
                { value: 'activo', label: t('estado.activo') },
                { value: 'vendido', label: t('estado.vendido') },
                { value: 'vencido', label: t('estado.vencido') },
                { value: 'baja', label: t('estado.baja') },
              ]}
            />
            <Select value={cat} onValueChange={setCat} className="md:w-44" ariaLabel={t('common.category')} options={[{ value: 'all', label: L('Todas las categorías', 'All categories') }, ...CATEGORIAS.map((c) => ({ value: c, label: t(catKey(c)) }))]} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[10px] border border-border px-3 py-2 text-xs font-semibold">
            <Checkbox checked={urgOnly} onCheckedChange={(v) => setParams(v === true ? { urgentes: '1' } : {}, { replace: true })} /> {L('Vencen en <6h', 'Expire in <6h')}
          </label>
        </div>
        {filtered.length ? (
          <ProductTable items={filtered} now={now} mode="admin" comercios={comercios} pageSize={12} />
        ) : (
          <EmptyState icon={<Package />} title={t('common.noResults')} action={<Button variant="secondary" onClick={() => { setQ(''); setCat('all'); setEstado('all'); setParams({}) }}>{t('common.clearFilters')}</Button>} />
        )}
      </Card>
    </div>
  )
}

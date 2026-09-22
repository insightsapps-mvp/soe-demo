import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ChevronRight, Download, Power, Search, Store } from 'lucide-react'
import { toast } from 'sonner'
import { useData, useDispatch, useNow } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { approvedInPeriod, CATEGORIAS, isLive, vencMs } from '@/domain/selectors'
import { Badge, Card, EmptyState, PageHeader, Pager, PreviewBanner, Table, Td, Th, usePaged, KpiCard } from '@/components/shared/all'
import { Select } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/form'
import { catKey } from '@/i18n/enums'
import { CITIES } from '@/config/brand'
import { DAY, HOUR } from '@/domain/dates'
import { formatMoney, formatNumber } from '@/domain/money'
import { downloadCsv, normalize } from '@/lib/utils'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Comercio } from '@/domain/types'

export function useComerciosRows() {
  const d = useData()
  const now = useNow()
  return useMemo(() => {
    const tx = approvedInPeriod(d, now)
    const vend = new Map<string, number>()
    const usd = new Map<string, number>()
    for (const t of tx) {
      vend.set(t.comercioId, (vend.get(t.comercioId) ?? 0) + 1)
      usd.set(t.comercioId, (usd.get(t.comercioId) ?? 0) + t.montoUsdCents)
    }
    const live = new Map<string, number>()
    const urg = new Map<string, number>()
    for (const p of d.productos) {
      if (!isLive(p, now)) continue
      live.set(p.comercioId, (live.get(p.comercioId) ?? 0) + 1)
      if (vencMs(p) - now < 6 * HOUR) urg.set(p.comercioId, (urg.get(p.comercioId) ?? 0) + 1)
    }
    return d.comercios.map((c) => ({
      c,
      activos: live.get(c.id) ?? 0,
      vendidos: vend.get(c.id) ?? 0,
      usd: usd.get(c.id) ?? 0,
      urgentes: urg.get(c.id) ?? 0,
      idle: now - new Date(c.ultimaActividad).getTime() > 7 * DAY,
    }))
  }, [d, now])
}

export function ComercioStatus({ c, urgentes }: { c: Comercio; urgentes: number }) {
  const { t } = useT()
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {c.activo ? <Badge tone="solidOk">{t('comercio.activo')}</Badge> : <Badge tone="neutral">{t('comercio.inactivo')}</Badge>}
      {urgentes >= 3 && c.activo && (
        <Badge tone="solidDanger" pulse>
          {t('comercio.urgente')}
        </Badge>
      )}
    </div>
  )
}

export default function Comercios() {
  const { t, L, lang } = useT()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [params, setParams] = useSearchParams()
  const rows = useComerciosRows()
  const [q, setQ] = useState('')
  const [city, setCity] = useState('all')
  const [cat, setCat] = useState('all')
  const urgOnly = params.get('urgentes') === '1'
  const idleOnly = params.get('inactivos') === '1'
  const [confirm, setConfirm] = useState<Comercio | null>(null)

  const filtered = useMemo(() => {
    const nq = normalize(q)
    return rows
      .filter((r) => (!nq || normalize(r.c.nombre + ' ' + r.c.zona).includes(nq)) && (city === 'all' || r.c.ciudad === city) && (cat === 'all' || r.c.categoria === cat))
      .filter((r) => (!urgOnly || r.urgentes > 0) && (!idleOnly || r.idle))
      .sort((a, b) => b.urgentes - a.urgentes || b.vendidos - a.vendidos)
  }, [rows, q, city, cat, urgOnly, idleOnly])
  const paged = usePaged(filtered, 12)
  const setFlag = (k: string, v: boolean) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, '1')
    else p.delete(k)
    setParams(p, { replace: true })
  }
  const activos = rows.filter((r) => r.c.activo).length

  return (
    <div>
      <PreviewBanner
        bullets={[
          L('Alta de comercios con verificación de RIF', 'Shop onboarding with tax-ID (RIF) verification'),
          L('Aviso automático a comercios inactivos', 'Automatic nudges to inactive shops'),
          L('Historial de cambios por comercio', 'Change history per shop'),
        ]}
      />
      <PageHeader
        kicker={L('PLATAFORMA', 'PLATFORM')}
        title={t('nav.comercios')}
        subtitle={L('{a} activos de {n} comercios registrados.', '{a} active of {n} registered shops.', { a: activos, n: rows.length })}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv('soe-comercios.csv', [
                ['Comercio', 'Ciudad', 'Zona', 'Categoría', 'Activos', 'Vendidos mes', 'Ingresos USD', 'Estado'],
                ...filtered.map((r) => [r.c.nombre, r.c.ciudad, r.c.zona, t(catKey(r.c.categoria)), r.activos, r.vendidos, (r.usd / 100).toFixed(2), r.c.activo ? 'Activo' : 'Inactivo']),
              ])
              toast.success(L('CSV exportado', 'CSV exported'))
            }}
          >
            <Download /> {t('common.export')}
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={L('Activos', 'Active')} value={activos} tone="ok" />
        <KpiCard label={L('Con urgentes', 'With urgent items')} value={rows.filter((r) => r.urgentes > 0).length} tone="danger" onClick={() => setFlag('urgentes', !urgOnly)} />
        <KpiCard label={L('Sin actividad 7+ días', 'Inactive 7+ days')} value={rows.filter((r) => r.idle && r.c.activo).length} tone="warning" onClick={() => setFlag('inactivos', !idleOnly)} />
        <KpiCard label={L('Ciudades', 'Cities')} value={new Set(rows.map((r) => r.c.ciudad)).size} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder={L('Buscar comercio o zona…', 'Search shop or area…')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <Select value={city} onValueChange={setCity} className="md:w-40" ariaLabel={t('common.city')} options={[{ value: 'all', label: L('Todas las ciudades', 'All cities') }, ...CITIES.map((c) => ({ value: c, label: c }))]} />
            <Select value={cat} onValueChange={setCat} className="md:w-44" ariaLabel={t('common.category')} options={[{ value: 'all', label: L('Todas las categorías', 'All categories') }, ...CATEGORIAS.map((c) => ({ value: c, label: t(catKey(c)) }))]} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[10px] border border-border px-3 py-2 text-xs font-semibold">
            <Checkbox checked={urgOnly} onCheckedChange={(v) => setFlag('urgentes', v === true)} />
            <AlertTriangle className="h-3.5 w-3.5 text-danger" /> {L('Con productos urgentes', 'With urgent products')}
          </label>
          {idleOnly && (
            <Button size="sm" variant="soft" onClick={() => setFlag('inactivos', false)}>
              {L('Sin actividad 7+ días', 'Inactive 7+ days')} ✕
            </Button>
          )}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Store />} title={t('common.noResults')} action={<Button variant="secondary" onClick={() => { setQ(''); setCity('all'); setCat('all'); setParams({}) }}>{t('common.clearFilters')}</Button>} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>{t('common.shop')}</Th>
                  <Th>{t('common.category')}</Th>
                  <Th align="right">{L('Productos activos', 'Live products')}</Th>
                  <Th align="right">{L('Vendidos (mes)', 'Sold (month)')}</Th>
                  <Th align="right">{L('Ingresos', 'Revenue')}</Th>
                  <Th>{t('common.status')}</Th>
                  <Th align="right">{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {paged.rows.map((r) => (
                  <tr key={r.c.id} className="cursor-pointer transition hover:bg-bg-2" onClick={() => navigate(`/comercios/${r.c.id}`)}>
                    <Td>
                      <div className="font-semibold">{r.c.nombre}</div>
                      <div className="text-xs text-text-2">
                        {r.c.zona}, {r.c.ciudad}
                        {r.idle && <span className="ml-1.5 font-semibold text-[rgb(var(--warning))]">· {L('sin actividad', 'inactive')}</span>}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone="neutral">{t(catKey(r.c.categoria))}</Badge>
                    </Td>
                    <Td align="right">
                      <span className="num font-semibold">{r.activos}</span>
                      {r.urgentes > 0 && <span className="num ml-1.5 text-xs font-bold text-danger">({r.urgentes} &lt;6h)</span>}
                    </Td>
                    <Td align="right" className="num">{formatNumber(r.vendidos, lang)}</Td>
                    <Td align="right" className="num text-text-2">{formatMoney(r.usd, 'USD', lang)}</Td>
                    <Td>
                      <ComercioStatus c={r.c} urgentes={r.urgentes} />
                    </Td>
                    <Td align="right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="iconSm"
                          variant="ghost"
                          title={r.c.activo ? L('Desactivar', 'Deactivate') : L('Activar', 'Activate')}
                          onClick={() => (r.c.activo ? setConfirm(r.c) : (dispatch({ type: 'comercioActivo', id: r.c.id, activo: true, at: new Date().toISOString() }), toast.success(L('{n} activado', '{n} activated', { n: r.c.nombre }))))}
                        >
                          <Power className={r.c.activo ? 'text-danger' : 'text-ok'} />
                        </Button>
                        <Button size="iconSm" variant="ghost" onClick={() => navigate(`/comercios/${r.c.id}`)}>
                          <ChevronRight />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pager page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} />
          </>
        )}
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={L('¿Desactivar {n}?', 'Deactivate {n}?', { n: confirm?.nombre ?? '' })}
        description={L('Sus productos dejan de mostrarse a los clientes hasta que lo reactives.', 'Its products stop showing to customers until you reactivate it.')}
        confirmLabel={L('Desactivar comercio', 'Deactivate shop')}
        tone="danger"
        onConfirm={() => {
          if (!confirm) return
          dispatch({ type: 'comercioActivo', id: confirm.id, activo: false, at: new Date().toISOString() })
          toast.success(L('{n} desactivado', '{n} deactivated', { n: confirm.nombre }))
        }}
      />
    </div>
  )
}

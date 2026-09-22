import type { Transaccion } from '@/domain/types'
import { useT } from '@/i18n/useT'
import { Table, Td, Th, TxStatusBadge, Pager, usePaged, initialsOf, Avatar } from '@/components/shared/all'
import { formatMoney } from '@/domain/money'
import { metodoKey } from '@/i18n/enums'
import { fmtDateTime } from '@/domain/dates'
import { MethodLogo } from './MethodLogo'
import { useData } from '@/store/useDemoStore'
import { useMemo } from 'react'

export function TxTable({ items, onOpen, showComercio, showCliente = true, initialsOnly, pageSize = 12 }: {
  items: Transaccion[]
  onOpen: (t: Transaccion) => void
  showComercio?: boolean
  showCliente?: boolean
  initialsOnly?: boolean
  pageSize?: number
}) {
  const { t, L, b, lang } = useT()
  const d = useData()
  const prodById = useMemo(() => new Map(d.productos.map((p) => [p.id, p])), [d.productos])
  const comById = useMemo(() => new Map(d.comercios.map((c) => [c.id, c])), [d.comercios])
  const paged = usePaged(items, pageSize)
  const cliente = (n: string) => (n === 'Venta en tienda' ? L('Venta en tienda', 'In-store sale') : n)
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>{L('ID / Fecha', 'ID / Date')}</Th>
            <Th>{t('common.product')}</Th>
            {showComercio && <Th>{t('common.shop')}</Th>}
            {showCliente && <Th>{t('common.customer')}</Th>}
            <Th>{t('common.method')}</Th>
            <Th align="right">{t('common.amount')}</Th>
            <Th>{t('common.status')}</Th>
          </tr>
        </thead>
        <tbody>
          {paged.rows.map((x) => {
            const p = prodById.get(x.productoId)
            return (
              <tr key={x.id} onClick={() => onOpen(x)} className="cursor-pointer transition hover:bg-bg-2">
                <Td>
                  <div className="num text-xs font-semibold">{x.id}</div>
                  <div className="text-[11px] text-text-2">{fmtDateTime(x.fecha, lang)}</div>
                </Td>
                <Td className="max-w-[220px]">
                  <div className="truncate font-medium">{p ? b(p.nombre) : '—'}</div>
                </Td>
                {showComercio && <Td className="whitespace-nowrap text-text-2">{comById.get(x.comercioId)?.nombre}</Td>}
                {showCliente && (
                  <Td>
                    {initialsOnly ? (
                      <div className="flex items-center gap-2">
                        <Avatar initials={x.clienteNombre === 'Venta en tienda' ? '🏪' : initialsOf(x.clienteNombre)} tone="neutral" className="h-7 w-7 text-[10px]" />
                        {x.clienteNombre === 'Venta en tienda' && <span className="text-xs text-text-2">{cliente(x.clienteNombre)}</span>}
                      </div>
                    ) : (
                      <span className="whitespace-nowrap">{cliente(x.clienteNombre)}</span>
                    )}
                  </Td>
                )}
                <Td>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <MethodLogo m={x.metodo} size="sm" />
                    <div>
                      <div className="text-xs font-semibold">{t(metodoKey(x.metodo))}</div>
                      <div className="num text-[10.5px] text-muted">{x.moneda}</div>
                    </div>
                  </div>
                </Td>
                <Td align="right" className="whitespace-nowrap">
                  <div className="num font-bold">{formatMoney(x.montoCents, x.moneda, lang)}</div>
                  {x.moneda !== 'USD' && <div className="num text-[11px] text-text-2">≈ {formatMoney(x.montoUsdCents, 'USD', lang)}</div>}
                </Td>
                <Td>
                  <TxStatusBadge estado={x.estado} />
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <Pager page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} />
    </>
  )
}

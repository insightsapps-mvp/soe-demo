import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Card, PageHeader, PreviewBanner, DevNotice } from '@/components/shared/all'
import { ProductForm } from './ProductForm'
import type { Producto } from '@/domain/types'

export default function NuevoProducto() {
  const { L } = useT()
  const navigate = useNavigate()
  const done = useCallback((p: Producto) => navigate(`/mi-negocio/productos?nuevo=${p.id}`), [navigate])
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
      <Link to="/mi-negocio/productos" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-acento">
        <ArrowLeft className="h-3.5 w-3.5" /> {L('Tus productos', 'Your products')}
      </Link>
      <PageHeader kicker={L('PORTAL', 'PORTAL')} title={L('Publicar producto', 'Publish product')} subtitle={L('Aparece en el mapa de los clientes cercanos apenas lo guardás.', 'It shows up on nearby customers’ map as soon as you save it.')} />
      <Card className="p-5 sm:p-6">
        <ProductForm onDone={done} />
      </Card>
    </div>
  )
}

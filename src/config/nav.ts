import { CreditCard, Coins, Heart, LayoutDashboard, MapPin, Package, Receipt, ShoppingBag, Sparkles, Store, type LucideIcon } from 'lucide-react'
import type { Role } from '@/domain/types'
import type { DictKey } from '@/i18n/dict'

export interface NavItem {
  id: string
  label: DictKey
  icon: LucideIcon
  path: string
  /** coincidencia exacta de la ruta para el estado activo */
  exact?: boolean
}
export interface NavSection {
  id: string
  label: DictKey
  items: NavItem[]
}

const COMERCIAL: NavSection = {
  id: 'comercial',
  label: 'nav.comercial',
  items: [{ id: 'propuesta', label: 'nav.propuesta', icon: Receipt, path: '/propuesta' }],
}
const AGENTE: NavSection = {
  id: 'inteligencia',
  label: 'nav.inteligencia',
  items: [{ id: 'agente', label: 'nav.agente', icon: Sparkles, path: '/agente' }],
}

/** ORDEN DEL NAV — ley para sidebar, tour y mobile */
export const NAV: Record<Role, NavSection[]> = {
  admin: [
    COMERCIAL,
    {
      id: 'plataforma',
      label: 'nav.plataforma',
      items: [
        { id: 'dashboard', label: 'nav.dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'comercios', label: 'nav.comercios', icon: Store, path: '/comercios' },
        { id: 'productos-admin', label: 'nav.productos', icon: Package, path: '/productos' },
        { id: 'transacciones', label: 'nav.transacciones', icon: CreditCard, path: '/transacciones' },
        { id: 'monedas', label: 'nav.monedas', icon: Coins, path: '/monedas' },
      ],
    },
    AGENTE,
  ],
  comercio: [
    COMERCIAL,
    {
      id: 'minegocio',
      label: 'nav.minegocio',
      items: [
        { id: 'mi-dashboard', label: 'nav.miDashboard', icon: LayoutDashboard, path: '/mi-negocio', exact: true },
        { id: 'mis-productos', label: 'nav.misProductos', icon: Package, path: '/mi-negocio/productos' },
        { id: 'mis-ventas', label: 'nav.misVentas', icon: Receipt, path: '/mi-negocio/ventas' },
      ],
    },
    AGENTE,
  ],
  cliente: [
    COMERCIAL,
    {
      id: 'explorar',
      label: 'nav.explorarSec',
      items: [
        { id: 'explorar', label: 'nav.explorar', icon: MapPin, path: '/explorar' },
        { id: 'favoritos', label: 'nav.favoritos', icon: Heart, path: '/favoritos' },
        { id: 'mis-compras', label: 'nav.misCompras', icon: ShoppingBag, path: '/mis-compras' },
      ],
    },
    AGENTE,
  ],
}

export const flatNav = (role: Role) => NAV[role].flatMap((s) => s.items)

/** 4 accesos principales del bottom-nav mobile (el resto va en "Más") */
export const BOTTOM_NAV: Record<Role, string[]> = {
  admin: ['dashboard', 'comercios', 'transacciones', 'propuesta'],
  comercio: ['mi-dashboard', 'mis-productos', 'mis-ventas', 'propuesta'],
  cliente: ['explorar', 'favoritos', 'mis-compras', 'propuesta'],
}

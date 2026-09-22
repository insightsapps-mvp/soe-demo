import type { Role } from '@/domain/types'

/** Prefijos de ruta permitidos por rol (además de /propuesta y /agente, comunes) */
const ALLOWED: Record<Role, string[]> = {
  admin: ['/dashboard', '/comercios', '/productos', '/transacciones', '/monedas'],
  comercio: ['/mi-negocio'],
  cliente: ['/explorar', '/favoritos', '/mis-compras'],
}
const COMMON = ['/propuesta', '/agente']

export function canAccess(role: Role, path: string) {
  const match = (p: string) => path === p || path.startsWith(p + '/')
  return COMMON.some(match) || ALLOWED[role].some(match)
}

/** Rol "dueño" de una ruta — para que un link de la propuesta cambie de vista automáticamente */
export function roleForPath(path: string): Role | null {
  for (const r of Object.keys(ALLOWED) as Role[]) {
    if (ALLOWED[r].some((p) => path === p || path.startsWith(p + '/'))) return r
  }
  return null
}

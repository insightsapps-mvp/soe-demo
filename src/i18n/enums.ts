import type { Categoria, EstadoProducto, EstadoTransaccion, MetodoPago } from '@/domain/types'
import type { DictKey } from './dict'

export const catKey = (c: Categoria) => `cat.${c}` as DictKey
export const estadoKey = (e: EstadoProducto) => `estado.${e}` as DictKey
export const metodoKey = (m: MetodoPago) => `metodo.${m}` as DictKey
export const txKey = (e: EstadoTransaccion) => `tx.${e}` as DictKey

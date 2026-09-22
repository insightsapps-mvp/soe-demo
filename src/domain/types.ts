export type Cents = number
export type ISODate = string
export type Role = 'admin' | 'comercio' | 'cliente'
export type Categoria = 'alimentos' | 'panaderia' | 'lacteos' | 'bebidas' | 'moda' | 'cosmeticos'
export type EstadoProducto = 'activo' | 'vendido' | 'vencido'
export type MetodoPago = 'binance' | 'zelle' | 'pago_movil'
export type Moneda = 'VES' | 'USD' | 'USDT'
export type EstadoTransaccion = 'aprobado' | 'pendiente' | 'rechazado'
export type Lang = 'es' | 'en'
/** Texto bilingüe [es, en] */
export type Bi = [string, string]

export interface Comercio {
  id: string
  nombre: string
  categoria: Categoria
  ciudad: string
  zona: string
  direccion: string
  horario: Bi
  activo: boolean
  lat: number
  lng: number
  hero: boolean
  ultimaActividad: ISODate
  vistas: number
}

export interface Producto {
  id: string
  comercioId: string
  codigo: string
  nombre: Bi
  categoria: Categoria
  descripcion: Bi
  precioOriginalCents: Cents
  descuentoPct: number
  precioFinalCents: Cents
  moneda: Moneda
  pesoGr: number
  vencimiento: ISODate
  estado: EstadoProducto
  fotos: string[]
  lat: number
  lng: number
  publicadoEl: ISODate
  vistas: number
  bajaMotivo?: string
  /** Si se dio de baja administrativamente */
  dadoDeBaja?: boolean
}

export interface WebhookEvent {
  paso: 'recibido' | 'validado' | 'confirmado' | 'reintento' | 'fallido'
  fecha: ISODate
  detalle: Bi
}

export interface Transaccion {
  id: string
  productoId: string
  comercioId: string
  clienteId: string
  clienteNombre: string
  metodo: MetodoPago
  moneda: Moneda
  montoCents: Cents
  montoUsdCents: Cents
  ahorroUsdCents: Cents
  pesoGr: number
  categoria: Categoria
  estado: EstadoTransaccion
  fecha: ISODate
  tasaCambioAplicada: number
  comisionUsdCents: Cents
  webhook: WebhookEvent[]
}

export interface Cliente {
  id: string
  nombre: string
  ciudad: string
  zona: string
  lat: number
  lng: number
  favoritos: string[]
}

export interface TasaCambio {
  par: 'VES_USD' | 'USD_USDT'
  valor: number
  actualizadaEl: ISODate
  fuente: 'BCV' | 'CoinGecko'
}

export interface TasaHistorica {
  fecha: ISODate
  VES_USD: number
  USD_USDT: number
}

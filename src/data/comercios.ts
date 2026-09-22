import type { Bi, Categoria } from '@/domain/types'

export interface ZonaDef {
  ciudad: string
  zona: string
  lat: number
  lng: number
}

/** Zonas por ciudad con coordenadas aproximadas */
export const ZONAS: ZonaDef[] = [
  // Caracas — mayor concentración (cliente héroe vive en Chacao)
  { ciudad: 'Caracas', zona: 'Chacao', lat: 10.4955, lng: -66.8538 },
  { ciudad: 'Caracas', zona: 'Altamira', lat: 10.4989, lng: -66.8461 },
  { ciudad: 'Caracas', zona: 'Los Palos Grandes', lat: 10.5003, lng: -66.8409 },
  { ciudad: 'Caracas', zona: 'La Castellana', lat: 10.5009, lng: -66.8527 },
  { ciudad: 'Caracas', zona: 'El Rosal', lat: 10.4916, lng: -66.8611 },
  { ciudad: 'Caracas', zona: 'Las Mercedes', lat: 10.4818, lng: -66.8583 },
  { ciudad: 'Caracas', zona: 'Sabana Grande', lat: 10.4932, lng: -66.8757 },
  { ciudad: 'Caracas', zona: 'Los Cortijos', lat: 10.4889, lng: -66.8246 },
  { ciudad: 'Caracas', zona: 'Chuao', lat: 10.4843, lng: -66.8426 },
  { ciudad: 'Caracas', zona: 'Bello Monte', lat: 10.4868, lng: -66.8769 },
  { ciudad: 'Caracas', zona: 'La Florida', lat: 10.5021, lng: -66.8661 },
  { ciudad: 'Caracas', zona: 'San Bernardino', lat: 10.5132, lng: -66.8977 },
  { ciudad: 'Caracas', zona: 'La Candelaria', lat: 10.5058, lng: -66.9053 },
  { ciudad: 'Caracas', zona: 'Los Dos Caminos', lat: 10.4958, lng: -66.8298 },
  { ciudad: 'Caracas', zona: 'El Cafetal', lat: 10.4632, lng: -66.8309 },
  { ciudad: 'Caracas', zona: 'Santa Mónica', lat: 10.4786, lng: -66.8912 },
  // Valencia
  { ciudad: 'Valencia', zona: 'El Viñedo', lat: 10.1906, lng: -68.0045 },
  { ciudad: 'Valencia', zona: 'La Viña', lat: 10.1987, lng: -68.0072 },
  { ciudad: 'Valencia', zona: 'Prebo', lat: 10.2105, lng: -68.0152 },
  { ciudad: 'Valencia', zona: 'San Diego', lat: 10.2402, lng: -67.9579 },
  { ciudad: 'Valencia', zona: 'Centro', lat: 10.1621, lng: -68.0075 },
  // Maracaibo
  { ciudad: 'Maracaibo', zona: 'Bella Vista', lat: 10.6719, lng: -71.6259 },
  { ciudad: 'Maracaibo', zona: '5 de Julio', lat: 10.6621, lng: -71.6237 },
  { ciudad: 'Maracaibo', zona: 'Tierra Negra', lat: 10.6766, lng: -71.6186 },
  { ciudad: 'Maracaibo', zona: 'La Lago', lat: 10.6816, lng: -71.6049 },
  // Barquisimeto
  { ciudad: 'Barquisimeto', zona: 'Este', lat: 10.0736, lng: -69.2891 },
  { ciudad: 'Barquisimeto', zona: 'Centro', lat: 10.0647, lng: -69.3219 },
  { ciudad: 'Barquisimeto', zona: 'Cabudare', lat: 10.0302, lng: -69.2614 },
]

export interface HeroDef {
  id: string
  nombre: string
  categoria: Categoria
  ciudad: string
  zona: string
  direccion: string
  horario: Bi
  lat: number
  lng: number
  activos: number
  vendidosMes: number
  vencidosMes: number
  /** cantidad de productos que vencen en <6h */
  urgentes: number
  /** ingresos del mes fijados (USD cents) — solo si se quiere un número exacto */
  ingresosUsdCents?: number
  mix: Categoria[]
  ultimaActividadDias: number
}

export const HEROES: HeroDef[] = [
  {
    id: 'c-la-espiga', nombre: 'Panadería La Espiga', categoria: 'panaderia', ciudad: 'Caracas', zona: 'Chacao',
    direccion: 'Av. Francisco de Miranda, Edif. Centro Seguros, PB, Chacao', horario: ['Lun a Sáb 6:30–20:00 · Dom 7:00–14:00', 'Mon–Sat 6:30am–8pm · Sun 7am–2pm'],
    lat: 10.4962, lng: -66.8547, activos: 48, vendidosMes: 312, vencidosMes: 4, urgentes: 1, ingresosUsdCents: 61200,
    mix: ['panaderia', 'panaderia', 'panaderia', 'panaderia', 'lacteos'], ultimaActividadDias: 0,
  },
  {
    id: 'c-dona-carmen', nombre: 'Abasto Doña Carmen', categoria: 'alimentos', ciudad: 'Valencia', zona: 'La Viña',
    direccion: 'Av. Bolívar Norte, C.C. La Viña, Local 12, Valencia', horario: ['Lun a Dom 7:00–21:00', 'Mon–Sun 7am–9pm'],
    lat: 10.1991, lng: -68.0081, activos: 16, vendidosMes: 118, vencidosMes: 3, urgentes: 1,
    mix: ['alimentos', 'alimentos', 'lacteos', 'bebidas'], ultimaActividadDias: 0,
  },
  {
    id: 'c-el-rebano', nombre: 'Charcutería El Rebaño', categoria: 'alimentos', ciudad: 'Maracaibo', zona: 'Bella Vista',
    direccion: 'Av. 5 de Julio con Av. Bella Vista, Local 3, Maracaibo', horario: ['Lun a Sáb 8:00–19:00', 'Mon–Sat 8am–7pm'],
    lat: 10.6702, lng: -71.6271, activos: 9, vendidosMes: 64, vencidosMes: 6, urgentes: 5,
    mix: ['alimentos', 'lacteos', 'lacteos'], ultimaActividadDias: 1,
  },
  {
    id: 'c-boutique-luna', nombre: 'Boutique Luna', categoria: 'moda', ciudad: 'Barquisimeto', zona: 'Este',
    direccion: 'Av. Lara, C.C. Sambil Barquisimeto, Nivel 1, Local 44', horario: ['Lun a Dom 10:00–20:00', 'Mon–Sun 10am–8pm'],
    lat: 10.0729, lng: -69.2866, activos: 11, vendidosMes: 38, vencidosMes: 0, urgentes: 0,
    mix: ['moda'], ultimaActividadDias: 2,
  },
  {
    id: 'c-vitalis', nombre: 'Farmacia Vitalis', categoria: 'cosmeticos', ciudad: 'Caracas', zona: 'Altamira',
    direccion: '4ta Transversal de Altamira, Qta. Vitalis, Chacao', horario: ['Abierto 24 horas', 'Open 24 hours'],
    lat: 10.4981, lng: -66.8478, activos: 14, vendidosMes: 71, vencidosMes: 2, urgentes: 0,
    mix: ['cosmeticos', 'cosmeticos', 'bebidas'], ultimaActividadDias: 0,
  },
  {
    id: 'c-el-trebol', nombre: 'Fuente de Soda El Trébol', categoria: 'bebidas', ciudad: 'Valencia', zona: 'El Viñedo',
    direccion: 'Av. Monseñor Adams, El Viñedo, Valencia', horario: ['Lun a Sáb 7:00–22:00', 'Mon–Sat 7am–10pm'],
    lat: 10.1913, lng: -68.0031, activos: 10, vendidosMes: 83, vencidosMes: 2, urgentes: 1,
    mix: ['bebidas', 'panaderia', 'panaderia', 'lacteos'], ultimaActividadDias: 0,
  },
  {
    id: 'c-san-rafael', nombre: 'Mercado San Rafael', categoria: 'alimentos', ciudad: 'Maracaibo', zona: 'Tierra Negra',
    direccion: 'Calle 72 con Av. 3H, Tierra Negra, Maracaibo', horario: ['Lun a Dom 6:00–18:00', 'Mon–Sun 6am–6pm'],
    lat: 10.6771, lng: -71.6175, activos: 18, vendidosMes: 126, vencidosMes: 4, urgentes: 1,
    mix: ['alimentos', 'alimentos', 'lacteos', 'bebidas'], ultimaActividadDias: 0,
  },
  {
    id: 'c-aroma', nombre: 'Perfumería Aroma', categoria: 'cosmeticos', ciudad: 'Caracas', zona: 'Las Mercedes',
    direccion: 'Calle París, Las Mercedes, Edif. Aroma, PB', horario: ['Lun a Sáb 9:30–19:30', 'Mon–Sat 9:30am–7:30pm'],
    lat: 10.4822, lng: -66.8569, activos: 12, vendidosMes: 45, vencidosMes: 0, urgentes: 0,
    mix: ['cosmeticos'], ultimaActividadDias: 0,
  },
]

export const PREFIJOS: Record<Categoria, string[]> = {
  panaderia: ['Panadería', 'Pastelería', 'Panificadora', 'Dulcería'],
  alimentos: ['Abasto', 'Bodegón', 'Frutería', 'Carnicería', 'Mercadito', 'Charcutería'],
  lacteos: ['Quesera', 'Lácteos', 'Charcutería'],
  bebidas: ['Fuente de Soda', 'Café', 'Juguería', 'Licorería'],
  moda: ['Boutique', 'Tienda', 'Moda', 'Zapatería'],
  cosmeticos: ['Farmacia', 'Perfumería', 'Beauty Store', 'Droguería'],
}

export const NOMBRES_COMERCIO = [
  'El Buen Pan', 'Santa Rosa', 'Los Andes', 'La Candelaria', 'El Samán', 'Mi Llanura', 'La Guadalupana', 'Don Pedro',
  'El Cují', 'La Ceiba', 'Las Delicias', 'El Tropezón', 'Mis Tres Hermanos', 'La Fe', 'El Portal', 'Doña Rosa',
  'La Esquina', 'Araguaney', 'Los Próceres', 'El Ávila', 'Morrocoy', 'La Colonia', 'San José', 'El Paraíso',
  'Canaima', 'Los Robles', 'Margarita', 'La Estrella', 'Mi Terruño', 'El Rincón', 'Bella Vista', 'Los Olivos',
  'Galipán', 'El Hatillo', 'La Pastora', 'Guayana', 'La Tinaja', 'El Trigal', 'La Primavera', 'Tres Palmas',
  'El Manantial', 'Cumaná', 'La Victoria', 'El Sol', 'Mi Casa', 'Los Caobos', 'La Trinidad', 'Lucero',
  'Sol de Oriente', 'La Montaña', 'El Carmen', 'Paraguaná', 'Los Mangos', 'El Cacao', 'Orinoco', 'La Floresta',
  'El Recreo', 'Brisas del Lago', 'Santa Inés', 'El Encanto', 'Mérida', 'La Hacienda', 'Vainilla', 'Canela',
  'Coromoto', 'La Palmita', 'El Molino', 'Punto Fresco', 'Luz de Luna', 'Nube Azul', 'Aurora', 'El Pilar',
  'Las Acacias', 'Mi Ranchito', 'El Cardón', 'La Guajira', 'Chachopo', 'Onoto',
]

export const NOMBRES_PERSONAS = [
  'María José Pérez', 'Carlos Rodríguez', 'Andreína Gómez', 'Luis Hernández', 'Daniela Márquez', 'José Gregorio Díaz',
  'Valentina Rojas', 'Miguel Ángel Suárez', 'Gabriela Castillo', 'Rafael Mendoza', 'Oriana Blanco', 'Jesús Colmenares',
  'Mariana Salazar', 'Pedro Pablo Rivas', 'Carolina Fuentes', 'Alejandro Chacón', 'Isabel Guerrero', 'Ricardo Parra',
  'Fernanda Quintero', 'Jorge Luis Medina', 'Ana Karina Vargas', 'Eduardo Pacheco', 'Rosa Elena Contreras', 'Samuel Ortega',
  'Patricia Brito', 'Héctor Villalobos', 'Yelitza Moreno', 'Wilmer Acosta', 'Nathalie Sánchez', 'Orlando Figueroa',
  'Lisbeth Padrón', 'Freddy Montilla', 'Beatriz Urdaneta', 'Ronald Cedeño', 'Maryuri Linares', 'Armando Bello',
  'Johana Peña', 'Víctor Manuel Zambrano', 'Stefany Aguilar', 'Leonardo Tovar', 'Rebeca Palacios', 'Gustavo Silva',
  'Keila Montero', 'Raúl Carrillo', 'Adriana Lugo', 'Francisco Pinto', 'Milagros Ramírez', 'César Álvarez',
]

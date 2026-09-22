import type { Bi, Categoria } from '@/domain/types'

export interface ProductoTpl {
  nombre: Bi
  descripcion: Bi
  /** rango de precio original en USD (unidades) */
  usd: [number, number]
  /** peso en gramos (0 para no-alimentos) */
  gr: number
  emoji: string
  /** rango de descuento típico */
  desc: [number, number]
}

export const CATALOGO: Record<Categoria, ProductoTpl[]> = {
  panaderia: [
    { nombre: ['Canilla artesanal (x3)', 'Artisan canilla bread (x3)'], descripcion: ['Horneadas esta mañana. Crujientes por fuera, suaves por dentro.', 'Baked this morning. Crunchy outside, soft inside.'], usd: [1.4, 2.2], gr: 450, emoji: '🥖', desc: [30, 50] },
    { nombre: ['Pan de jamón mini', 'Mini ham bread'], descripcion: ['Relleno de jamón, tocineta, aceitunas y pasas. Ideal para compartir.', 'Filled with ham, bacon, olives and raisins. Great for sharing.'], usd: [3.5, 6], gr: 500, emoji: '🍞', desc: [25, 45] },
    { nombre: ['Cachitos de jamón (x6)', 'Ham croissants (x6)'], descripcion: ['Cachitos del día, perfectos para el desayuno.', "Today's croissants, perfect for breakfast."], usd: [3, 4.5], gr: 540, emoji: '🥐', desc: [30, 50] },
    { nombre: ['Pan dulce de guayaba', 'Guava sweet bread'], descripcion: ['Pan suave con relleno de guayaba y queso crema.', 'Soft bread with guava and cream cheese filling.'], usd: [1.8, 2.8], gr: 350, emoji: '🍞', desc: [30, 55] },
    { nombre: ['Torta de chocolate (porción x4)', 'Chocolate cake (4 slices)'], descripcion: ['Bizcocho húmedo con ganache. Vence hoy, rinde perfecto.', 'Moist sponge with ganache. Expires today, still perfect.'], usd: [5, 8], gr: 600, emoji: '🍰', desc: [35, 60] },
    { nombre: ['Pan campesino integral', 'Whole-wheat country loaf'], descripcion: ['Masa madre con harina integral y semillas.', 'Sourdough with whole-wheat flour and seeds.'], usd: [2.5, 3.8], gr: 700, emoji: '🍞', desc: [25, 45] },
    { nombre: ['Golfeados (x4)', 'Golfeados (x4)'], descripcion: ['Espirales de papelón y anís con queso de mano.', 'Panela and anise swirls with fresh cheese.'], usd: [3, 4.2], gr: 420, emoji: '🥮', desc: [30, 50] },
    { nombre: ['Bolsa sorpresa de panadería', 'Bakery surprise bag'], descripcion: ['Lo que quedó del día: panes, dulces y galletas. Siempre rinde.', "What's left of the day: breads, pastries and cookies."], usd: [4, 6], gr: 900, emoji: '🛍️', desc: [50, 65] },
  ],
  alimentos: [
    { nombre: ['Combo de frutas de temporada', 'Seasonal fruit combo'], descripcion: ['Mango, lechosa y cambur maduros, listos para consumir.', 'Ripe mango, papaya and banana, ready to eat.'], usd: [3, 5], gr: 2500, emoji: '🥭', desc: [35, 55] },
    { nombre: ['Aguacates maduros (x4)', 'Ripe avocados (x4)'], descripcion: ['Punto justo para hoy o mañana.', 'Perfect for today or tomorrow.'], usd: [2.5, 4], gr: 1200, emoji: '🥑', desc: [30, 50] },
    { nombre: ['Pechuga de pollo (1 kg)', 'Chicken breast (1 kg)'], descripcion: ['Refrigerada, vence en 24h. Mantener en frío.', 'Refrigerated, expires in 24h. Keep cold.'], usd: [5, 7], gr: 1000, emoji: '🍗', desc: [25, 40] },
    { nombre: ['Carne molida (1 kg)', 'Ground beef (1 kg)'], descripcion: ['Molida del día, ideal para congelar.', "Today's grind, great for freezing."], usd: [6, 8.5], gr: 1000, emoji: '🥩', desc: [20, 40] },
    { nombre: ['Jamón de pierna (500 g)', 'Leg ham (500 g)'], descripcion: ['Rebanado, al vacío. Vence pronto.', 'Sliced, vacuum packed. Expires soon.'], usd: [4, 6], gr: 500, emoji: '🥓', desc: [30, 50] },
    { nombre: ['Caja de verduras mixtas', 'Mixed vegetable box'], descripcion: ['Tomate, pimentón, cebolla y cilantro. Aún frescos.', 'Tomato, bell pepper, onion and cilantro. Still fresh.'], usd: [3, 5], gr: 3000, emoji: '🥬', desc: [35, 60] },
    { nombre: ['Arepas precocidas (x10)', 'Pre-cooked arepas (x10)'], descripcion: ['Listas para el budare. Hechas ayer.', 'Ready for the griddle. Made yesterday.'], usd: [2.5, 3.5], gr: 1100, emoji: '🫓', desc: [30, 45] },
    { nombre: ['Pescado fresco (1 kg)', 'Fresh fish (1 kg)'], descripcion: ['Pargo del día, limpio y porcionado.', "Today's snapper, cleaned and portioned."], usd: [7, 10], gr: 1000, emoji: '🐟', desc: [25, 40] },
    { nombre: ['Plátanos maduros (x6)', 'Ripe plantains (x6)'], descripcion: ['Perfectos para tajadas o tostones dulces.', 'Perfect for sweet fried plantains.'], usd: [2, 3], gr: 1800, emoji: '🍌', desc: [35, 55] },
  ],
  lacteos: [
    { nombre: ['Queso blanco llanero (1 kg)', 'Llanero white cheese (1 kg)'], descripcion: ['Queso duro de la zona, ideal para arepas.', 'Local hard cheese, great with arepas.'], usd: [5, 7.5], gr: 1000, emoji: '🧀', desc: [25, 45] },
    { nombre: ['Leche completa (x2 L)', 'Whole milk (2 L)'], descripcion: ['Pasteurizada, vence en 2 días.', 'Pasteurized, expires in 2 days.'], usd: [2.4, 3.2], gr: 2000, emoji: '🥛', desc: [25, 40] },
    { nombre: ['Yogurt natural (x4)', 'Plain yogurt (x4)'], descripcion: ['Sin azúcar añadida. Mantener refrigerado.', 'No added sugar. Keep refrigerated.'], usd: [3, 4], gr: 800, emoji: '🥣', desc: [30, 50] },
    { nombre: ['Queso de mano (500 g)', 'Fresh hand cheese (500 g)'], descripcion: ['Hecho ayer, suave y lechoso.', 'Made yesterday, soft and milky.'], usd: [3.5, 5], gr: 500, emoji: '🧀', desc: [30, 50] },
    { nombre: ['Nata fresca (250 g)', 'Fresh cream (250 g)'], descripcion: ['Nata criolla para untar.', 'Local cream for spreading.'], usd: [1.8, 2.6], gr: 250, emoji: '🥛', desc: [30, 45] },
  ],
  bebidas: [
    { nombre: ['Jugo natural de naranja (1 L)', 'Fresh orange juice (1 L)'], descripcion: ['Exprimido hoy, sin conservantes.', 'Squeezed today, no preservatives.'], usd: [2, 3], gr: 1000, emoji: '🍊', desc: [30, 50] },
    { nombre: ['Batidos del día (x2)', "Today's smoothies (x2)"], descripcion: ['Fresa y parchita. Consumir hoy.', 'Strawberry and passion fruit. Drink today.'], usd: [3, 4.5], gr: 800, emoji: '🥤', desc: [35, 55] },
    { nombre: ['Café molido artesanal (250 g)', 'Artisan ground coffee (250 g)'], descripcion: ['Tueste medio de los Andes. Mejor antes del fin de mes.', 'Medium roast from the Andes. Best before month end.'], usd: [4, 6], gr: 250, emoji: '☕', desc: [20, 35] },
    { nombre: ['Malta (six pack)', 'Malt soda (six pack)'], descripcion: ['Lote con fecha próxima.', 'Batch close to its date.'], usd: [3.5, 5], gr: 2100, emoji: '🍺', desc: [20, 35] },
    { nombre: ['Chicha criolla (1 L)', 'Rice chicha (1 L)'], descripcion: ['Hecha en casa, con canela.', 'Homemade, with cinnamon.'], usd: [2.5, 3.5], gr: 1000, emoji: '🥛', desc: [30, 45] },
    { nombre: ['Agua de coco (x3)', 'Coconut water (x3)'], descripcion: ['Natural, vence en 3 días.', 'Natural, expires in 3 days.'], usd: [3, 4], gr: 1500, emoji: '🥥', desc: [25, 40] },
  ],
  moda: [
    { nombre: ['Vestido de lino — temporada pasada', "Linen dress — last season"], descripcion: ['Talla M. Colección anterior, nuevo con etiqueta.', 'Size M. Previous collection, new with tags.'], usd: [28, 45], gr: 0, emoji: '👗', desc: [40, 60] },
    { nombre: ['Franela de algodón', 'Cotton T-shirt'], descripcion: ['Tallas S a XL. Liquidación de colección.', 'Sizes S to XL. Collection clearance.'], usd: [9, 14], gr: 0, emoji: '👕', desc: [35, 55] },
    { nombre: ['Jean clásico', 'Classic jeans'], descripcion: ['Corte recto, último lote de la temporada.', 'Straight cut, last batch of the season.'], usd: [22, 32], gr: 0, emoji: '👖', desc: [35, 50] },
    { nombre: ['Sandalias de cuero', 'Leather sandals'], descripcion: ['Talla 38. Cambio de temporada.', 'Size 38. End of season.'], usd: [18, 30], gr: 0, emoji: '👡', desc: [40, 60] },
    { nombre: ['Zapatos deportivos', 'Sneakers'], descripcion: ['Modelo del año pasado, sin uso.', "Last year's model, unused."], usd: [30, 48], gr: 0, emoji: '👟', desc: [35, 55] },
    { nombre: ['Bolso tejido', 'Woven bag'], descripcion: ['Hecho a mano, última unidad.', 'Handmade, last unit.'], usd: [20, 34], gr: 0, emoji: '👜', desc: [30, 50] },
  ],
  cosmeticos: [
    { nombre: ['Protector solar FPS 50', 'Sunscreen SPF 50'], descripcion: ['Vence en 2 meses. Sellado.', 'Expires in 2 months. Sealed.'], usd: [12, 18], gr: 0, emoji: '🧴', desc: [35, 55] },
    { nombre: ['Labial mate', 'Matte lipstick'], descripcion: ['Tonos nude. Lote con fecha próxima.', 'Nude shades. Batch close to its date.'], usd: [7, 12], gr: 0, emoji: '💄', desc: [40, 60] },
    { nombre: ['Crema hidratante facial', 'Facial moisturizer'], descripcion: ['Piel mixta. Vence en 45 días.', 'Combination skin. Expires in 45 days.'], usd: [14, 22], gr: 0, emoji: '🧴', desc: [35, 55] },
    { nombre: ['Perfume 50 ml — tester', 'Perfume 50 ml — tester'], descripcion: ['Fragancia floral, caja sin celofán.', 'Floral fragrance, unsealed box.'], usd: [30, 55], gr: 0, emoji: '🌸', desc: [40, 60] },
    { nombre: ['Shampoo + acondicionador', 'Shampoo + conditioner'], descripcion: ['Kit de 400 ml, fecha próxima.', '400 ml kit, near its date.'], usd: [9, 14], gr: 0, emoji: '🧼', desc: [35, 50] },
    { nombre: ['Vitamina C (30 tabletas)', 'Vitamin C (30 tablets)'], descripcion: ['Vence el mes próximo.', 'Expires next month.'], usd: [6, 10], gr: 0, emoji: '💊', desc: [30, 50] },
  ],
}

export const CAT_EMOJI: Record<Categoria, string> = {
  panaderia: '🥐', alimentos: '🥑', lacteos: '🧀', bebidas: '🥤', moda: '👗', cosmeticos: '💄',
}

/** Gradiente de la "foto" ilustrada por categoría */
export const CAT_GRADIENT: Record<Categoria, [string, string]> = {
  panaderia: ['#FFE3C2', '#F9B97A'],
  alimentos: ['#DDF3D5', '#9FD68C'],
  lacteos: ['#FFF6D6', '#F3DB8A'],
  bebidas: ['#FFE0D3', '#FFA98A'],
  moda: ['#E6E3FF', '#B6ADF5'],
  cosmeticos: ['#FFE0EC', '#F5A3C3'],
}

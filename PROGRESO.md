# PROGRESO — MVP Soe (demo preview)

> Leer esto primero al retomar. Luego `git log --oneline -5` → `npm run build`.

## Completado
- **B0 · Setup** — Vite 5 + React 18 + TS strict + Tailwind 3 (tokens light/dark en CSS vars), fuentes Inter/JetBrains Mono, anti-flash en `index.html`, `render.yaml` (static), `public/_redirects`. Todas las deps de build en `dependencies`.
- **B1 · Dominio** — `src/domain` (types, money en centavos, dates, geo/haversine, fx, selectors, integrity, sales), i18n `{clave:[es,en]}` + `useT()` (t / L / b), mulberry32.
- **B2 · Datos** — `src/data/seed.ts`: 86 comercios (8 héroe), 312 activos, 1.847 vendidos (30 días) con transacción aprobada c/u, 63 vencidos, 14 urgentes <6h (5 en Charcutería El Rebaño), 3.860 kg y $18.420 de ahorro **derivados** de transacciones; La Espiga 48 activos / 312 vendidos / $612 / 3 vencen hoy; María José 12 compras / $86. `assertDemoIntegrity` corre en dev tras cada mutación.
- **B3 · Shell** — Login 2 columnas, sidebar sticky 248px con bloque inferior (switcher → CTA → usuario), topbar, bottom-nav + Sheet mobile, guard por rol (auto-cambia de vista si se abre una ruta de otro rol).
- **B4** — Dashboard admin (6 KPIs, ahorro 6 meses, ventas por categoría, "Necesita atención", mapa por ciudad, top comercios, export PDF) + Comercios (listado, filtros, detalle, desactivar con confirmación, edge case El Rebaño).
- **B5** — Productos (admin, baja con motivo), Transacciones (filtros, distribución por método, detalle con log de webhook y reintento), Monedas (tasas, historial 7d, conversión, config fuente/frecuencia, tasa por venta).
- **B6** — Mi Dashboard, ★ Mis Productos (alta con validación ≤70%, preview en vivo, fotos locales, editor en línea, marcar vendido con animación, baja, CSV real), Mis Ventas.
- **B7** — ★ Explorar (Leaflet + radio 1-10 km, categorías, orden, historial de búsqueda, alerta 48 h de favoritos, estado vacío), detalle + checkout (método + moneda con recálculo en vivo), Favoritos, Mis compras.
- **B8** — ★ Propuesta (circuito, 5 módulos con "Ver en el demo", inversión oculta por defecto, cierre).
- **B9** — Agente IA (responder por keywords sobre selectores, widget + /agente, deriva el monto a la Propuesta).
- **B10** — Welcome modal + tour por rol (máscara SVG, scrollIntoView + reintentos, Sheet abierto en mobile).
- **B11** — Modo Trailer (9 escenas, cursor virtual con click() real, captions de vidrio, loop, datos efímeros).

## En curso (QA hecho en navegador)
- B12 · QA: login→propuesta→welcome→tour, dashboard admin, compra en checkout (Binance/USDT), publicar producto (aparece en vivo), agente en EN, propuesta EN con inversión revelada, mobile 375 en Explorar, trailer completo. Fixes: tiles OSM (CARTO pedía key), mezcla de categorías, loop del trailer, titular del login en 2 líneas.

## Pendiente
- Crear repo en GitHub (org developers-insights) — requiere confirmación del usuario.

## Decisiones
- El proyecto vive en `Documents/soe-demo` (repo propio), separado de `club-diplomatico`.
- "Este mes" = últimos 30 días relativos al día real (evita dashboards vacíos a principio de mes).
- Tasa de conversión = ventas aprobadas / visitas al detalle (contador que sube al abrir un producto).
- Kilos salvados solo cuentan categorías de alimentos (alimentos, panadería, lácteos, bebidas).
- Fotos de producto: ilustración por categoría (gradiente + emoji) para no depender de CDNs; las fotos subidas se guardan como dataURL reducido.
- Mapas: tiles CARTO Voyager (sin API key).
- Venta en mostrador (comercio marca "vendido") genera una transacción aprobada Pago Móvil/VES "Venta en tienda" para mantener la integridad.
- Si se navega a una ruta de otro rol (links de la Propuesta), la vista cambia sola a ese rol.

## Bloqueos
- Ninguno.

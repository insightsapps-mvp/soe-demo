import { useCallback, useMemo, useRef, useState } from 'react'
import { ImagePlus, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Categoria, Moneda, Producto } from '@/domain/types'
import { useData, useDispatch, newId } from '@/store/useDemoStore'
import { useT } from '@/i18n/useT'
import { Field, Segmented, Select, Slider } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CATEGORIAS } from '@/domain/selectors'
import { catKey } from '@/i18n/enums'
import { applyDiscount, formatMoney } from '@/domain/money'
import { MAX_DISCOUNT_PCT } from '@/config/brand'
import { convert, ratesFrom } from '@/domain/fx'
import { ProductImage } from '@/components/shared/all'
import { CAT_EMOJI } from '@/data/productos'
import { HOUR } from '@/domain/dates'
import { cn } from '@/lib/utils'
import { HERO_COMERCIO_ID } from '@/data/seed'

const toLocalInput = (ms: number) => {
  const d = new Date(ms)
  return new Date(ms - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

async function resizeImage(file: File, max = 520): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const s = Math.min(1, max / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * s)
    canvas.height = Math.round(img.height * s)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.78)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function ProductForm({ onDone, comercioId = HERO_COMERCIO_ID }: { onDone: (p: Producto) => void; comercioId?: string }) {
  const { t, L, lang } = useT()
  const d = useData()
  const dispatch = useDispatch()
  const comercio = d.comercios.find((c) => c.id === comercioId)!
  const rates = useMemo(() => ratesFrom(d.tasas), [d.tasas])
  const fileRef = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState<Categoria>('panaderia')
  const [descripcion, setDescripcion] = useState('')
  const [codigo, setCodigo] = useState(() => `LAE-${String(Math.floor(Math.random() * 9000) + 1000)}`)
  const [precio, setPrecio] = useState('')
  const [moneda, setMoneda] = useState<Moneda>('VES')
  const [pct, setPct] = useState(40)
  const [venc, setVenc] = useState(() => toLocalInput(Date.now() + 10 * HOUR))
  const [fotos, setFotos] = useState<string[]>([])
  const [touched, setTouched] = useState(false)

  const precioCents = Math.round(Number(precio.replace(',', '.') || 0) * 100)
  const finalCents = applyDiscount(precioCents, Math.min(pct, 100))
  const vencMs = new Date(venc).getTime()
  const errors = {
    nombre: nombre.trim().length < 3 ? L('Escribí un nombre (mín. 3 letras)', 'Enter a name (min. 3 letters)') : null,
    precio: precioCents <= 0 ? L('Ingresá el precio original', 'Enter the original price') : null,
    pct: pct < 1 ? L('El descuento mínimo es 1%', 'Minimum discount is 1%') : pct > MAX_DISCOUNT_PCT ? L('Máximo permitido: {m}%', 'Maximum allowed: {m}%', { m: MAX_DISCOUNT_PCT }) : null,
    venc: !Number.isFinite(vencMs) || vencMs <= Date.now() + 15 * 60000 ? L('Debe vencer al menos en 15 minutos', 'Must expire at least 15 minutes from now') : null,
  }
  const valid = !Object.values(errors).some(Boolean)

  const autofill = useCallback(() => {
    setNombre(lang === 'es' ? 'Pan de guayaba y queso (x4)' : 'Guava & cheese bread (x4)')
    setCategoria('panaderia')
    setDescripcion(lang === 'es' ? 'Horneados esta mañana. Suaves, con guayaba casera y queso de mano.' : 'Baked this morning. Soft, with homemade guava and fresh cheese.')
    setPrecio('1200')
    setMoneda('VES')
    setPct(45)
    setVenc(toLocalInput(Date.now() + 9 * HOUR))
  }, [lang])

  const submit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      setTouched(true)
      if (!valid) {
        toast.error(L('Revisá los campos marcados', 'Check the highlighted fields'))
        return
      }
      const now = new Date()
      const p: Producto = {
        id: newId('p'),
        comercioId,
        codigo: codigo.trim() || `LAE-${Math.floor(Math.random() * 9000) + 1000}`,
        nombre: [nombre.trim(), nombre.trim()],
        categoria,
        descripcion: [descripcion.trim() || nombre.trim(), descripcion.trim() || nombre.trim()],
        precioOriginalCents: precioCents,
        descuentoPct: pct,
        precioFinalCents: finalCents,
        moneda,
        pesoGr: ['moda', 'cosmeticos'].includes(categoria) ? 0 : 600,
        vencimiento: new Date(vencMs).toISOString(),
        estado: 'activo',
        fotos: fotos.length ? fotos : [CAT_EMOJI[categoria]],
        lat: comercio.lat,
        lng: comercio.lng,
        publicadoEl: now.toISOString(),
        vistas: 0,
      }
      dispatch({ type: 'publish', producto: p })
      toast.success(L('Publicado · ya está visible en Soe', 'Published · now live on Soe'), {
        description: L('Los clientes cerca de {z} ya lo ven en el mapa.', 'Customers near {z} can already see it on the map.', { z: comercio.zona }),
      })
      onDone(p)
    },
    [L, categoria, codigo, comercio, comercioId, descripcion, dispatch, finalCents, fotos, moneda, nombre, onDone, pct, precioCents, valid, vencMs],
  )

  const other: Moneda = moneda === 'VES' ? 'USD' : 'VES'

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-acento/40 bg-acento-soft/50 px-3 py-2">
          <span className="text-xs text-text-2">{L('¿Apurado? Probá con un ejemplo.', 'In a hurry? Try an example.')}</span>
          <Button type="button" size="sm" variant="soft" onClick={autofill} data-trailer="autofill">
            <Wand2 /> {L('Autocompletar ejemplo', 'Fill example')}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label={L('Nombre del producto', 'Product name')} error={touched ? errors.nombre : null}>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={L('Ej: Canilla artesanal (x3)', 'E.g. Artisan bread (x3)')} />
          </Field>
          <Field label={L('Código / SKU', 'Code / SKU')}>
            <input className="input num" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          </Field>
        </div>
        <Field label={t('common.category')}>
          <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)} className="w-full" options={CATEGORIAS.map((c) => ({ value: c, label: t(catKey(c)) }))} />
        </Field>
        <Field label={L('Descripción', 'Description')} hint={L('Contá por qué sigue estando bueno.', 'Tell why it is still good.')}>
          <textarea className="input h-20 resize-none py-2" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L('Precio original', 'Original price')} error={touched ? errors.precio : null}>
            <div className="flex gap-2">
              <input className="input num" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0,00" />
              <Segmented value={moneda} onChange={(v) => setMoneda(v)} options={[{ value: 'VES', label: 'Bs' }, { value: 'USD', label: 'USD' }]} />
            </div>
          </Field>
          <Field label={L('Vence el', 'Expires on')} error={touched ? errors.venc : null}>
            <input type="datetime-local" className="input" value={venc} onChange={(e) => setVenc(e.target.value)} />
          </Field>
        </div>
        <Field label={L('Descuento', 'Discount')} error={errors.pct} hint={L('Tope permitido por la plataforma: {m}%', 'Platform cap: {m}%', { m: MAX_DISCOUNT_PCT })}>
          <div className="flex items-center gap-3">
            <Slider value={[Math.min(pct, 90)]} min={5} max={90} step={1} onValueChange={([v]) => setPct(v)} className={pct > MAX_DISCOUNT_PCT ? '[&_.bg-acento]:bg-danger' : ''} />
            <div className="relative w-24 shrink-0">
              <input
                className={cn('input num pr-7 text-right font-bold', pct > MAX_DISCOUNT_PCT && 'border-danger text-danger focus:border-danger focus:ring-danger/20')}
                inputMode="numeric"
                value={pct}
                onChange={(e) => setPct(Math.max(0, Math.min(99, Math.round(Number(e.target.value) || 0))))}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-2">%</span>
            </div>
          </div>
        </Field>
        <div>
          <div className="mb-1.5 text-xs font-semibold">{L('Fotos', 'Photos')}</div>
          <div className="flex flex-wrap gap-2">
            {fotos.map((f, i) => (
              <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                <img src={f} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setFotos((x) => x.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {fotos.length < 4 && (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-[10px] font-semibold text-text-2 transition hover:border-acento hover:text-acento">
                <ImagePlus className="h-5 w-5" /> {L('Subir', 'Upload')}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []).slice(0, 4 - fotos.length)
                const out = await Promise.all(files.map((f) => resizeImage(f).catch(() => null)))
                setFotos((x) => [...x, ...(out.filter(Boolean) as string[])])
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </div>

      {/* Preview en vivo */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="label-xs mb-2">{L('Así lo ve el cliente', 'How customers see it')}</div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="relative">
            <ProductImage foto={fotos[0] ?? CAT_EMOJI[categoria]} categoria={categoria} className="h-36 w-full" />
            <span className="num absolute left-2 top-2 rounded-full bg-ok px-2 py-0.5 text-[11px] font-bold text-white">-{pct}%</span>
          </div>
          <div className="p-3.5">
            <div className="truncate text-sm font-bold">{nombre || L('Nombre del producto', 'Product name')}</div>
            <div className="text-xs text-text-2">{comercio.nombre} · 0,1 km</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="num text-lg font-bold text-acento">{formatMoney(finalCents, moneda, lang)}</span>
              <span className="num text-xs text-muted line-through">{formatMoney(precioCents, moneda, lang)}</span>
            </div>
            <div className="num mt-0.5 text-[11px] text-text-2">≈ {formatMoney(convert(finalCents, moneda, other, rates), other, lang)}</div>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-bg-2 p-3 text-xs">
          <div className="flex justify-between">
            <span className="text-text-2">{L('El cliente ahorra', 'Customer saves')}</span>
            <span className="num font-bold text-ok">{formatMoney(precioCents - finalCents, moneda, lang)}</span>
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-3 w-full" data-trailer="guardar-producto">
          <Sparkles /> {L('Publicar ahora', 'Publish now')}
        </Button>
      </div>
    </form>
  )
}

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useT'
import { useTour, WELCOME_KEY, welcomeSeen } from './useTour'
import { useTrailer } from '@/trailer/useTrailer'
import { BrandMark } from '@/components/layout/Sidebar'

/** Aparece ~400ms después del login, una vez por sesión. No se cierra clickeando afuera. */
export function WelcomeModal() {
  const { L } = useT()
  const trailer = useTrailer((s) => s.running)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (trailer || welcomeSeen()) return
    const t = setTimeout(() => setOpen(true), 400)
    return () => clearTimeout(t)
  }, [trailer])

  const go = () => {
    try {
      sessionStorage.setItem(WELCOME_KEY, '1')
    } catch {
      /* noop */
    }
    setOpen(false)
    useTour.getState().setWelcomeDone(true)
    setTimeout(() => useTour.getState().start(), 350)
  }

  return (
    <Dialog open={open && !trailer}>
      <DialogContent
        hideClose
        className="max-w-[520px] p-7 sm:p-8"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <BrandMark />
        <DialogTitle className="mt-6 text-[26px] font-extrabold tracking-tight">{L('Hola Soe 👋', 'Hi Soe 👋')}</DialogTitle>
        <DialogDescription className="mt-2 text-[15px] font-medium text-text">
          {L(
            'Somos Juan y Fede de Insights. Construimos este MVP para que veas tu plataforma funcionando antes de invertir.',
            'We’re Juan and Fede from Insights. We built this MVP so you can see your platform working before investing.',
          )}
        </DialogDescription>
        <p className="mt-4 text-sm leading-relaxed text-text-2">
          {L(
            'Soe conecta a los comercios que tienen productos por vencer con la gente que vive cerca. El comercio carga el producto con su descuento, el cliente lo encuentra en el mapa por categoría y distancia, y paga como prefiera — Binance, Zelle o Pago Móvil. Vos ves todo desde el panel de administración: cuántos comercios están activos, cuánto se vendió y cuánta comida se salvó.',
            'Soe connects shops that have products close to expiry with the people who live nearby. The shop uploads the product with its discount, the customer finds it on the map by category and distance, and pays however they prefer — Binance, Zelle or Pago Móvil. You see everything from the admin panel: how many shops are active, how much was sold and how much food was saved.',
          )}
        </p>
        <p className="mt-4 text-sm italic text-text-2">
          {L('Si te gusta lo que ves, hacé clic en "Ver la plataforma" y arrancamos.', 'If you like what you see, click "See the platform" and let’s get going.')}
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={go}>
          {L('Ver la plataforma', 'See the platform')} <ArrowRight />
        </Button>
      </DialogContent>
    </Dialog>
  )
}

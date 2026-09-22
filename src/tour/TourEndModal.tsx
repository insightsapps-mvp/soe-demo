import { PartyPopper } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useT'
import { useTour } from './useTour'
import { WHATSAPP_URL } from '@/config/brand'
import { WhatsAppIcon } from '@/components/shared/all'

export function TourEndModal() {
  const { L, t } = useT()
  const open = useTour((s) => s.endOpen)
  const setOpen = useTour((s) => s.setEndOpen)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-acento-soft text-acento">
          <PartyPopper className="h-7 w-7" />
        </div>
        <DialogTitle className="mt-4 text-xl">{L('¡Listo! Ya conocés Soe', 'Done! Now you know Soe')}</DialogTitle>
        <DialogDescription className="mx-auto max-w-sm">
          {L('Recorré cada módulo por tu cuenta, cambiá de vista con el switcher o relanzá el tour cuando quieras desde el botón ✨ Tour.', 'Explore each module on your own, switch views with the switcher, or relaunch the tour anytime from the ✨ Tour button.')}
        </DialogDescription>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {L('Explorar por mi cuenta', 'Explore on my own')}
          </Button>
          <Button asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <WhatsAppIcon className="h-4 w-4" /> {t('cta.want')}
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

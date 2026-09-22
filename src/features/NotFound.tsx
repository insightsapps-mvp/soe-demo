import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/shared/all'
import { WHATSAPP_URL } from '@/config/brand'
import { BrandMark } from '@/components/layout/Sidebar'

export default function NotFound() {
  const { L } = useT()
  return (
    <div className="glow-bg flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <BrandMark />
      <div className="num mt-10 text-[96px] font-bold leading-none tracking-tighter text-acento">404</div>
      <div className="mt-2 flex items-center gap-2 text-xl font-extrabold">
        <Compass className="h-5 w-5 text-acento" /> {L('Esta página se venció antes de tiempo', 'This page expired early')}
      </div>
      <p className="mt-2 max-w-md text-sm text-text-2">{L('No encontramos lo que buscabas, pero la propuesta completa sigue fresquita.', 'We couldn’t find what you were looking for, but the full proposal is still fresh.')}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild variant="secondary">
          <Link to="/propuesta">
            <ArrowLeft /> {L('Volver a la propuesta', 'Back to the proposal')}
          </Link>
        </Button>
        <Button asChild>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="h-4 w-4" /> {L('Hablemos por WhatsApp', "Let's talk on WhatsApp")}
          </a>
        </Button>
      </div>
    </div>
  )
}

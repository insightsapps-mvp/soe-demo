import { Sparkles } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { PreviewBanner } from '@/components/shared/all'
import { AssistantChat } from './AssistantChat'

export default function AgentPage() {
  const { L } = useT()
  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-5 sm:px-6 lg:px-8">
        <PreviewBanner
          bullets={[
            L('Respuestas generadas con IA sobre datos reales', 'AI-generated answers over real data'),
            L('Alertas proactivas por WhatsApp', 'Proactive WhatsApp alerts'),
            L('Resumen semanal automático para el equipo', 'Automatic weekly summary for the team'),
          ]}
        />
      </div>
      <div className="mx-auto flex w-full max-w-[1320px] min-h-0 flex-1 flex-col px-4 pb-4 sm:px-6 lg:px-8">
        <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-acento-soft to-card px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-acento text-white shadow-glow">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="kicker">{L('INTELIGENCIA', 'INTELLIGENCE')}</div>
              <h1 className="text-lg font-extrabold tracking-tight">{L('Paula · Agente de IA', 'Paula · AI Agent')}</h1>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <AssistantChat big />
          </div>
        </div>
      </div>
    </div>
  )
}

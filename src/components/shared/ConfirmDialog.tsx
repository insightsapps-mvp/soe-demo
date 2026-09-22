import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useT'

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, tone = 'primary', onConfirm, children, requireText,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  tone?: 'primary' | 'danger' | 'ok'
  onConfirm: (text: string) => void
  children?: React.ReactNode
  /** si se pasa, pide un motivo (textarea) antes de confirmar */
  requireText?: string
}) {
  const { t } = useT()
  const [text, setText] = useState('')
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setText('')
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        {children}
        {requireText && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold">{requireText}</span>
            <textarea className="input h-20 resize-none py-2" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={tone}
            disabled={!!requireText && text.trim().length < 3}
            onClick={() => {
              onConfirm(text.trim())
              setText('')
              onOpenChange(false)
            }}
          >
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

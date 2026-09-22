import * as React from 'react'
import * as D from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = D.Root
export const DialogTrigger = D.Trigger
export const DialogClose = D.Close

/**
 * Regla A: centrado con `fixed inset-0 m-auto h-fit`, nunca translate -50%.
 * La animación usa scale/opacity como propiedades individuales (CSS `scale`), no `transform`.
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof D.Content>,
  React.ComponentPropsWithoutRef<typeof D.Content> & { hideClose?: boolean; overlayClassName?: string }
>(({ className, children, hideClose, overlayClassName, ...props }, ref) => (
  <D.Portal>
    <D.Overlay className={cn('soe-overlay fixed inset-0 z-[80] bg-black/55 backdrop-blur-[3px]', overlayClassName)} />
    <D.Content
      ref={ref}
      className={cn(
        'soe-modal fixed inset-0 z-[81] m-auto h-fit max-h-[88vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-pop outline-none',
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <D.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-text-2 transition hover:bg-bg-2 hover:text-text" aria-label="Close">
          <X className="h-4 w-4" />
        </D.Close>
      )}
    </D.Content>
  </D.Portal>
))
DialogContent.displayName = 'DialogContent'

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof D.Title>>(({ className, ...p }, ref) => (
  <D.Title ref={ref} className={cn('text-lg font-bold tracking-tight', className)} {...p} />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof D.Description>>(
  ({ className, ...p }, ref) => <D.Description ref={ref} className={cn('mt-1 text-sm text-text-2', className)} {...p} />,
)
DialogDescription.displayName = 'DialogDescription'

/** Sheet lateral (mobile nav) */
export const SheetContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content> & { side?: 'left' | 'right' }>(
  ({ className, children, side = 'left', ...props }, ref) => (
    <D.Portal>
      <D.Overlay className="soe-overlay fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]" />
      <D.Content
        ref={ref}
        className={cn(
          'fixed inset-y-0 z-[81] flex w-[86vw] max-w-[300px] flex-col bg-card shadow-pop outline-none',
          side === 'left' ? 'soe-sheet-left left-0 border-r' : 'soe-sheet-right right-0 border-l',
          className,
        )}
        {...props}
      >
        {children}
      </D.Content>
    </D.Portal>
  ),
)
SheetContent.displayName = 'SheetContent'

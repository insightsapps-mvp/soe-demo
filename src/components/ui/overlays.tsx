import * as React from 'react'
import * as P from '@radix-ui/react-popover'
import * as T from '@radix-ui/react-tooltip'
import * as M from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

// Popover
export const Popover = P.Root
export const PopoverTrigger = P.Trigger
export const PopoverContent = React.forwardRef<React.ElementRef<typeof P.Content>, React.ComponentPropsWithoutRef<typeof P.Content>>(
  ({ className, align = 'center', sideOffset = 6, ...props }, ref) => (
    <P.Portal>
      <P.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn('soe-pop z-[90] w-64 rounded-xl border border-border bg-card p-3 text-sm shadow-pop outline-none', className)}
        {...props}
      />
    </P.Portal>
  ),
)
PopoverContent.displayName = 'PopoverContent'

// Tooltip
export const TooltipProvider = T.Provider
export const Tooltip = T.Root
export const TooltipTrigger = T.Trigger
export const TooltipContent = React.forwardRef<React.ElementRef<typeof T.Content>, React.ComponentPropsWithoutRef<typeof T.Content>>(
  ({ className, sideOffset = 6, ...props }, ref) => (
    <T.Portal>
      <T.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn('soe-pop z-[95] rounded-lg bg-text px-2.5 py-1.5 text-xs font-medium text-bg shadow-pop', className)}
        {...props}
      />
    </T.Portal>
  ),
)
TooltipContent.displayName = 'TooltipContent'

// Dropdown
export const DropdownMenu = M.Root
export const DropdownMenuTrigger = M.Trigger
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof M.Content>, React.ComponentPropsWithoutRef<typeof M.Content>>(
  ({ className, sideOffset = 6, ...props }, ref) => (
    <M.Portal>
      <M.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn('soe-pop z-[90] min-w-[220px] rounded-xl border border-border bg-card p-1.5 shadow-pop', className)}
        {...props}
      />
    </M.Portal>
  ),
)
DropdownMenuContent.displayName = 'DropdownMenuContent'
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof M.Item>, React.ComponentPropsWithoutRef<typeof M.Item>>(
  ({ className, ...props }, ref) => (
    <M.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text outline-none transition data-[highlighted]:bg-bg-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-text-2',
        className,
      )}
      {...props}
    />
  ),
)
DropdownMenuItem.displayName = 'DropdownMenuItem'
export const DropdownMenuSeparator = () => <M.Separator className="my-1 h-px bg-border" />
export const DropdownMenuLabel = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted', className)} {...p} />
)

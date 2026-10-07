'use client'

import { useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons along the bottom, right-aligned. */
  footer?: React.ReactNode
  /** False while something is saving: Escape, the close button and clicks outside do nothing. */
  dismissible?: boolean
  width?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

const WIDTH = { sm: 'max-w-[400px]', md: 'max-w-[460px]', lg: 'max-w-[600px]' } as const

/**
 * The dashboard's dialog: a white sheet (radius 20, like the app's sheets) that rises and scales in over a soft scrim,
 * and leaves the same way. Focus stays inside while it is open; Escape closes it. Keeps showing its last content
 * while it animates out, so callers can clear their state on close.
 */
export function Modal({ open, onClose, title, description, footer, dismissible = true, width = 'md', children }: ModalProps) {
  const last = useRef({ title, description, footer, children })
  if (open) last.current = { title, description, footer, children }
  const shown = last.current

  const block = (e: Event) => {
    if (!dismissible) e.preventDefault()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && dismissible && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
          <Dialog.Content
            onEscapeKeyDown={block}
            onPointerDownOutside={block}
            onInteractOutside={block}
            className={cn(
              'pointer-events-auto relative w-full rounded-[20px] bg-white p-6 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35)] outline-none',
              'duration-300 ease-swift data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-3',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
              WIDTH[width],
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Dialog.Title className="font-display text-xl font-bold leading-[26px] tracking-[-0.01em] text-ink">{shown.title}</Dialog.Title>
                {shown.description ? (
                  <Dialog.Description className="mt-1 text-sm text-ink-2">{shown.description}</Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">{typeof shown.title === 'string' ? shown.title : 'Dialog'}</Dialog.Description>
                )}
              </div>
              {dismissible && (
                <Dialog.Close
                  aria-label="Close"
                  className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
                >
                  <X size={16} />
                </Dialog.Close>
              )}
            </div>
            {shown.children && <div className="mt-5">{shown.children}</div>}
            {shown.footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{shown.footer}</div>}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { displayFont } from '@/components/landing/fonts'
import { cn } from '@/lib/utils'
import { SideNav, type NavSection } from './SideNav'
import { TopBar } from './TopBar'

/**
 * The frame around every admin page: the navy side bar (a slide-in drawer below 1024 px), the top bar and the grey
 * canvas the pages sit on. Loads the landing page's heading face, so `font-display` works on every page.
 */
export function DashboardShell({ section, place, userName, userEmail, children }: {
  section: NavSection
  place: string
  userName: string
  userEmail: string
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = { section, place, userName, userEmail }

  return (
    <div className={cn(displayFont.variable, 'flex h-[100dvh] w-full overflow-hidden bg-canvas font-sans text-ink')}>
      <aside className="hidden shrink-0 lg:block">
        <SideNav {...nav} />
      </aside>

      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className={cn(
              displayFont.variable,
              'fixed inset-y-0 left-0 z-50 shadow-2xl outline-none lg:hidden',
              'duration-300 ease-swift data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=closed]:duration-200',
            )}
          >
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <SideNav {...nav} onNavigate={() => setMenuOpen(false)} />
            <Dialog.Close aria-label="Close menu" className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
              <X size={18} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar section={section} place={place} onMenu={() => setMenuOpen(true)} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto focus:outline-none">
          <div className="mx-auto w-full max-w-[1280px] px-5 pb-12 pt-7 lg:px-8 lg:pt-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

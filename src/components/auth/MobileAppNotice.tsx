'use client'

import { useState } from 'react'
import { Smartphone } from 'lucide-react'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { Modal } from '@/components/dashboard/Modal'
import { AppleIcon, GooglePlayIcon } from '@/components/landing/StoreIcons'

/** Under the sign-in forms: drivers and parents use the phone apps, with a dialog about where to get them. */
export function MobileAppNotice() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-5 border-t border-line pt-5 text-center">
      <p className="mb-3 text-[13px] text-ink-2">Driver or parent? Use the mobile app.</p>
      <ActionButton variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        <Smartphone />
        Get the RouteyAI app
      </ActionButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Use the mobile app"
        description="Drivers and parents sign in on their phone."
        width="sm"
        footer={<ActionButton variant="plain" onClick={() => setOpen(false)}>Back</ActionButton>}
      >
        <p className="mb-4 text-sm text-ink-2">The apps are in final testing. Your school will tell you as soon as they are in the stores.</p>
        <div className="flex gap-2">
          <span className="flex flex-1 items-center gap-2.5 rounded-xl bg-night px-3.5 py-2.5 text-white">
            <AppleIcon size={18} />
            <span className="text-left leading-tight">
              <span className="block text-[11px] text-white/70">Coming soon</span>
              <span className="block text-sm font-semibold">App Store</span>
            </span>
          </span>
          <span className="flex flex-1 items-center gap-2.5 rounded-xl bg-night px-3.5 py-2.5 text-white">
            <GooglePlayIcon size={18} />
            <span className="text-left leading-tight">
              <span className="block text-[11px] text-white/70">Coming soon</span>
              <span className="block text-sm font-semibold">Google Play</span>
            </span>
          </span>
        </div>
      </Modal>
    </div>
  )
}

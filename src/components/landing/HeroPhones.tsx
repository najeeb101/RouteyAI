'use client'

import { useEffect, useState } from 'react'
import { DriverAppScreen } from '@/components/landing/DriverAppScreen'
import { ParentAppScreen } from '@/components/landing/ParentAppScreen'

/**
 * The two apps side by side: the parent's live map in front, the driver's route behind it. The driver phone is only
 * rendered from Tailwind's `lg` up, so smaller screens don't run a second animation loop they can't show.
 *
 * The phones mount once the browser is idle, not during hydration: they run animation loops and draw maps, and
 * hydrating them with the headline blocked the main thread for over half a second on phones. The box has the phones'
 * height from the start, so nothing moves when they appear.
 */
export function HeroPhones() {
  const { desktop, ready } = useHeroState()
  return (
    <div className="relative mx-auto flex h-[37rem] w-full max-w-[24rem] justify-center lg:h-[40rem] lg:ml-auto lg:mr-0 lg:max-w-[35rem] lg:justify-end lg:[zoom:0.85]">
      {ready && desktop && (
        <div className="absolute left-[2%] top-16 -rotate-3 animate-fade-up motion-reduce:animate-none" style={{ animationDelay: '200ms' }}>
          <DriverAppScreen />
        </div>
      )}
      {ready && (
        <div className="relative animate-fade-up motion-reduce:animate-none lg:mr-6 lg:rotate-2">
          <ParentAppScreen />
        </div>
      )}
    </div>
  )
}

/** `desktop` is true from Tailwind's `lg` up; `ready` turns true once the browser is idle. Both are false on the server. */
function useHeroState() {
  const [desktop, setDesktop] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(query.matches)
    update()
    query.addEventListener('change', update)

    // Wait for the page's load event, then for an idle moment.
    let cancel = () => {}
    const show = () => setReady(true)
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(show, { timeout: 2500 })
        cancel = () => window.cancelIdleCallback(id)
      } else {
        const id = window.setTimeout(show, 1200)
        cancel = () => window.clearTimeout(id)
      }
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      query.removeEventListener('change', update)
      window.removeEventListener('load', schedule)
      cancel()
    }
  }, [])

  return { desktop, ready }
}

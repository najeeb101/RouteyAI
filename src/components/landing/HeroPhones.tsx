'use client'

import { useEffect, useState } from 'react'
import { DriverAppScreen } from '@/components/landing/DriverAppScreen'
import { ParentAppScreen } from '@/components/landing/ParentAppScreen'

/**
 * The two apps side by side: the parent's live map in front, the driver's route behind it. The driver phone is only
 * rendered from Tailwind's `lg` up, so smaller screens don't run a second animation loop they can't show.
 */
export function HeroPhones() {
  const desktop = useDesktop()
  return (
    <div className="relative mx-auto flex w-full max-w-[24rem] justify-center lg:h-[40rem] lg:max-w-none lg:justify-end">
      {desktop && (
        <div className="absolute left-[2%] top-16 -rotate-3 animate-fade-up motion-reduce:animate-none" style={{ animationDelay: '500ms' }}>
          <DriverAppScreen />
        </div>
      )}
      <div className="relative animate-fade-up motion-reduce:animate-none lg:mr-6 lg:mt-0 lg:rotate-2" style={{ animationDelay: '300ms' }}>
        <ParentAppScreen />
      </div>
    </div>
  )
}

/** True from Tailwind's `lg` breakpoint up. False during server render and hydration, so nothing mismatches. */
function useDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return desktop
}

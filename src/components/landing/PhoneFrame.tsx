import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Static phone frame around an app screenshot. */
export function PhoneFrame({ src, alt, tone }: { src: string; alt: string; tone: 'dark' | 'light' }) {
  return (
    <div className="relative h-[400px] w-[202px]">
      <div
        className={cn(
          'absolute inset-0 rounded-[2.2rem] shadow-[0_24px_48px_-24px_rgb(15_23_42/0.45)]',
          tone === 'dark' ? 'bg-slate-900' : 'bg-slate-100 ring-1 ring-slate-300'
        )}
      />
      <div className={cn('absolute left-1/2 top-3 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full', tone === 'dark' ? 'bg-slate-700' : 'bg-slate-300')} />
      <div className="absolute inset-[7px] overflow-hidden rounded-[1.85rem] bg-black">
        <Image src={src} alt={alt} fill sizes="202px" className="scale-[1.26] object-cover object-center" />
      </div>
    </div>
  )
}

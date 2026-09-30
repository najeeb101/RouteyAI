import Image from 'next/image'
import { cn } from '@/lib/utils'

/** A photo with a phone mockup overlapping one side and a few brand-coloured circles around it. */
export function AppShowcase({
  photo,
  objectPosition,
  phone,
  phoneSide,
}: {
  photo: { src: string; alt: string }
  objectPosition: string
  phone: React.ReactNode
  phoneSide: 'left' | 'right'
}) {
  const left = phoneSide === 'left'
  return (
    <div className="relative mx-auto w-full max-w-[520px] sm:py-8">
      <div className={cn('relative aspect-[4/3] w-full sm:aspect-[4/5] sm:w-[80%]', left ? 'sm:ml-auto' : 'sm:mr-auto')}>
        {/* Outline frame offset behind the photo */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute -top-3 hidden h-full w-full rounded-[28px] border-2 border-primary/15 sm:block',
            left ? '-right-3' : '-left-3'
          )}
        />
        <div className="relative h-full w-full overflow-hidden rounded-[28px]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 640px) 416px, 100vw"
            className="object-cover"
            style={{ objectPosition }}
          />
        </div>
        <span aria-hidden="true" className={cn('absolute -top-5 h-12 w-12 rounded-full bg-warning', left ? 'right-10' : 'left-10')} />
        <span aria-hidden="true" className={cn('absolute -bottom-4 h-8 w-8 rounded-full bg-accent', left ? 'right-24' : 'left-24')} />
      </div>

      <div
        className={cn(
          '-mt-44 flex justify-center sm:absolute sm:inset-y-0 sm:mt-0 sm:items-center',
          left ? 'sm:left-0' : 'sm:right-0'
        )}
      >
        {phone}
      </div>
    </div>
  )
}

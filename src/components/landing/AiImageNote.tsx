import { cn } from '@/lib/utils'

/**
 * A small label over a corner of an AI-generated photo. The people and places in these images are not real, and a
 * visitor should be able to tell (see photos.ts).
 */
export function AiImageNote({ className, children = 'Illustration made with AI' }: { className?: string; children?: React.ReactNode }) {
  return (
    <p className={cn('absolute z-10 max-w-[16rem] rounded-md bg-black/65 px-2 py-1 text-xs leading-snug text-white', className)}>
      {children}
    </p>
  )
}

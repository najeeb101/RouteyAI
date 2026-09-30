import { Fragment } from 'react'

/**
 * Reveals text word by word, each word sliding up from behind a mask.
 * Pure CSS, so the text is in the server HTML and animates on first paint without waiting for JavaScript.
 */
export function WordReveal({ text, className, delayMs = 0 }: { text: string; className?: string; delayMs?: number }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span className="inline-block animate-word-up motion-reduce:animate-none" style={{ animationDelay: `${delayMs + i * 60}ms` }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}

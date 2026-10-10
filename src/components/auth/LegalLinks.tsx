/** "Terms of Service and Privacy Policy", each opening in a new tab so the sign-up form is not lost. */
export function LegalLinks() {
  const linkClass = 'font-semibold text-brand underline underline-offset-2'
  return (
    <>
      <a href="/terms" target="_blank" rel="noopener noreferrer" className={linkClass}>
        Terms of Service<span className="sr-only"> (opens in a new tab)</span>
      </a>{' '}
      and{' '}
      <a href="/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
        Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </>
  )
}

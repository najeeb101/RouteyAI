import { CONTACT_EMAIL } from '@/lib/siteConfig'

/** Links to the contact inbox when one is configured, otherwise to the demo request form. */
export function ContactLink({ className }: { className?: string }) {
  if (CONTACT_EMAIL) {
    return (
      <a href={`mailto:${CONTACT_EMAIL}`} className={className}>
        {CONTACT_EMAIL}
      </a>
    )
  }
  return (
    <a href="/#demo" className={className}>
      our contact form
    </a>
  )
}

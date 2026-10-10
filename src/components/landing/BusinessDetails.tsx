import { BUSINESS } from '@/lib/siteConfig'
import { ContactLink } from '@/components/landing/ContactLink'

/** Who runs RouteyAI and how to reach it. Each detail only appears once it is set in `siteConfig`. */
export function BusinessDetails() {
  const { legalName, address, registrationNumber, phone } = BUSINESS
  return (
    <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[auto_1fr]">
      <dt className="font-semibold text-foreground">Service</dt>
      <dd>RouteyAI, school bus route planning and tracking for schools in Qatar</dd>
      {legalName && (
        <>
          <dt className="font-semibold text-foreground">Operated by</dt>
          <dd>{legalName}</dd>
        </>
      )}
      {registrationNumber && (
        <>
          <dt className="font-semibold text-foreground">Commercial registration</dt>
          <dd>{registrationNumber}</dd>
        </>
      )}
      {address && (
        <>
          <dt className="font-semibold text-foreground">Address</dt>
          <dd>{address}</dd>
        </>
      )}
      {phone && (
        <>
          <dt className="font-semibold text-foreground">Phone</dt>
          <dd>{phone}</dd>
        </>
      )}
      <dt className="font-semibold text-foreground">Contact</dt>
      <dd>
        <ContactLink />
      </dd>
    </dl>
  )
}

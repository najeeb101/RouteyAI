import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/LegalPage'
import { ContactLink } from '@/components/landing/ContactLink'
import { REFUND_TERMS } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Cancellations and Refunds',
  description: 'How fees, cancellations and refunds work for schools that use RouteyAI.',
  alternates: { canonical: '/refunds' },
}

export default function RefundsPage() {
  return (
    <LegalPage title="Cancellations and Refunds">
      <section>
        <p>
          RouteyAI is sold to schools. There is no online checkout on this website and we do not take card payments here.
          Drivers and parents use the mobile apps for free and are never charged by RouteyAI.
        </p>
      </section>

      <section>
        <h2>How fees are agreed</h2>
        <p>
          The price depends on how many buses a school runs. After you request a demo we send a written quote. The fee,
          billing period and payment terms are the ones in that quote or in the agreement your school signs with us.
        </p>
      </section>

      <section>
        <h2>Cancelling</h2>
        <p>
          A school can stop using RouteyAI at any time by telling us through <ContactLink />. What happens to fees already
          paid or still due is set out in the school&apos;s quote or agreement.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        {REFUND_TERMS && REFUND_TERMS.length > 0 ? (
          <ul>
            {REFUND_TERMS.map(term => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        ) : (
          <p>
            Refund terms are set out in each school&apos;s quote or agreement. If you think you were charged by mistake, or
            the service did not work as described, contact us and we will look into it promptly. Nothing on this page
            limits any right you have under the law of Qatar.
          </p>
        )}
      </section>

      <section>
        <h2>Your data when you leave</h2>
        <p>
          See our <a href="/privacy">Privacy Policy</a> for how we handle and delete data when a school stops using
          RouteyAI.
        </p>
      </section>
    </LegalPage>
  )
}

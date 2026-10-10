import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/LegalPage'
import { ContactLink } from '@/components/landing/ContactLink'
import { BusinessDetails } from '@/components/landing/BusinessDetails'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when schools, drivers and parents use RouteyAI.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <section>
        <p>
          These terms apply when you use the RouteyAI website, web dashboard or mobile apps. By creating an account or
          using RouteyAI you agree to them. If you are using RouteyAI on behalf of a school, you confirm you are allowed
          to accept these terms for that school.
        </p>
      </section>

      <section>
        <h2>Who we are</h2>
        <BusinessDetails />
      </section>

      <section>
        <h2>The service</h2>
        <p>
          RouteyAI helps schools plan bus routes, track buses and keep parents informed. Schools subscribe to RouteyAI;
          drivers and parents get access through an invite from their school.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <ul>
          <li>Keep your login details private and tell us if you think your account has been misused.</li>
          <li>Give accurate information, and only use the role your school assigned to you.</li>
          <li>Schools are responsible for the accounts they invite and can remove them at any time.</li>
        </ul>
      </section>

      <section>
        <h2>School responsibilities</h2>
        <p>
          Schools are responsible for the student and staff data they enter, including having the right to share it and
          informing parents and drivers about how RouteyAI is used.
        </p>
      </section>

      <section>
        <h2>Safety</h2>
        <p>
          Routes, ETAs and bus locations are estimates based on road data and the driver&apos;s phone, and can be delayed or
          inaccurate, for example with poor mobile coverage. RouteyAI supports, but does not replace, your school&apos;s own
          transport and safety procedures. Drivers must follow traffic laws and must not use the app in a way that
          distracts them while driving.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Don&apos;t try to access data you aren&apos;t authorized to see, disrupt the service, copy or resell it, or use
          RouteyAI for anything unlawful.
        </p>
      </section>

      <section>
        <h2>Fees</h2>
        <p>
          Prices depend on how many buses a school runs and are set out in a written quote or agreement with the school.
          The mobile apps are free for drivers and parents. See <a href="/refunds">Cancellations and Refunds</a>.
        </p>
      </section>

      <section>
        <h2>Our content and your data</h2>
        <p>
          RouteyAI, its software, design and logo belong to us or our licensors. Schools keep ownership of the data they
          enter, and give us permission to process it to run the service, as described in our{' '}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          We work to keep RouteyAI available and accurate, but the service is provided &quot;as is&quot; and may occasionally
          be interrupted. We may update features and these terms, and will update the date at the top of this page when we do.
        </p>
      </section>

      <section>
        <h2>Our responsibility</h2>
        <p>
          To the extent the law of Qatar allows, we are not responsible for indirect or consequential loss, or for loss
          caused by things outside our control such as mobile network or map data problems. Nothing in these terms limits
          liability that cannot be limited by law.
        </p>
      </section>

      <section>
        <h2>Ending use</h2>
        <p>
          Schools can stop using RouteyAI at any time. We may suspend accounts that break these terms. See our{' '}
          <a href="/privacy">Privacy Policy</a> for what happens to data when an account closes.
        </p>
      </section>

      <section>
        <h2>Governing law and contact</h2>
        <p>
          These terms are governed by the laws of the State of Qatar. Questions? Reach us through <ContactLink />. See also
          our <a href="/cookies">Cookie Policy</a>.
        </p>
      </section>
    </LegalPage>
  )
}

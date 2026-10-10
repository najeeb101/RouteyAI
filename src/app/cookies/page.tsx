import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/LegalPage'
import { ContactLink } from '@/components/landing/ContactLink'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'The few cookies and browser storage items RouteyAI uses, and why.',
  alternates: { canonical: '/cookies' },
}

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy">
      <section>
        <p>
          Cookies are small files a website saves in your browser. RouteyAI uses only the ones it needs to work. We do not
          use advertising, analytics or tracking cookies, so there is no cookie banner to accept or decline.
        </p>
      </section>

      <section>
        <h2>What we use</h2>
        <ul>
          <li>
            <strong>Sign-in cookies</strong> (set by our database and sign-in provider, Supabase). They keep you signed in
            to the web dashboard and are only set after you sign in or create an account. They last until you sign out or
            your session expires. Without them the dashboard cannot work.
          </li>
          <li>
            <strong>Theme choice</strong> (browser local storage). It remembers whether you picked light or dark mode.
            It is only used on your device and is never sent to us. You can clear it in your browser at any time.
          </li>
          <li>
            <strong>Map storage</strong>. Pages with a live map load map code and tiles from Mapbox, which may save small
            technical items in your browser to make the map work. These pages are in the signed-in dashboards, not on
            the public website.
          </li>
        </ul>
      </section>

      <section>
        <h2>What we do not use</h2>
        <ul>
          <li>No analytics or visitor tracking, such as Google Analytics.</li>
          <li>No advertising or social media pixels.</li>
          <li>No embedded videos or social feeds. The website fonts are served from RouteyAI itself, not a third party.</li>
        </ul>
      </section>

      <section>
        <h2>Why there is no consent banner</h2>
        <p>
          The items above are strictly needed to provide the service you asked for (staying signed in) or remember a
          choice you made (the theme). That kind of storage does not need consent in Qatar or under the European
          rules. If we ever add analytics or advertising we will ask for your consent first and update this page.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can block or delete cookies and local storage in your browser settings. If you block the sign-in cookies,
          you will not be able to sign in. Questions? Reach us through <ContactLink />. For how we handle personal data,
          see our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>
    </LegalPage>
  )
}

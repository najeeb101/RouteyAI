import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/LegalPage'
import { ContactLink } from '@/components/landing/ContactLink'
import { BusinessDetails } from '@/components/landing/BusinessDetails'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How RouteyAI collects, uses and protects personal data for schools, drivers and parents.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <p>
          RouteyAI provides school bus routing and tracking software to schools. This policy explains what personal data
          the RouteyAI website and mobile apps process, why, and the choices you have. If you use RouteyAI through your
          school, your school decides what data is entered and is responsible for it; RouteyAI processes that data on the
          school&apos;s behalf. For data you give us directly on this website, such as a demo request, RouteyAI decides
          why and how it is used.
        </p>
      </section>

      <section>
        <h2>Who we are</h2>
        <BusinessDetails />
      </section>

      <section>
        <h2>Data we process</h2>
        <ul>
          <li><strong>Account details</strong>: name, email address, and role (school admin, driver or parent).</li>
          <li><strong>Student details</strong>: student name, home address or pickup location, assigned bus and stop order, entered by the school. Students are children, so we treat this data with extra care and only show it to the people who need it.</li>
          <li><strong>Attendance</strong>: whether a student was marked Boarded, Absent or Dropped off, and when.</li>
          <li><strong>Absence reports</strong>: days a parent says their child won&apos;t ride, with a reason (for example sick or travelling) and an optional note. The child&apos;s driver and school can see them. A reason such as &quot;sick&quot; can count as health information, so please keep notes short and leave out medical detail.</li>
          <li><strong>Bus location</strong>: the driver&apos;s phone location, collected only while the driver has started a route, about every 10 seconds. We do not collect location from parents or school admins.</li>
          <li><strong>Announcements</strong>: messages sent by school admins and drivers.</li>
          <li><strong>Device push tokens</strong>: used to send notifications to the mobile app.</li>
          <li><strong>Demo requests</strong>: the name, school, email, phone number (optional), fleet size and message you send through our website form, and a note that you agreed to be contacted.</li>
          <li><strong>Technical data</strong>: our hosting provider and database keep short-lived server logs (such as IP address and browser type) to keep the service running and secure.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it, and why we are allowed to</h2>
        <ul>
          <li>To plan and optimize bus routes, and to show parents their child&apos;s bus location, ETA and attendance and send related notifications. This is how the service we provide to your school works.</li>
          <li>To let schools manage their buses, drivers and students.</li>
          <li>To respond to demo requests and support questions. We do this because you asked us to and agreed to it on the form.</li>
          <li>To keep the service secure and fix problems.</li>
        </ul>
        <p className="mt-3">We do not sell personal data, we do not use it for advertising, and we do not use analytics or tracking tools on this website.</p>
      </section>

      <section>
        <h2>Who can see it</h2>
        <p>
          Access is enforced in the database. Each school can only see its own data. Parents can only see their own
          child&apos;s bus, stop and attendance. Drivers can only see the bus they are assigned to. RouteyAI staff access
          data only to operate and support the service.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>We use these providers to run RouteyAI. They process data only on our instructions:</p>
        <ul>
          <li><strong>Supabase</strong>: database, authentication and real-time updates.</li>
          <li><strong>Vercel</strong>: website hosting.</li>
          <li><strong>Mapbox</strong>: maps, address lookup and travel-time calculations. Student home addresses are sent to Mapbox to find them on the map and to work out travel times. When a school admin opens a page with a live map, the browser also contacts Mapbox, which receives the visitor&apos;s IP address and technical details.</li>
          <li><strong>Expo</strong>: delivery of push notifications to the mobile apps.</li>
        </ul>
        <p className="mt-3">
          These providers may process data on servers outside Qatar. Where that happens we rely on our agreements with
          them and take the steps Qatar&apos;s data protection law requires.
        </p>
      </section>

      <section>
        <h2>Cookies and local storage</h2>
        <p>
          We use cookies only to keep you signed in, and your browser&apos;s local storage to remember your light or dark
          theme. We do not use advertising, analytics or tracking cookies. See our <a href="/cookies">Cookie Policy</a> for
          the details.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Data is encrypted in transit, access is limited by role and by school, and only the people who need to see a
          record can see it. No system is perfectly secure. If a breach is likely to harm the people affected, we will
          tell them and the authorities as the law requires.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          We keep school data only while the school uses RouteyAI, and demo requests only as long as needed to follow
          up. Specific retention and deletion periods will be set out in each school&apos;s agreement.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask to access, correct or delete your personal data, and you can withdraw consent you gave us, such as
          for a demo request, at any time. Parents and drivers should usually contact their school first, since the
          school controls student and staff records. You can also reach us through <ContactLink />. We handle personal
          data in line with Qatar&apos;s Law No. 13 of 2016 on Personal Data Privacy Protection. If you are not happy with
          our answer, you can complain to the data protection authority in Qatar.
        </p>
      </section>

      <section id="delete-account">
        <h2>Deleting your account</h2>
        <p>
          Parents and drivers can delete their account in the RouteyAI app: open the Account tab and tap Delete account.
          This removes your sign-in, name, email address, role and push tokens straight away. Records that belong to the
          school stay with it but are no longer linked to you, such as your children&apos;s student records, attendance
          and absence reports, or the bus you drove. School admins, and anyone who can&apos;t use the app, can ask us to
          delete their account through <ContactLink />.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we change this policy we will update the date at the top of this page.</p>
      </section>
    </LegalPage>
  )
}

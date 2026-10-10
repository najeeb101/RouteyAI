import Link from 'next/link'
import { AppModalProvider } from '@/components/landing/AppModalProvider'
import { LandingNav } from '@/components/landing/LandingNav'
import { Footer } from '@/components/landing/Footer'
import { displayFont } from '@/components/landing/fonts'
import { LEGAL_LAST_UPDATED, LEGAL_REVIEWED } from '@/lib/siteConfig'

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Cancellations and Refunds', href: '/refunds' },
]

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`landing ${displayFont.variable} bg-background text-foreground`}>
      <AppModalProvider>
        <LandingNav />
        <main id="main-content" tabIndex={-1} className="bg-background focus:outline-none">
          <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] text-foreground mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated {LEGAL_LAST_UPDATED}</p>
            {!LEGAL_REVIEWED && (
              <div role="note" className="mb-10 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
                <strong>Draft.</strong> This page is being reviewed and may change before RouteyAI launches.
              </div>
            )}
            <div className="space-y-8 text-[15px] leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2">
              {children}
            </div>
            <nav aria-label="Legal pages" className="mt-14 border-t border-border pt-6">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {LEGAL_LINKS.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-semibold text-primary underline underline-offset-2">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </article>
        </main>
        <Footer />
      </AppModalProvider>
    </div>
  )
}

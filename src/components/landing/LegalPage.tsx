import { AppModalProvider } from '@/components/landing/AppModalProvider'
import { LandingNav } from '@/components/landing/LandingNav'
import { Footer } from '@/components/landing/Footer'
import { displayFont } from '@/components/landing/fonts'
import { LEGAL_LAST_UPDATED, LEGAL_REVIEWED } from '@/lib/siteConfig'

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`landing ${displayFont.variable} bg-background text-foreground`}>
      <AppModalProvider>
        <LandingNav />
        <main className="bg-background">
          <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] text-foreground mb-3">{title}</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated {LEGAL_LAST_UPDATED}</p>
            {!LEGAL_REVIEWED && (
              <div role="note" className="mb-10 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
                <strong>Draft.</strong> This page is being reviewed and may change before RouteyAI launches.
              </div>
            )}
            <div className="space-y-8 text-[15px] leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:font-semibold hover:[&_a]:underline">
              {children}
            </div>
          </article>
        </main>
        <Footer />
      </AppModalProvider>
    </div>
  )
}

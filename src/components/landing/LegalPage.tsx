import { AppModalProvider } from '@/components/landing/AppModalProvider'
import { LandingNav } from '@/components/landing/LandingNav'
import { Footer } from '@/components/landing/Footer'
import { LEGAL_LAST_UPDATED, LEGAL_REVIEWED } from '@/lib/siteConfig'

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AppModalProvider>
      <LandingNav />
      <main className="bg-white dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white mb-2">{title}</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mb-8">Last updated {LEGAL_LAST_UPDATED}</p>
          {!LEGAL_REVIEWED && (
            <div role="note" className="mb-10 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <strong>Draft.</strong> This page is being reviewed and may change before RouteyAI launches.
            </div>
          )}
          <div className="space-y-8 text-[15px] leading-relaxed text-[#334155] dark:text-slate-300 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0F172A] dark:[&_h2]:text-white [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#1E3A8A] dark:[&_a]:text-blue-400 [&_a]:font-semibold hover:[&_a]:underline">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </AppModalProvider>
  )
}

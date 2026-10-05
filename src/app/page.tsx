import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AppModalProvider } from '@/components/landing/AppModalProvider'
import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { MobileAppsSection } from '@/components/landing/MobileApps'
import { SafetyPrivacy } from '@/components/landing/SafetyPrivacy'
import { Pricing } from '@/components/landing/Pricing'
import { Faq, FAQS } from '@/components/landing/Faq'
import { FinalCta } from '@/components/landing/FinalCta'
import { Footer } from '@/components/landing/Footer'
import { Reveal } from '@/components/landing/Reveal'
import { displayFont } from '@/components/landing/fonts'

export const metadata: Metadata = {
  title: { absolute: 'RouteyAI: School Bus Route Planning and Live Tracking in Qatar' },
  description:
    'RouteyAI plans your school bus routes, shows every bus on a live map, and notifies parents when their child boards. Built for schools in Qatar.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'RouteyAI',
    title: 'RouteyAI: School Bus Route Planning and Live Tracking',
    description: 'Route planning, live bus tracking and parent notifications for schools in Qatar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RouteyAI: School Bus Route Planning and Live Tracking',
    description: 'Route planning, live bus tracking and parent notifications for schools in Qatar.',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RouteyAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    description: 'School bus route planning, live GPS tracking and parent notifications for schools in Qatar.',
    areaServed: 'QA',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  },
]

export default function HomePage() {
  return (
    <div className={`landing ${displayFont.variable} bg-background text-foreground`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AppModalProvider>
        <LandingNav overlay />
        {/*
          Each section below the hero sits in its own Suspense boundary. Nothing here suspends; the boundaries let
          React hydrate the sections one at a time in short tasks instead of the whole page in one long task, which
          kept the main thread blocked for over a second on phones.
        */}
        <main className="overflow-x-clip bg-background font-sans">
          <Hero />
          <Suspense>
            <HowItWorks />
          </Suspense>
          <Suspense>
            <MobileAppsSection />
          </Suspense>
          <Suspense>
            <SafetyPrivacy />
          </Suspense>
          <Suspense>
            <Reveal>
              <Pricing />
            </Reveal>
          </Suspense>
          <Suspense>
            <Faq />
          </Suspense>
          <Suspense>
            <FinalCta />
          </Suspense>
        </main>
        <Suspense>
          <Footer />
        </Suspense>
      </AppModalProvider>
    </div>
  )
}

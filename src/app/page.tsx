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

export const metadata: Metadata = {
  title: { absolute: 'RouteyAI — School Bus Route Planning and Live Tracking in Qatar' },
  description:
    'RouteyAI plans your school bus routes, shows every bus on a live map, and notifies parents when their child boards. Built for schools in Qatar.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'RouteyAI',
    title: 'RouteyAI — School Bus Route Planning and Live Tracking',
    description: 'Route planning, live bus tracking and parent notifications for schools in Qatar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RouteyAI — School Bus Route Planning and Live Tracking',
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
    <AppModalProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingNav />
      <main className="bg-background font-sans">
        <Hero />
        <HowItWorks />
        <MobileAppsSection />
        <SafetyPrivacy />
        <Reveal>
          <Pricing />
        </Reveal>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </AppModalProvider>
  )
}

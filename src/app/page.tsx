import type { Metadata } from 'next'
import { AppModalProvider } from '@/components/landing/AppModalProvider'
import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { LiveBoard } from '@/components/landing/LiveBoard'
import { ProblemOutcome } from '@/components/landing/ProblemOutcome'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { OptimizeDemo } from '@/components/landing/OptimizeDemo'
import { ProductShot } from '@/components/landing/ProductShot'
import { MobileAppsSection } from '@/components/landing/MobileApps'
import { Features } from '@/components/landing/Features'
import { SafetyPrivacy } from '@/components/landing/SafetyPrivacy'
import { Pricing } from '@/components/landing/Pricing'
import { Faq, FAQS } from '@/components/landing/Faq'
import { FinalCta } from '@/components/landing/FinalCta'
import { Footer } from '@/components/landing/Footer'
import { Reveal } from '@/components/landing/Reveal'

export const metadata: Metadata = {
  title: { absolute: 'RouteyAI — Smart School Bus Routing & Live Tracking for Qatar' },
  description:
    'RouteyAI plans school bus routes with AI, tracks every bus live, and keeps parents informed automatically. Built for schools in Qatar.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'RouteyAI',
    title: 'RouteyAI — Smart School Bus Routing & Live Tracking',
    description: 'AI route optimization, live bus tracking and parent alerts for schools in Qatar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RouteyAI — Smart School Bus Routing & Live Tracking',
    description: 'AI route optimization, live bus tracking and parent alerts for schools in Qatar.',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RouteyAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    description:
      'AI-powered school bus routing, real-time GPS tracking and parent notifications for schools in Qatar.',
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
      <main className="relative min-h-screen overflow-clip bg-background font-sans selection:bg-primary selection:text-primary-foreground">
        <Hero />
        <LiveBoard />
        <ProblemOutcome />
        <HowItWorks />
        <OptimizeDemo />
        <ProductShot />
        <MobileAppsSection />
        <Features />
        <SafetyPrivacy />
        <Reveal><Pricing /></Reveal>
        <Reveal><Faq /></Reveal>
        <FinalCta />
      </main>
      <Footer />
    </AppModalProvider>
  )
}

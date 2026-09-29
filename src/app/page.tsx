import type { Metadata } from 'next'
import { AppModalProvider } from '@/components/landing/AppModalProvider'
import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { TrustStrip } from '@/components/landing/TrustStrip'
import { ProblemOutcome } from '@/components/landing/ProblemOutcome'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { AdminOrchestrator } from '@/components/landing/AdminOrchestrator'
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
      <main className="min-h-screen bg-[#F8FAFF] dark:bg-slate-950 font-sans selection:bg-[#1E3A8A] selection:text-white relative overflow-clip">
        {/* Subtle blue gradient overlay (light mode only) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent pointer-events-none dark:hidden" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

        <Hero />
        <TrustStrip />
        <Reveal><ProblemOutcome /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <AdminOrchestrator />
        <Reveal><MobileAppsSection /></Reveal>
        <Reveal><Features /></Reveal>
        <Reveal><SafetyPrivacy /></Reveal>
        <Reveal><Pricing /></Reveal>
        <Reveal><FinalCta /></Reveal>
        <Faq />
      </main>
      <Footer />
    </AppModalProvider>
  )
}

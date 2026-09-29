import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'

export function Hero() {
  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-16 md:pb-20 text-center z-10">
      <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-[#BFDBFE] dark:border-blue-900/50 rounded-full px-4 py-1.5 text-[12px] font-bold text-[#1E3A8A] dark:text-blue-400 mb-8 uppercase tracking-wide shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E3A8A] dark:bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E3A8A] dark:bg-blue-400" />
        </span>
        Built for Qatar&apos;s Schools
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1] mb-6">
        Smart routing.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] dark:from-blue-400 dark:to-blue-200">Real-time tracking.</span><br />
        Peace of mind.
      </h1>
      <p className="text-lg md:text-xl text-[#64748B] dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        RouteyAI plans your school bus routes with AI, tracks every bus live, and keeps parents informed automatically.
      </p>
      <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
        <a
          href="#demo"
          className="group bg-[#1E3A8A] text-white px-7 sm:px-8 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 transition-all hover:shadow-[0_8px_20px_-4px_rgba(30,58,138,0.5)] hover:-translate-y-0.5 flex items-center gap-2"
        >
          Book a demo
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </a>
        <a
          href="#how-it-works"
          className="bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white border-2 border-[#E2E8F0] dark:border-slate-800 px-7 sm:px-8 py-4 rounded-2xl text-sm font-bold hover:border-[#1E3A8A]/30 dark:hover:border-slate-600 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          See how it works
        </a>
      </div>

      <Reveal delay={0.2} className="relative max-w-5xl mx-auto mt-14 md:mt-16 sm:px-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur-xl opacity-20" />
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <Image
            src="/assets/dashboard-screenshot.png"
            alt="RouteyAI school admin dashboard with the live fleet map and route stats"
            width={1200}
            height={675}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="w-full h-auto"
          />
        </div>
      </Reveal>
    </section>
  )
}

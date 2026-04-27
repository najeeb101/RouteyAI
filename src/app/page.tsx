'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RouteyLogo } from '@/components/RouteyLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Mail, Phone, Instagram, Twitter, Linkedin, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    title: 'AI Route Optimization',
    desc: 'K-Means clustering + TSP heuristics minimize ride times and fuel costs across all routes.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Real-Time Tracking',
    desc: 'Live GPS updates every 2 seconds via Supabase Realtime. Parents always know where their child is.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Smart Attendance',
    desc: 'Drivers check students in at every stop. Absences notify parents and admins instantly.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    title: 'Instant Alerts',
    desc: 'Broadcast announcements to drivers and parents. Delay, route change, or emergency — everyone knows.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: 'Multi-Role Platform',
    desc: 'Web dashboard for admins. Native mobile app for drivers and parents. One backend.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Role-Based Security',
    desc: 'Row-level security enforced at the database layer. School data stays strictly isolated.',
  },
]

function AppDownloadModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/40 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_60px_-15px_rgb(0_0_0/0.35)] dark:shadow-[0_20px_60px_-15px_rgb(0_0_0/0.7)] animate-in zoom-in-95 duration-300 border border-transparent dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RouteyLogo size={24} variant="gradient" />
              <span className="font-extrabold text-[#0F172A] dark:text-white">Routey<span className="text-[#1E3A8A] dark:text-blue-400">AI</span></span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Get the Mobile App</h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">For drivers and parents — available on iOS & Android.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#F1F5F9] dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#64748B] dark:text-slate-400 shrink-0 hover:bg-[#E2E8F0] dark:hover:bg-slate-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* QR placeholder */}
        <div className="flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-slate-700 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-[#0F172A] rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                {/* Simple QR-like pattern */}
                <rect x="5" y="5" width="28" height="28" rx="3" fill="white"/>
                <rect x="9" y="9" width="20" height="20" rx="1" fill="#0F172A"/>
                <rect x="12" y="12" width="14" height="14" rx="1" fill="white"/>
                <rect x="47" y="5" width="28" height="28" rx="3" fill="white"/>
                <rect x="51" y="9" width="20" height="20" rx="1" fill="#0F172A"/>
                <rect x="54" y="12" width="14" height="14" rx="1" fill="white"/>
                <rect x="5" y="47" width="28" height="28" rx="3" fill="white"/>
                <rect x="9" y="51" width="20" height="20" rx="1" fill="#0F172A"/>
                <rect x="12" y="54" width="14" height="14" rx="1" fill="white"/>
                {/* Dots */}
                {[47,52,57,62,67].map(x => [47,52,57,62,67].map(y => (
                  <rect key={`${x}${y}`} x={x} y={y} width="3" height="3" fill="white" opacity={Math.random() > 0.5 ? 1 : 0}/>
                )))}
                <rect x="47" y="47" width="5" height="5" fill="white"/>
                <rect x="54" y="47" width="5" height="5" fill="white"/>
                <rect x="61" y="47" width="5" height="5" fill="white"/>
                <rect x="68" y="47" width="5" height="5" fill="white"/>
                <rect x="47" y="54" width="5" height="5" fill="white"/>
                <rect x="61" y="54" width="5" height="5" fill="white"/>
                <rect x="47" y="61" width="5" height="5" fill="white"/>
                <rect x="54" y="61" width="5" height="5" fill="white"/>
                <rect x="68" y="61" width="5" height="5" fill="white"/>
                <rect x="47" y="68" width="5" height="5" fill="white"/>
                <rect x="61" y="68" width="5" height="5" fill="white"/>
              </svg>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Scan to download · Coming soon</p>
          </div>
        </div>

        {/* Store badges */}
        <div className="flex gap-3 mb-5">
          <button className="flex-1 bg-[#0F172A] text-white rounded-xl px-4 py-3 flex items-center gap-2.5 hover:bg-[#1E293B] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <div className="text-[9px] text-white/60 leading-none">Download on the</div>
              <div className="text-[13px] font-bold leading-tight">App Store</div>
            </div>
          </button>
          <button className="flex-1 bg-[#0F172A] text-white rounded-xl px-4 py-3 flex items-center gap-2.5 hover:bg-[#1E293B] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M3.18 23.76c.3.17.65.19.97.08l11.46-6.62-2.36-2.36-10.07 8.9zM20.73 9.11L17.5 7.23 14.86 9.87l2.77 2.77 3.12-1.8c.89-.51.89-1.74-.02-2.73zM2.13.29C1.86.56 1.7.97 1.7 1.5v21c0 .53.16.94.43 1.21l.07.06 11.76-11.76v-.28L2.2.23l-.07.06zM14.57 10.53l-2.77-2.77L2.2.23l12.37 10.3z"/>
            </svg>
            <div className="text-left">
              <div className="text-[9px] text-white/60 leading-none">Get it on</div>
              <div className="text-[13px] font-bold leading-tight">Google Play</div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-3.5 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[12px] text-[#1E3A8A]">School admins use the <Link href="/school" className="font-bold underline">web dashboard</Link> instead.</p>
        </div>
      </div>
    </div>
  )
}

const FAQS = [
  {
    question: "What is RouteyAI?",
    answer: "RouteyAI is an AI-powered school bus management platform designed specifically for schools in Qatar. It optimizes bus routes, provides real-time tracking, and keeps parents informed automatically."
  },
  {
    question: "How does the route optimization work?",
    answer: "Our system uses advanced algorithms to calculate the most efficient routes based on student locations, traffic patterns, and vehicle capacity, saving schools time and fuel costs."
  },
  {
    question: "Is there a parent app?",
    answer: "Yes, parents get a dedicated mobile app to track their child's bus in real-time, receive ETAs, and get notified immediately upon safe boarding and drop-off."
  },
  {
    question: "How do drivers use the platform?",
    answer: "Drivers use our intuitive mobile app for turn-by-turn navigation and digital student check-ins via QR codes or manual entry at each stop."
  },
  {
    question: "Can we integrate with our existing student information system?",
    answer: "Absolutely. We offer custom integrations with most major Student Information Systems (SIS) to automatically sync student rosters and addresses."
  }
]

export default function HomePage() {
  const [showAppModal, setShowAppModal] = useState(false)

  return (
    <main className="min-h-screen bg-[#F8FAFF] dark:bg-slate-950 font-sans selection:bg-[#1E3A8A] selection:text-white relative overflow-clip">
      {/* Subtle blue gradient overlay (Light mode only) */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent pointer-events-none dark:hidden" />
      
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {showAppModal && <AppDownloadModal onClose={() => setShowAppModal(false)} />}

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RouteyLogo size={26} variant="gradient" />
            <span className="text-base font-extrabold tracking-tight">
              <span className="text-[#0F172A] dark:text-white">Routey</span>
              <span className="text-[#1E3A8A] dark:text-blue-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setShowAppModal(true)}
              className="text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              Get the App
            </button>
            <Link
              href="/login"
              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-[#BFDBFE] dark:border-blue-900/50 rounded-full px-4 py-1.5 text-[12px] font-bold text-[#1E3A8A] dark:text-blue-400 mb-8 uppercase tracking-wide shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E3A8A] dark:bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E3A8A] dark:bg-blue-400"></span>
          </span>
          Built for Qatar&apos;s Schools
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1] mb-6">
          Smart routing.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] dark:from-blue-400 dark:to-blue-200">Real-time tracking.</span><br />
          Peace of mind.
        </h1>
        <p className="text-lg md:text-xl text-[#64748B] dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered school bus management — from route optimization to live GPS tracking and parent alerts.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/school"
            className="group bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 transition-all hover:shadow-[0_8px_20px_-4px_rgba(30,58,138,0.5)] dark:hover:shadow-[0_8px_20px_-4px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 flex items-center gap-2"
          >
            Open Admin Dashboard
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <button
            onClick={() => setShowAppModal(true)}
            className="group bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white border-2 border-[#E2E8F0] dark:border-slate-800 px-8 py-4 rounded-2xl text-sm font-bold hover:border-[#1E3A8A]/30 dark:hover:border-slate-600 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform group-hover:-translate-y-1">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            Download the App
          </button>
        </div>
      </section>

      {/* Map illustration */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-3xl shadow-[0_8px_40px_-12px_rgb(0_0_0/0.12)] dark:shadow-none overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#F1F5F9] dark:border-slate-800/50">
            {['#FF5F57','#FEBC2E','#28C840'].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
            <span className="ml-2 text-[11px] text-[#94A3B8] dark:text-slate-500">RouteyAI — Admin Dashboard · Fleet Overview</span>
          </div>
          <div className="relative bg-[#e8edf2] dark:bg-slate-800" style={{ height: 320 }}>
            <svg width="100%" height="320" viewBox="0 0 900 320" preserveAspectRatio="xMidYMid slice">
              <rect width="900" height="320" className="fill-[#e8edf2] dark:fill-slate-800" />
              {[100,200,300,400,500,600,700,800].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="320" className="stroke-[#d1d9e0] dark:stroke-slate-700" strokeWidth={x===450?14:7}/>
              ))}
              {[80,160,240].map(y => (
                <line key={y} x1="0" y1={y} x2="900" y2={y} className="stroke-[#d1d9e0] dark:stroke-slate-700" strokeWidth={y===160?14:7}/>
              ))}
              {[
                [105,85,85,65],[205,85,85,65],[305,85,85,65],[505,85,85,65],[605,85,85,65],[705,85,85,65],
                [105,170,85,60],[205,170,85,60],[305,170,85,60],[505,170,85,60],[605,170,85,60],[705,170,85,60],
              ].map(([x,y,w,h],i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="4" className="fill-[#cdd7e0] dark:fill-slate-700" opacity="0.55"/>
              ))}
              <rect x="405" y="85" width="85" height="65" rx="4" fill="#b8d9b8" className="dark:fill-emerald-900" opacity="0.7"/>
              <path d="M50 160 Q100 160 100 80 Q100 20 200 20 Q300 20 300 80 Q300 160 450 160" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85"/>
              <path d="M450 160 Q600 160 600 80 Q600 20 700 20 Q800 20 800 80 Q800 160 860 160" stroke="#10B981" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85"/>
              <path d="M100 300 Q100 240 200 240 Q300 240 300 160 Q300 80 450 80" stroke="#F59E0B" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" strokeDasharray="8 4"/>
              <path d="M700 300 Q700 240 800 240 Q860 240 860 160" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85"/>
              <g transform="translate(450,160)">
                <circle r="20" fill="#1E3A8A" className="dark:fill-blue-500" stroke="#fff" strokeWidth="3.5"/>
                <rect x="-10" y="-9" width="20" height="18" rx="1.5" fill="#fff" opacity="0.9"/>
                <rect x="-6" y="-9" width="12" height="4" rx="1" fill="#1E3A8A" className="dark:fill-blue-500"/>
              </g>
              <text x="450" y="196" textAnchor="middle" fontSize="11" fill="#1E3A8A" className="dark:fill-blue-300" fontWeight="700">Al Nour School</text>
              {[{cx:200,cy:20,c:'#3B82F6',n:3},{cx:300,cy:160,c:'#10B981',n:7},{cx:700,cy:160,c:'#8B5CF6',n:5}].map(b=>(
                <g key={b.n} transform={`translate(${b.cx},${b.cy})`}>
                  <circle r="18" fill={b.c} stroke="#fff" strokeWidth="3"/>
                  <text textAnchor="middle" y="6" fontSize="13" fill="#fff" fontWeight="700">#{b.n}</text>
                </g>
              ))}
              <g transform="translate(550,240)">
                <circle r="18" fill="#94A3B8" className="dark:fill-slate-600" stroke="#fff" strokeWidth="3"/>
                <text textAnchor="middle" y="6" fontSize="13" fill="#fff" fontWeight="700">#12</text>
              </g>
              <text x="895" y="316" textAnchor="end" fontSize="9" fill="#94A3B8" className="dark:fill-slate-500">Map simulation</text>
            </svg>
            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-[#E2E8F0]/80 dark:border-slate-700">
              <div className="text-[10px] font-bold text-[#0F172A] dark:text-slate-200 mb-2 uppercase tracking-wide">Active Routes</div>
              {[['Route A','#3B82F6'],['Route B','#10B981'],['Route C','#F59E0B'],['Route D','#8B5CF6']].map(([n,c])=>(
                <div key={n} className="flex items-center gap-2 mb-1 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">{n}</span>
                </div>
              ))}
            </div>
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981] border border-[#E2E8F0]/80 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block"/>
              Live
            </div>
          </div>
        </div>
        <p className="text-center text-[12px] text-[#94A3B8] dark:text-slate-500 mt-3">School admin web dashboard — manage fleet, routes & students</p>
      </section>

      {/* Two surfaces section */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-3">Two surfaces. One platform.</h2>
          <p className="text-[#64748B] dark:text-slate-400 text-base">The right experience for every role — web for admins, mobile for everyone else.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Admin — web */}
          <Link
            href="/school"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm p-8 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:border-[#BFDBFE] dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#1E3A8A] dark:text-blue-400" strokeWidth="1.75" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1E3A8A] dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wide">Web</div>
            <div className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-2">School Admin</div>
            <p className="text-[#64748B] dark:text-slate-400 leading-relaxed mb-6">Fleet overview, route optimization, student roster, and analytics — all in one desktop dashboard.</p>
            <div className="text-sm font-bold text-[#1E3A8A] dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">Open Dashboard <span className="text-lg">→</span></div>
          </Link>

          {/* Driver — mobile */}
          <button
            onClick={() => setShowAppModal(true)}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm p-8 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:border-[#A7F3D0] dark:hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#059669] dark:text-emerald-400" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
                <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5"/>
                <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wide">Mobile App</div>
            <div className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-2">Driver</div>
            <p className="text-[#64748B] dark:text-slate-400 leading-relaxed mb-6">Route navigation, per-stop student check-in, and real-time messages from the school — all on your phone.</p>
            <div className="text-sm font-bold text-[#059669] dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">Download App <span className="text-lg">→</span></div>
          </button>

          {/* Parent — mobile */}
          <button
            onClick={() => setShowAppModal(true)}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm p-8 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:border-[#DDD6FE] dark:hover:border-purple-500 transition-all duration-300 hover:-translate-y-1 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#7C3AED] dark:text-purple-400" strokeWidth="1.75" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wide">Mobile App</div>
            <div className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-2">Parent</div>
            <p className="text-[#64748B] dark:text-slate-400 leading-relaxed mb-6">Live bus tracking, boarding confirmation, ETA to school, and instant absence alerts — right in your pocket.</p>
            <div className="text-sm font-bold text-[#7C3AED] dark:text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">Download App <span className="text-lg">→</span></div>
          </button>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-3">Everything your school needs</h2>
          <p className="text-[#64748B] dark:text-slate-400 text-base">From the first stop to drop-off at the gate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="group bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm p-6 hover:shadow-lg dark:hover:shadow-none hover:border-[#BFDBFE] dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 mb-5 group-hover:scale-110 group-hover:bg-[#1E3A8A] dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white transition-all duration-300">
                {f.icon}
              </div>
              <div className="text-base font-bold text-[#0F172A] dark:text-white mb-2">{f.title}</div>
              <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>




      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-32">
            <div className="md:w-[45%] shrink-0">
              <h2 className="text-4xl md:text-[40px] font-medium text-[#334155] dark:text-slate-200 tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-[#64748B] dark:text-slate-400 text-lg">Find answers to common questions about our platform.</p>
            </div>
            <div className="md:w-[55%] pt-1">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#E2E8F0] dark:border-slate-800/60">
                    <AccordionTrigger className="text-left font-medium text-[#334155] dark:text-slate-200 hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 text-[15px] py-5 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#64748B] dark:text-slate-400 leading-relaxed text-[14px] pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] dark:bg-slate-950 pt-20 pb-10 border-t border-slate-800/40 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand & Social */}
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <RouteyLogo size={28} variant="gradient" />
                <span className="text-xl font-extrabold text-white">Routey<span className="text-blue-500">AI</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Professional AI-powered school bus routing and real-time tracking platform for Qatar&apos;s educational institutions.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Twitter size={16} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-5 tracking-wide">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/school" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Admin Dashboard</Link></li>
                <li><button onClick={() => setShowAppModal(true)} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Driver App</button></li>
                <li><button onClick={() => setShowAppModal(true)} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Parent Portal</button></li>
                <li><Link href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Pricing & Plans</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-bold mb-5 tracking-wide">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-blue-500 shrink-0" />
                  <span className="text-slate-400 text-sm">+974 4458 8888</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-blue-500 shrink-0" />
                  <span className="text-slate-400 text-sm">hello@routeyai.com</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-bold mb-5 tracking-wide">Stay Updated</h3>
              <p className="text-slate-400 text-sm mb-4">
                Subscribe to our newsletter for the latest routing optimizations and feature updates.
              </p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-10 shadow-none"
                />
                <button className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-500">© 2026 RouteyAI. Built for Qatar.</span>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

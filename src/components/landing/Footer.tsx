import Link from 'next/link'
import { Mail } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { AppDownloadButton } from '@/components/landing/AppDownloadButton'
import { AppleIcon, GooglePlayIcon } from '@/components/landing/StoreIcons'
import { CONTACT_EMAIL } from '@/lib/siteConfig'

const PRODUCT_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Drivers & parents', href: '/#apps' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faqs' },
  { label: 'Book a demo', href: '/#demo' },
]

const linkClass = 'text-slate-400 hover:text-accent text-sm transition-colors'

export function Footer() {
  return (
    <footer className="bg-slate-950 pt-16 md:pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <RouteyLogo size={28} variant="gradient" />
              <span className="text-xl font-semibold text-white">Routey<span className="text-accent">AI</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              School bus route planning and live tracking for schools in Qatar.
            </p>
            {CONTACT_EMAIL && (
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-accent transition-colors">
                <Mail size={16} className="text-accent" />
                {CONTACT_EMAIL}
              </a>
            )}
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 tracking-wide">Product</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 tracking-wide">Account</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className={linkClass}>Log in</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms of Service</Link></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-white font-bold mb-5 tracking-wide">Mobile apps</h3>
            <p className="text-slate-400 text-sm mb-5">Coming soon for drivers and parents.</p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              {[
                { icon: <AppleIcon />, small: 'Coming soon to the', big: 'App Store' },
                { icon: <GooglePlayIcon />, small: 'Coming soon on', big: 'Google Play' },
              ].map(store => (
                <AppDownloadButton
                  key={store.big}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-accent/50 hover:bg-slate-800/50 transition-all px-4 py-2.5 rounded-md text-white group"
                >
                  {store.icon}
                  <span className="text-left">
                    <span className="block text-[10px] text-slate-400 leading-none mb-1">{store.small}</span>
                    <span className="block text-sm font-bold group-hover:text-accent transition-colors">{store.big}</span>
                  </span>
                </AppDownloadButton>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-400">© {new Date().getFullYear()} RouteyAI. Built for Qatar.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

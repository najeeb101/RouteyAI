import Link from 'next/link'
import { Mail } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { AppDownloadButton } from '@/components/landing/AppDownloadButton'
import { AppleIcon, GooglePlayIcon } from '@/components/landing/StoreIcons'
import { ThemeSelect } from '@/components/landing/ThemeSelect'
import { CONTACT_EMAIL } from '@/lib/siteConfig'

const PRODUCT_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Drivers & parents', href: '/#apps' },
  { label: 'Privacy', href: '/#safety' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faqs' },
  { label: 'Book a demo', href: '/#demo' },
]

const linkClass = 'text-sm text-slate-400 transition-colors hover:text-white'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-brand-ink pb-10 pt-16 md:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <RouteyLogo size={28} variant="gradient" />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Routey<span className="text-accent">AI</span>
              </span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-slate-400">
              School bus route planning and live tracking for schools in Qatar.
            </p>
            {CONTACT_EMAIL && (
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
                <Mail size={16} className="text-accent" />
                {CONTACT_EMAIL}
              </a>
            )}
          </div>

          <div>
            <h3 className="mb-5 font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-semibold text-white">Account</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className={linkClass}>Log in</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms of service</Link></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-5 font-semibold text-white">Mobile apps</h3>
            <p className="mb-5 text-sm text-slate-400">Coming soon for drivers and parents.</p>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              {[
                { icon: <AppleIcon />, small: 'Coming soon to the', big: 'App Store' },
                { icon: <GooglePlayIcon />, small: 'Coming soon on', big: 'Google Play' },
              ].map(store => (
                <AppDownloadButton
                  key={store.big}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  {store.icon}
                  <span className="text-left">
                    <span className="mb-1 block text-[10px] leading-none text-slate-400">{store.small}</span>
                    <span className="block text-sm font-semibold">{store.big}</span>
                  </span>
                </AppDownloadButton>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/[0.08] pt-8 md:flex-row">
          <span className="text-sm text-slate-400">© {new Date().getFullYear()} RouteyAI. Built for Qatar.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className={linkClass}>Privacy</Link>
            <Link href="/terms" className={linkClass}>Terms</Link>
            <ThemeSelect />
          </div>
        </div>
      </div>
    </footer>
  )
}

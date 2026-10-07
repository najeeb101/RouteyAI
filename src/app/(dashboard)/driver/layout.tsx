import { displayFont } from '@/components/landing/fonts'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${displayFont.variable} min-h-screen bg-canvas font-sans text-ink`}>{children}</div>
}

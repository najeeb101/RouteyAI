import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 focus:outline-none">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          <line x1="9" y1="3" x2="9" y2="18"/>
          <line x1="15" y1="6" x2="15" y2="21"/>
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-[#0F172A] mb-2">404</h1>
      <p className="text-lg font-semibold text-[#0F172A] mb-1">Page not found</p>
      <p className="text-sm text-[#64748B] mb-8 text-center max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors"
      >
        Back to home
      </Link>
    </main>
  )
}

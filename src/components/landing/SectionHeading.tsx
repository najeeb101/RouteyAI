export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-5 uppercase tracking-wide shadow-sm">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">{title}</h2>
      {subtitle && <p className="text-[#64748B] dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}

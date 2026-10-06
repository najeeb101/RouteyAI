/** A shimmering outline of a dashboard page while it loads: the title, a row of cards and a large panel. */
export default function DashboardLoading() {
  const block = 'rounded-xl bg-[linear-gradient(90deg,#FFFFFF_0%,#F1F3F6_50%,#FFFFFF_100%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none'
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-7">
        <div className="h-8 w-48 rounded-lg bg-line/70" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-line/50" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`h-[124px] ${block}`} />)}
      </div>
      <div className={`mt-4 h-[380px] ${block}`} />
    </div>
  )
}

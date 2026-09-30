import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { AlertsVisual } from '@/components/landing/visuals/AlertsVisual'
import { AttendanceVisual } from '@/components/landing/visuals/AttendanceVisual'
import { CapacityVisual } from '@/components/landing/visuals/CapacityVisual'
import { PlacementVisual } from '@/components/landing/visuals/PlacementVisual'
import { TrackingVisual } from '@/components/landing/visuals/TrackingVisual'

const TILES = [
  {
    title: 'Real-time tracking',
    desc: 'The driver’s phone shares the bus location every 10 seconds. Parents and admins watch it move on the map.',
    visual: <TrackingVisual />,
    wide: true,
  },
  {
    title: 'Digital attendance',
    desc: 'Drivers mark each student Boarded or Absent with one tap. Parents are notified straight away.',
    visual: <AttendanceVisual />,
  },
  {
    title: 'Fleet capacity',
    desc: 'See seats filled on every bus, and spot the ones that are nearly full before it becomes a problem.',
    visual: <CapacityVisual />,
  },
  {
    title: 'Announcements & alerts',
    desc: 'Message one bus or the whole fleet. Parents also get an alert when the bus is getting close.',
    visual: <AlertsVisual />,
  },
  {
    title: 'Smart placement',
    desc: 'New students join the nearest bus with free seats, and that route recalculates automatically.',
    visual: <PlacementVisual />,
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <SectionHeading
        index="05"
        label="Features"
        title="Everything between the first stop and the school gate"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map(tile => (
          <article
            key={tile.title}
            className={cn(
              'group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgb(15_23_42/0.3)]',
              tile.wide && 'md:col-span-2'
            )}
          >
            <div className="border-b border-border bg-muted/40 bg-map-grid">{tile.visual}</div>
            <div className="p-5">
              <h3 className="text-[15px] font-semibold text-foreground">{tile.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tile.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

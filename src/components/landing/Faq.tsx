import { ChevronDown } from 'lucide-react'
import { ContactLink } from '@/components/landing/ContactLink'
import { Reveal } from '@/components/landing/Reveal'

export const FAQS = [
  {
    question: 'What is RouteyAI?',
    answer:
      'RouteyAI is software for running school buses in Qatar. It plans your bus routes, shows every bus on a live map, and keeps parents informed through their own app.',
  },
  {
    question: 'How are the routes planned?',
    answer:
      'Students are grouped by where they live, each group is given a bus with enough seats, and the stops are put in the order that gives the shortest drive, using real road travel times from Mapbox. Routes are recalculated when students are added or removed.',
  },
  {
    question: 'What happens when a new student joins mid-year?',
    answer:
      'The student is added to the nearest bus that still has free seats, and that route is recalculated. If every nearby bus is full, the school admin is alerted to add a bus.',
  },
  {
    question: 'How do drivers use RouteyAI?',
    answer:
      'Drivers use the RouteyAI app. It shows the next pickup in route order, lets them mark each student boarded or absent with one tap, and shares the bus location every 10 seconds while the route is running. It also shows which students their parents reported absent, sends parents a running-late notice in one tap, and gives a summary when the route ends.',
  },
  {
    question: 'What do parents see?',
    answer:
      'Parents see their child’s bus on a map, the arrival time for their stop, and school announcements. They get a notification when their child boards or is marked absent, and when the bus is getting close. Parents with more than one child switch between them in the app, can report an absence ahead of time, and can look back at each child’s past rides.',
  },
  {
    question: 'How is student data protected?',
    answer:
      'Each school’s data is kept separate by access rules enforced in the database itself. Parents can only see their own child’s bus, and drivers can only see the bus they are assigned to.',
  },
  {
    question: 'How do parents and drivers get access?',
    answer:
      'The school sends each parent and driver a personal invite link. They open it, create an account, and go straight to the right view for their role.',
  },
  {
    question: 'When are the mobile apps available?',
    answer:
      'The iOS and Android apps are in final testing. Book a demo and we’ll let your school know as soon as they’re in the stores.',
  },
  {
    question: 'How much does RouteyAI cost?',
    answer:
      'The price depends on how many buses you run, and every plan includes the full product. Book a demo and we’ll send you a quote.',
  },
]

export function Faq() {
  return (
    <section id="faqs" className="scroll-mt-20 border-t border-border bg-muted/60">
      <Reveal className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 md:flex-row md:gap-16 md:py-28">
        <div className="shrink-0 md:sticky md:top-28 md:w-[36%] md:self-start">
          <h2 className="font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.025em] text-foreground md:text-5xl">
            Common questions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Something else you want to know? Ask us through{' '}
            <ContactLink className="font-semibold text-primary hover:underline" />.
          </p>
        </div>
        {/*
          Native <details>: no JavaScript to load or hydrate, and the answers stay in the HTML. Sharing a name makes
          them exclusive, so opening one closes the others. The open/close animation is in globals.css (.faq-item).
        */}
        <div className="w-full md:pt-1">
          {FAQS.map(faq => (
            <details key={faq.question} name="faq" className="faq-item group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 text-left text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

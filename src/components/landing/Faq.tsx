import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ContactLink } from '@/components/landing/ContactLink'

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
      'Drivers use the RouteyAI app. It shows the next pickup in route order, lets them mark each student boarded or absent with one tap, and shares the bus location every 10 seconds while the route is running.',
  },
  {
    question: 'What do parents see?',
    answer:
      'Parents see their child’s bus on a map, the arrival time for their stop, and school announcements. They get a notification when their child boards or is marked absent, and when the bus is getting close.',
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
    <section id="faqs" className="scroll-mt-16 border-t border-border bg-muted/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:gap-16 md:py-24">
        <div className="shrink-0 md:w-[36%]">
          <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">Frequently asked questions</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Something else you want to know? Ask us through{' '}
            <ContactLink className="font-semibold text-primary hover:underline" />.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full md:pt-1">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`} className="border-b border-border">
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

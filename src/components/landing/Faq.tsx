import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ContactLink } from '@/components/landing/ContactLink'

export const FAQS = [
  {
    question: 'What is RouteyAI?',
    answer:
      'RouteyAI is a school bus platform built for schools in Qatar. It plans your bus routes automatically, tracks every bus live, and keeps parents informed with a dedicated app.',
  },
  {
    question: 'How does the route optimization work?',
    answer:
      'RouteyAI groups students by where they live (K-Means clustering), assigns each group to a bus without going over its capacity, then orders the stops for the shortest trip using real road travel times from Mapbox. Routes recalculate automatically when students are added or removed.',
  },
  {
    question: 'What happens when a new student joins mid-year?',
    answer:
      'Smart Placement assigns the student to the nearest bus that still has free seats, and that route is recalculated. If every nearby bus is full, the school admin is alerted to add a bus.',
  },
  {
    question: 'How do drivers use RouteyAI?',
    answer:
      'Drivers use the RouteyAI mobile app. It shows the next pickup in optimized order, lets them mark each student Boarded or Absent with one tap, and shares the bus location every 10 seconds while the route is running.',
  },
  {
    question: 'What do parents see?',
    answer:
      'Parents see their child’s bus live on a map, an ETA to their stop, and school announcements. They get a push notification when their child boards or is marked absent, and when the bus is getting close.',
  },
  {
    question: 'How is student data protected?',
    answer:
      'Each school’s data is kept separate by access rules enforced in the database itself. Parents can only see their own child’s bus, and drivers can only see the bus they are assigned to.',
  },
  {
    question: 'How do parents and drivers get access?',
    answer:
      'The school sends each parent and driver a personal invite link. They open it, create an account, and land straight in the right view for their role.',
  },
  {
    question: 'When are the mobile apps available?',
    answer:
      'The iOS and Android apps are in final testing. Book a demo and we’ll let your school know as soon as they’re live in the stores.',
  },
  {
    question: 'How much does RouteyAI cost?',
    answer:
      'Pricing depends on the size of your fleet, and every plan includes every feature. Book a demo and we’ll send you a quote.',
  },
]

export function Faq() {
  return (
    <section id="faqs" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <div>
        <div className="flex flex-col gap-10 border-t border-border pt-14 md:flex-row lg:gap-24">
          <div className="md:w-[40%] shrink-0">
            <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.75rem] md:leading-[1.1]">Questions, answered</h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Can’t find your answer? Reach us through{' '}
              <ContactLink className="font-semibold text-primary hover:underline" />.
            </p>
          </div>
          <div className="md:w-[60%] pt-1">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={faq.question} value={`item-${i}`} className="border-b border-border">
                  <AccordionTrigger className="py-5 text-left text-[15px] font-medium text-foreground transition-colors hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-[14px] leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

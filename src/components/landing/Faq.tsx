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
    <section id="faqs" className="py-20 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/40 scroll-mt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-32">
          <div className="md:w-[40%] shrink-0">
            <h2 className="text-3xl md:text-[40px] font-medium text-[#334155] dark:text-slate-200 tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-[#64748B] dark:text-slate-400 text-lg">
              Can’t find your answer? Reach us through{' '}
              <ContactLink className="font-semibold text-[#1E3A8A] dark:text-blue-400 hover:underline" />.
            </p>
          </div>
          <div className="md:w-[60%] pt-1">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={faq.question} value={`item-${i}`} className="border-b border-[#E2E8F0] dark:border-slate-800/60">
                  <AccordionTrigger className="text-left font-medium text-[#334155] dark:text-slate-200 hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 text-[15px] py-5 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#64748B] dark:text-slate-400 leading-relaxed text-[14px] pb-6">
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

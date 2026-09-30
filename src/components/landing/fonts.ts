import { Schibsted_Grotesk } from 'next/font/google'

/**
 * Heading typeface for the marketing pages. Body text stays in Inter, like the product itself.
 * Every `font-display` use is bold, so only the 700 weight is loaded: one small file and a single re-layout.
 */
export const displayFont = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-display',
  display: 'swap',
})

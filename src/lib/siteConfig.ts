// Launch placeholders for the public marketing site. Everything here needs a decision before launch.

/**
 * TODO(launch): set NEXT_PUBLIC_CONTACT_EMAIL (locally and on Vercel) once a real inbox exists.
 * As of 2026-09-29 routeyai.com has no DNS or MX records, so hello@routeyai.com would bounce.
 * While unset, the site hides email links and points visitors to the demo form instead.
 */
export const CONTACT_EMAIL: string | null = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null

/**
 * TODO(launch): the business behind RouteyAI. Qatar's E-Commerce Law (Law No. 16 of 2010) expects a service provider to
 * say who it is and how to reach it. Set these on Vercel (and in .env.local) with the details on the commercial
 * registration; each one is hidden until it is set, so nothing is invented.
 */
export const BUSINESS = {
  /** The legal name exactly as registered, e.g. "Example Trading W.L.L.". */
  legalName: process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME?.trim() || null,
  /** The registered office address. */
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim() || null,
  /** The commercial registration (CR) number. */
  registrationNumber: process.env.NEXT_PUBLIC_BUSINESS_CR_NUMBER?.trim() || null,
  /** A business phone number. */
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim() || null,
} as const

/**
 * TODO(launch): set to true once /privacy, /terms, /cookies and /refunds have had legal review.
 * While false, all four pages show a "draft" notice.
 */
export const LEGAL_REVIEWED = false

/** The date of the current version of the legal pages. Change it whenever their wording changes. */
export const LEGAL_LAST_UPDATED = "10 October 2026"

/**
 * TODO(launch): the refund and cancellation terms you will offer schools, as plain sentences. While null, /refunds says
 * the terms are set out in each school's quote and agreement and promises nothing more.
 */
export const REFUND_TERMS: string[] | null = null

export type PlanName = "Starter" | "Growth" | "Enterprise"

/**
 * TODO(pricing): add what support each plan includes (e.g. "Email support", "Onboarding for your transport team").
 * Empty lists render nothing, so no support promises are shown until these are filled in.
 */
export const PLAN_SUPPORT: Record<PlanName, string[]> = {
  Starter: [],
  Growth: [],
  Enterprise: [],
}

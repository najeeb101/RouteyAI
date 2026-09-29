// Launch placeholders for the public marketing site. Everything here needs a decision before launch.

/**
 * TODO(launch): set NEXT_PUBLIC_CONTACT_EMAIL (locally and on Vercel) once a real inbox exists.
 * As of 2026-09-29 routeyai.com has no DNS or MX records, so hello@routeyai.com would bounce.
 * While unset, the site hides email links and points visitors to the demo form instead.
 */
export const CONTACT_EMAIL: string | null = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null

/**
 * TODO(launch): set to true once /privacy and /terms have had legal review.
 * While false, both pages show a "draft" notice.
 */
export const LEGAL_REVIEWED = false

/** TODO(launch): set the date of the reviewed version. */
export const LEGAL_LAST_UPDATED = "29 September 2026"

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

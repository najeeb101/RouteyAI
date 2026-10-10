"use server"

import { createClient } from "@/lib/supabase/server"
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/siteConfig"
import { demoRequestSchema, type DemoRequestInput } from "@/lib/validations/demoRequest"

export type DemoRequestResult = { ok: true } | { ok: false; error: string }

export async function submitDemoRequest(input: DemoRequestInput): Promise<DemoRequestResult> {
  const parsed = demoRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }
  }

  const { fullName, schoolName, email, phone, fleetSize, message, website } = parsed.data

  // Honeypot filled in: pretend success so bots don't retry.
  if (website) return { ok: true }

  // Keep a record that the visitor agreed to be contacted, and which version of the policy they saw.
  const consentNote = `Agreed to be contacted (privacy policy of ${LEGAL_LAST_UPDATED}) on ${new Date().toISOString()}`
  const notes = [`Fleet size: ${fleetSize}`, message, consentNote].filter(Boolean).join("\n\n")

  const supabase = createClient()
  const { error } = await supabase.from("demo_requests").insert({
    full_name: fullName,
    school_name: schoolName,
    email,
    phone: phone || null,
    notes,
  })

  if (error) {
    console.error("[submitDemoRequest]", error.message)
    const fallback = CONTACT_EMAIL ? ` or email ${CONTACT_EMAIL}` : " in a few minutes"
    return { ok: false, error: `We couldn't send your request. Please try again${fallback}.` }
  }

  return { ok: true }
}

import { z } from "zod"

export const FLEET_SIZES = ["1–5 buses", "6–20 buses", "21–50 buses", "50+ buses"] as const

export const demoRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(120),
  schoolName: z.string().trim().min(2, "Please enter your school's name").max(160),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  fleetSize: z.enum(FLEET_SIZES, { errorMap: () => ({ message: "Please choose a fleet size" }) }),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional().or(z.literal("")),
})

export type DemoRequestInput = z.infer<typeof demoRequestSchema>

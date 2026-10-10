# Legal and accessibility pass (2026-10-10)

What was checked and changed on the website, and what still needs a decision or a lawyer. This is a technical review, not legal advice. Everything marked **Open** needs the owner.

## Done

| Area | Result |
|---|---|
| Legal pages | `/privacy` (expanded), `/terms` (expanded), new `/cookies` and `/refunds`; linked from the footer, every legal page and the sitemap; middleware lists them as public |
| Cookie consent | **No banner needed.** Only strictly necessary storage is used (Supabase sign-in cookies, theme in local storage). No analytics, ads or embeds. Fonts are self-hosted by `next/font`. If analytics is ever added, add a consent banner first |
| Form consent | Demo form has a required, unticked box; the server re-checks it and stores a consent line (policy date and time) in `demo_requests.notes`. Sign-up and invite pages have a required "I agree to the Terms and Privacy Policy" box |
| Data minimised | Demo form asks name, school, email, fleet size; phone and message are optional. No analytics or third-party scripts. Mapbox is only loaded on signed-in dashboards |
| Unsupported claims | Removed "shortest drive", "never see", "can never see", "straight away", "final testing", "so the bus doesn't wait"; ETAs are called estimates. No reviews, ratings or logos existed |
| Honest visuals | The four photos are AI-generated: each now has a visible "Illustration made with AI" label and alt text that says so. Demo screens say their names and times are examples |
| Buttons | "Book my demo" (it sends a request) is now "Send demo request"; "Get a quote" is "Request a quote"; "Get the app" is "About the apps"; the modal's close button is "Close dialog" |
| Accessibility | Skip link and `#main-content` on every layout; visible focus ring on links and buttons; errors linked to fields (`aria-describedby`, `aria-invalid`, `role="alert"`); modal traps focus and returns it; theme switch uses `aria-pressed`; nav labelled; legal links underlined |
| Contrast | Fixed: form errors (3.8 to 6.5), "Live" label (2.6 to 5.5), dashboard secondary text (`ink-2` `#64748B` to `#5B6B82`, so it passes on the grey canvas), `ink-3` text and placeholders moved to `ink-2` |
| Images and licences | Map crops carry the OpenStreetMap credit (ODbL); Mapbox maps keep their attribution control; fonts are open licence |

## Open: needs the owner

1. **Business details.** Set `NEXT_PUBLIC_BUSINESS_LEGAL_NAME`, `_ADDRESS`, `_CR_NUMBER`, `_PHONE` on Vercel. Until then the pages show only the service name and contact link. Qatar's E-Commerce Law (Law 16 of 2010) expects a provider to identify itself.
2. **Contact email.** `NEXT_PUBLIC_CONTACT_EMAIL` is still unset, so the privacy "your rights" and deletion routes point to the demo form. Privacy rights need a real, monitored contact.
3. **Legal review, then `LEGAL_REVIEWED = true`.** The pages are drafts and say so. Have a Qatari lawyer check them, especially the liability wording in Terms.
4. **Refund terms.** `/refunds` promises nothing beyond "set out in your quote or agreement". Decide your terms and fill `REFUND_TERMS` in `siteConfig.ts`.
5. **Retention periods.** The privacy page says periods are set per school. Pick real ones (demo requests, closed schools, GPS history) and write them in.
6. **Children's data.** Qatar's Law 13 of 2016 treats children's data as special (extra care, and in some cases prior permission from the authority). Confirm with a lawyer whether RouteyAI must register or apply before going live with real schools. Schools also need a data-processing agreement with you.
7. **Data location.** Check which region the Supabase project and Vercel use. Sending Qatar residents' data abroad has conditions under the same law. The privacy page says data "may" be processed outside Qatar; make it exact.
8. **AI images.** Check the Higgsfield/Nano Banana plan allows commercial use, and that no image resembles a real person. Copyright in AI output is unsettled, so you may not be able to stop others copying them. Real, signed-release photos are better; then remove the labels.
9. **Logo.** The file is called "logo temp". Confirm you own the artwork (who drew it, any licence), and that it does not copy another brand.
10. **Store badges.** The footer uses Apple and Google logos with "Coming soon". Apple and Google have brand rules for these; swap to their official badges once the apps are live.
11. **`NEXT_PUBLIC_DEMO_MODE`.** Unless it is set to `false` in production, signed-out visitors can open `/school`, `/driver`, `/parent` and `/admin` (RLS still hides the data). Check Vercel and set it to `false`.
12. **Phone app.** It still has the same text-contrast gap (`inkSecondary` on the grey canvas is 4.4:1, `inkTertiary` is 2.6:1). Its sign-in screen has no Terms or Privacy links; account creation happens on the web invite page, which now has the consent box. Store listings need the privacy URL on the final domain.
13. **Other laws to know.** Qatar Consumer Protection Law (Law 8 of 2008) if you ever sell to individuals; Cybercrime Law (Law 14 of 2014) for security duties; schools may have Ministry of Education rules on student data and transport.
14. **Security headers.** The site sends no Content-Security-Policy or similar headers. Worth adding, but it needs testing against Mapbox and Supabase.
15. **Accessibility not covered.** No full screen-reader or keyboard test was run on the dashboards; the Mapbox map cannot be used without a mouse. A manual audit is advised before schools rely on it.

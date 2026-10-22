# Landing page upgrade: more professional, authentic and engaging (2026-10-22)

Goal: https://routeyai.vercel.app should look like a real company with a real product. Rules for the page stay in [Claude.md §6.5](../Claude.md): every claim describes something that ships, and nothing is invented (no logos, quotes or numbers until real ones exist).

## What was weakening the page

1. The main visuals were AI-generated photos (labelled "Illustration made with AI").
2. No proof: no real schools, quotes, numbers or people.
3. No face or business behind it: contact email, business details and CR number unset, legal pages still marked draft, the logo file is "logo temp".
4. Template-sounding copy ("From a list of addresses to buses on the road").
5. The site runs on `routeyai.vercel.app`.

## Phases

### A. Replace the fake with the real (started 2026-10-22)

- [x] Hero: real driver and parent screens over a real Doha street map instead of an AI photo
- [x] App sections: map crops instead of AI photos; privacy band without a photo; all AI labels removed
- [ ] Phone mockups redrawn in the new style and dark (the HTML redraws exist; replace them with real screenshots or a short screen recording when the apps are on a device)
- [ ] A real screen recording of the dashboard planning a route
- [ ] Real photos of buses and streets in Doha, only if properly licensed or taken by us

### B. Look like a real company

- [ ] Final logo and brand mark (replace "logo temp"), favicon and OG image to match
- [ ] Custom domain and a real contact email
- [ ] An About block: who builds RouteyAI, a name, a photo and why
- [ ] Business details, legal review, then `LEGAL_REVIEWED = true`
- [ ] Official Apple and Google badges once the apps are live

### C. More engaging

- [ ] Hero headline that states the outcome, one clear call to action
- [ ] A "day in the life" scroll for the two daily runs (morning pickup, arrival at school, afternoon, the parent's notification at each moment)
- [ ] A no-sign-in interactive demo: drag a student pin and watch the route slot them in
- [ ] Shorter copy, with benefits per role (school admin, driver, parent)
- [ ] Arabic and right-to-left after launch

### D. Proof, only when true

- [ ] After a pilot: one real school quote, a real number (such as minutes saved) or a logo, each with permission
- [ ] Until then, say only what is true ("Now piloting with schools in Doha" only if it is)
- [ ] Strengthen the privacy section with concrete facts

### E. Polish

- [ ] Lighthouse mobile 90 or more; the hero now carries two phone loops, so re-measure first
- [ ] Phone-width and dark-theme checks
- [ ] Analytics only with a consent banner (see the legal plan)

## Open questions for the owner

1. Is there real material: app screenshots or recordings, bus photos, a pilot school, a testimonial?
2. Will you appear on the page with a name, photo and story?
3. Is there a final logo, or should a clean wordmark be designed?
4. Is there a custom domain (such as routeyai.com)?
5. Tone: Karwa and Qatar Metro (calm, precise) or warmer and more human?

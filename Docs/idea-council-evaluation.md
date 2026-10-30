# Idea Council evaluation

**Date:** 2026-10-30. **Method:** [idea-council](https://github.com/amirh3sam/idea-council). Three agents (Believer, Skeptic, Investor) researched the idea independently and in parallel, then a Judge ruled on their full reports. Every claim is labelled **Verified** (sourced), **Inferred** (reasoned from something verified) or **Assumed** (a guess). The figures are as the agents found them on the public web; check a source before relying on it.

**The idea as evaluated:** RouteyAI, a multi-tenant SaaS for private and international schools in Doha that run their own bus fleets: stable morning and afternoon routes, a driver app for runs and attendance, live tracking and alerts for parents, and an admin dashboard that flags children not yet dropped off. Solo founder; the website and dashboard are live, the phone app works but is not in the stores, there are no paying customers yet.

## Result

| Agent | Score | Meaning |
|---|---|---|
| Believer | 6/10 | How strong the honest case for is |
| Skeptic | 6/10 | How severe the case against is (higher is worse) |
| Investor | 5/10 | How good an investment of money and months it is |
| **Judge** | **5/10: NOT YET** | Medium confidence |

**It turns on:** whether enough Doha private schools run their own buses and would pay a new solo vendor over the local GPS vendors and operator apps they can already buy.

**The cheapest next test:** over two weeks, call or visit the transport offices of about 30 Doha private schools. Ask each one:

1. Do you run your own buses?
2. What do you use today, and what do you pay for it?
3. Would you pilot this from January at a stated price?

Count only yeses at a price; "yes, but free" counts as a no. Until those calls are done, build nothing more (store submission, Arabic, the domain) beyond what a credible demo needs.

## Judge's verdict

**NOT YET. Confidence: medium.** All three reports agree the problem is real and the build cost is already spent. None has evidence that a Doha school will pay for this product, so the decision depends on something the council could not measure.

**Reasoning.** The Skeptic and the Investor carried the most weight, because both brought specific, sourced findings. The Believer's claim that competition in Qatar is "thin" is contradicted by the Skeptic's list of at least six vendors with Doha offices and live pages. The Investor then shrinks the buyer pool: schools such as GEMS Wellington hand transport to an operator (STS) whose app already covers parents. Neither finding is fatal alone. Together they mean the real market is own-fleet private schools that are unhappy with what they have, and nobody has counted them.

The strongest argument on the other side is real. The 2022 Al Wakra death is verified, ministry guidance asks for attendance records and contact with parents without naming a system, and the product is built with an estimated 85–97% gross margin at about $60–120 a month fixed cost. Pursuing it costs time and calls, not money. But the differentiator the founder is proudest of, stable capacity-aware routes, may not be what a 5–30 bus school pays for. The safety feature ("not yet dropped off") gets the meeting, and incumbents can copy it easily. The idea does not fail on cost; it is unproven on demand.

There is no single fatal flaw. The regulatory and data-residency objections did not survive research. A free state app for Qatar private schools, like Abu Dhabi's Salama, would come close to fatal if it appeared. The ceiling in Qatar alone is low.

**Where the council disagreed**

- **Competition:** the Believer said thin; the Skeptic said crowded. The Skeptic had much better evidence. Fairest reading: crowded but fragmented.
- **Who buys:** the Believer assumed most private schools run their own transport; the Investor showed verified examples of outsourcing. The own-fleet share is the biggest unknown.
- **Scores:** the Believer's 6 and the Skeptic's 6 point in opposite directions, so averaging them means nothing.

**Evidence quality**

| Agent | Quality | Why |
|---|---|---|
| Believer | Mixed | Market size, the 2022 death, ministry guidance and the UAE precedents are well sourced; the competition claim rests on finding nothing in a search and was refuted |
| Skeptic | Strong | Named, linked competitors, including the closest feature match; it dropped its own objections that failed. The QAR 20 price and the liability and language points are weaker |
| Investor | Mixed to strong | STS, transport fees and infrastructure pricing are verified; the revenue model rests on inputs it labels as assumed |

**What would change the verdict**

- **Up to BUILD, BUT:** 2–3 named Doha schools that run their own fleets agree to a priced pilot for 2027-28. A paid January pilot would be even better.
- **Down to DON'T BUILD:** own-fleet schools are under about 15% of private schools, or most are happy on Effy, STS or similar, or the ministry or Mowasalat announces a free Salama-style app for private schools.

> Worth two weeks of selling to find out, and not yet worth more months of building.

## Believer: the case for (6/10)

- **The buyer pool exists and is growing.** About 354 private schools and kindergartens with 25 curricula [Verified, [QNA, Oct 2026](https://qna.org.qa/en/News-Area/News/2026-10/22/moehe-signs-contracts-for-four-new-private-schools-to-add-5000-student-places)]. More than 271,090 private-school students [Verified, [Qatar Tribune](https://www.qatar-tribune.com/article/260533/latest-news/education-ministry-signs-contracts-to-establish-four-private-schools-with-5000-students)]. About 200,000 students at 310 private schools and kindergartens in 2024–25 [Verified, Gulf Times]. Four new schools contracted in Oct 2026, adding 5,000 places [Verified, QNA]. Sources count differently.
- **The state operator doesn't cover private schools.** Mowasalat/Karwa serves Independent (government) schools; private-school work appears only as "talks" in about 2016 [Verified, [Gulf Times](https://www.gulf-times.com/story/492768/mowasalat-buses-ferry-56000-students-daily)].
- **The worst case happened in Qatar.** In Sept 2022, 4-year-old Minsa Mariam Jacob died locked in a Springfield Kindergarten bus in Al Wakra; the school was shut and three people were arrested [Verified, [Al Jazeera](https://www.aljazeera.com/news/2022/9/12/qatar-launches-investigation-over-death-of-kindergarten-student), [Qatar Tribune](https://www.qatar-tribune.com/article/19581/latest-news/ministry-of-education-shuts-kindergarten-that-witnessed-the-death-of-a-child-student-inside-school-bus)]. A similar death occurred in 2010 [Verified].
- **Ministry guidance asks for what the product records:** attendance records, mandatory supervisors and "procedures for communicating with parents when buses are delayed or arrive early" [Verified, [Qatar Living, Jul 2026](https://www.qatarliving.com/en/article/school-transport-bus-safety-qatar-parents-guide)].
- **Electronic tracking is not universal.** GPS, cameras and electronic attendance "are not publicly listed as universal requirements"; only some schools (GEMS American Academy, ISL Qatar) cite them [Verified, same source].
- **Neighbours treat it as infrastructure.** Abu Dhabi's [Salama app](https://www.mediaoffice.abudhabi/en/transport/integrated-transport-centre-launches-salama-app-to-track-school-buses-in-abu-dhabi/) covers private, public and charter schools; Dubai's DTC School Bus App covers public schools [Verified]. No Qatar equivalent for private schools found [Inferred].
- **Differentiator:** Qatar-facing listings don't advertise capacity-aware stop grouping, stable slot-in routes or per-run absences feeding the driver's list [Inferred; full feature sets not audited].

**Strongest argument:** about 350 private schools must keep bus attendance and keep parents informed, aren't required to have electronic tracking, aren't covered by the state operator, and Qatar had a nationally reported bus death in 2022.

**Who it's for:** the transport coordinator at a mid-sized Doha private or international school with a handful to a few dozen buses, attendance on paper or WhatsApp, and daily "where is the bus?" calls.

**Could not verify:** how many schools run their own fleet; what they pay today; any market size or willingness to pay; whether the ministry plans a state tracking system; Smart Step's and Loqqat's footprint; any customer interest.

## Skeptic: the case against (6/10)

**Load-bearing assumption:** own-fleet Doha private schools are unhappy enough with today's tools to switch to an unproven solo-founder product, and will pay a SaaS fee on top of or instead of hardware they may already have.

- **The local market is crowded** [Verified]. See the competitor list below.
- **Local price anchors are low.** EffyTrack lists a parent app at QAR 20 per parent per month in a safety bundle [Verified via search summary]; incumbents probably bundle hardware [Inferred].
- **A niche in a small country.** 349 private schools and kindergartens in 2024–25, many small; Mowasalat (about 2,500–3,000 buses) has said it is ready to serve private schools [Verified, [Qatar Tribune](https://www.qatar-tribune.com/article/191383/), [The Peninsula](https://thepeninsulaqatar.com/editorial/26/08/2024/ready-for-new-academic-year), [Gulf Times](https://gulf-times.com/story/514693/Mowasalat-adds-150-more-school-buses-to-network)].
- **The differentiator may not sell.** Route optimisation is a nice-to-have for a 5–30 bus school whose officer knows the routes [Inferred].
- **Safety liability on a solo founder:** uptime and incident scrutiny during run windows [Inferred].
- **Phone tracking is less robust than fixed GPS and RFID:** phones die, drivers forget to start runs [Inferred].
- **Language:** Arabic is deferred; drivers may need Urdu, Hindi or Malayalam [Inferred].
- **Children's data** is a "special nature" category under Qatar Law No. 13 of 2016, needing guardian consent [Verified, [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/ck0bhphy2o64h0b33fg2coqvd/)]; procurement may question US hosting [Inferred].
- **Slow sale on a tight calendar** and a **heavy support tail** (store review of background location, push reliability, Doha address geocoding, parent onboarding) [Inferred].

**Who already does this**

| Vendor | What they offer | Link |
|---|---|---|
| Effy Solutions / TrackSchoolBus (Doha) | Route planning, driver and attendant app, RFID attendance, parent app, fee payment; claims 156 projects. Closest match | [effy.qa](https://www.effy.qa/school-bus-tracking-solution/) |
| EffyTrack | Parent app at QAR 20 per parent per month in a safety package | [thevehicletracking.qa](https://thevehicletracking.qa/) |
| Mobitrack | Free parent app; parents can request route or timing changes | [mobitrackonline.com](https://www.mobitrackonline.com/school-bus-tracking-app-qatar/) |
| Loqqat | Parent app, live tracking, delay notifications | [loqqat.com](https://loqqat.com/best-school-bus-tracking-software-in-Qatar) |
| FleetWiz | School, nursery and operator tracking | [fleetwiz.app](https://fleetwiz.app/education/) |
| Gbus | Doha address; details unconfirmed | [Facebook](https://www.facebook.com/gbusforschools/) |
| Vehicle Tracking Qatar | School transportation software | [vehicletracking.qa](https://www.vehicletracking.qa/school-transportation-software/) |
| Smart Step | Operator app with tracking and alerts | [App Store](https://apps.apple.com/bt/app/smart-step-users/id6667094677) |
| STS | Operator (for example GEMS Wellington) with its own parent tracking app | [App Store](https://apps.apple.com/app/id1478135184) |
| Mowasalat (Karwa) | GPS and CCTV on government-school buses; no parent app found | [Qatar Tribune](https://www.qatar-tribune.com/article/191383/) |

Elsewhere: Abu Dhabi [Salama](https://gulfnews.com/living-in-uae/transport/track-your-childs-school-bus-in-real-time-how-to-use-abu-dhabis-salama-app-1.1724930930111) (free, state-run), [SafeBus](https://www.capterra.ae/software/210048/safebus) (UAE), [BatOnRoute / TraceUs](https://www.g2.com/sellers/batonroute) (routing and tracking without hardware, the closest model), [Hafilaty](https://www.menabytes.com/hafilaty-riyadh/) (Riyadh), [eMushrif](https://www.cbinsights.com/investor/emushrif) (Oman, raised USD 7.5M), and in the US Transfinder, Here Comes the Bus and SafeStop.

**Strongest objection:** at least half a dozen Doha vendors already sell tracking with parent apps at low prices, so a solo founder with no customers enters a crowded commodity market with a small paying segment.

**What would have to be true anyway:** incumbents' software is poor in ways schools feel; 2–3 named pilots before next year; stable routing saves measurable time or buses; Arabic and drivers' languages ship before the sale; a clear data, consent and uptime story; run-window support covered, or a partnership with a GPS or transport operator.

**Objections that did not survive research:** Mowasalat covering every school; a hardware tracking mandate; a graveyard of failed apps (none found, so the category is durable); data residency blocking foreign hosting.

## Investor: the economics (5/10)

**Who pays:** the head of transport or bursar at an own-fleet school. Parents and drivers use it but don't pay. Schools that outsource (GEMS Wellington to [STS](https://www.gemswellingtonschool-qatar.com/en/For-Parents/School-Transport)) are mostly not buyers; there the buyer would be the operator.

**What they pay today**

| Item | Figure | Label |
|---|---|---|
| Transport fee, GEMS Wellington 2025-26 | QR 4,310 / 7,530 / 9,150 per child per year | Verified |
| Transport fee, ISC Doha 2024-25 | QR 5,000 per child per year | Verified |
| Busontime (UAE, 2015) | AED 20,000–50,000 per school per year, some with devices | Verified |
| SafeBus | From $1.50 per student per month | Verified |
| Bustrak | $40 per month for 10 buses or fewer | Verified |
| SmartBus | About $25 per vehicle per month | Inferred |
| Edulog | $5k–50k per year | Inferred |

Most vendors, including TrackSchoolBus, quote on request. What own-fleet Qatar schools pay today is unknown; it may be nothing (WhatsApp and spreadsheets).

**Build cost:** mostly sunk. Left before anyone can pay: store submission ($99 a year Apple, $25 once Google), a custom domain and Arabic. About 4–10 more weeks of solo work [Inferred].

**Running cost**

- Fixed, about $60–120 a month at pilot scale: Supabase Pro from $25, Vercel Pro $20 per seat (Hobby is non-commercial only), Apple about $8 a month [Verified].
- Mapbox free tiers cover a pilot: 25k mobile MAU, 50k web map loads, 100k geocoding and Directions requests, 100k Matrix elements a month [Verified].
- Beyond free tiers, roughly $1–6 per bus per month [Inferred].
- The real recurring cost is support: address cleaning, driver training, parent calls [Assumed].

**Time to first revenue:** about 3–10 months. The school year started around 1 Sept 2026, so realistically a pilot from January and a paid contract for Aug/Sept 2027.

**Arithmetic** (inputs Assumed unless noted)

- Price $30–60 per bus per month; a typical school of 20 buses and about 800 children.
- Revenue: 20 × $30–60 = $600–1,200 a month, $7.2k–14.4k a year.
- That school collects about QR 3.4M–7.3M a year in transport fees, so the software is about 0.4–1.5% of it.
- Live GPS: an update every 5 s over 2–3 h a day is 32k–48k updates per bus per month; with 5–20 parents watching that is 160k–950k Realtime messages, about $0.40–2.40 per bus per month past Supabase's included 5M.
- Gross margin about 85–97% before support.
- Market shape: if 20–40% of about 310–354 private schools run their own fleet, that is 60–140 schools; winning 5–15 gives about $36k–216k a year.

**Moat:** weak. The common features are easy to copy. The stable-route logic, a local founder with Arabic, and each school's cleaned stop data and trained drivers are harder to copy. A real moat would be distribution: reference schools, a school group (GEMS, SABIS) or an operator partnership.

**Unknowns that would change it**

- The share of private schools that run their own buses. Below about 15%, the Qatar-only case does not close.
- What a school will pay and who signs.
- Whether operators (STS, Mowasalat) would license it white-label.
- Whether a ministry or national parent app is coming.
- Support hours per school in the first term, which decide whether one founder can serve more than about 5 schools.

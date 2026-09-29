# Landing Page Premium Enhancements Implementation Plan

> **Superseded (2026-09-29)** by [2026-09-29-landing-page-launch.md](2026-09-29-landing-page-launch.md). Framer Motion, the app mockups and the final CTA from this plan have shipped; kept for history only.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the RouteyAI landing page from a standard SaaS site to an elite, interactive experience using micro-animations, high-fidelity mockups, and trust-building sections.

**Architecture:** 
- Use **Framer Motion** for scroll-reveal and micro-interactions.
- Replace generic icons with generated high-fidelity mobile mockups.
- Maintain the current "Doha-optimized" color palette (Slate + Blue).

**Tech Stack:**
- Next.js (App Router)
- Tailwind CSS
- Framer Motion
- Lucide React

---

### Task 1: Environment Setup
**Files:**
- Modify: `package.json`

**Step 1: Install Framer Motion**
Run: `pnpm add framer-motion`

**Step 2: Commit**
```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add framer-motion for animations"
```

---

### Task 2: Core Animation Framework
**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add Motion Wrappers**
Wrap major sections (Hero, Features, Two Surfaces, FAQ) in `<motion.section>` with `initial={{ opacity: 0, y: 20 }}` and `whileInView={{ opacity: 1, y: 0 }}`.

**Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: add scroll-reveal animations to all sections"
```

---

### Task 3: Interactive Map Illustration
**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Animate SVG Paths**
Use `framer-motion` to animate the `strokeDasharray` and `strokeDashoffset` of the bus route paths to simulate "drawing" the routes as the user scrolls.

**Step 2: Animate Bus Markers**
Add a "pulsing" effect to the school and bus markers in the SVG illustration.

**Step 3: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: animate map illustration routes and markers"
```

---

### Task 4: High-Fidelity Mobile Mockups
**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Integrate Mockups**
Replace the Lucide icons in the "Driver" and "Parent" cards in the "Two surfaces" section with the generated mobile mockups (driver_app_mockup.png and parent_app_mockup.png). Use absolute positioning to make them "peek" out of the cards for a modern look.

**Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: integrate high-fidelity mobile mockups"
```

---

### Task 5: Trust & Credibility Section
**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add "Coming Soon to Qatar's Leading Schools" section**
Insert a new section below the Hero or Features section showing grayscale logos (placeholders) of prestigious schools to build brand authority.

**Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: add school trust bar section"
```

---

### Task 4: Final Conversion CTA
**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add Minimalist Final CTA**
Add a clean, centered section before the footer on the `#F8FAFF` background.
Heading: "Ready to optimize your school's commute?"
Subtext: "Join the waiting list for our next pilot program in Doha."
CTA: "Contact Sales" button.

**Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: add minimalist final conversion section"
```

# Native GHL Build Sheet — Idaho Perio Implant Landing Page

This is a "paint by numbers" guide for rebuilding the landing page using GHL's
own drag-and-drop elements instead of a code box. Once it's built this way,
every future edit — colors, text, images — is point-and-click inside the
native editor. No code.

Exact element names vary a little by GHL version/plan (e.g. "Icon List" vs.
"Feature List", "Accordion" vs. "FAQ"). If your library doesn't have the exact
name below, use the closest equivalent — the layout described will still work.

## Before you start: global settings

- **Funnel/Page fonts**: set Heading font = **Poppins** (weight 700–800),
  Body font = **Inter** (weight 400–600). Set this once in the page/funnel's
  font settings so every Headline/Text element inherits it.
- **Palette** — keep this table open while you style each element:

| Name | Hex | Used for |
|---|---|---|
| Navy | `#0f2a43` | Headlines, header bg on dark sections |
| Navy Dark | `#0a1d30` | Darkest backgrounds (top bar, footer) |
| Teal | `#12807e` | Eyebrows, links, icon accents |
| Teal Light | `#e8f5f4` | Light backgrounds behind teal icons |
| Orange (CTA) | `#e8734a` | Every button that should convert |
| Gold | `#c9a15a` | Small accents on dark backgrounds only |
| Ink | `#1c2b36` | Body text on white |
| Gray | `#5b6b76` | Secondary/supporting text |
| Soft Gray bg | `#f6f9fa` | Alternating section backgrounds |
| Border | `#e3e9ec` | Card borders |

- **Name your hero form section** `consult-form` (GHL lets you name a
  Row/Section for anchor linking). Every "Get My Free Consultation" button on
  the page will use "Scroll to Element" targeting this name — that's how the
  page stays single-goal without a nav menu.

Build the sections top to bottom in this order:

---

## 1. Top trust bar
- **Section background:** Navy Dark `#0a1d30`. Padding: small (~9px top/bottom).
- **Row:** 2 columns, space-between, vertically centered.
  - Left: Text — `★★★★★ Rated by patients across Boise & Meridian, ID` (stars in Gold `#c9a15a`, rest in light blue-gray `#dce8ee`, ~13.5px).
  - Right: Text — `Board-Certified Periodontists  |  Same-Week Appointments Available` (`#dce8ee`, 13.5px).

## 2. Header
- **Section background:** White. Bottom border 1px `#e3e9ec`. Padding ~16px.
- **Row:** 2 columns, space-between, vertically centered.
  - Left: your real **logo image** (or a Headline "IDAHO PERIO" — "IDAHO" in Navy, "PERIO" in Teal, Poppins 800, 22px).
  - Right: nested row —
    1. Phone icon + Text/Button set to **link type "Call Phone Number"** → `(208) 377-2777` *(swap for your call-tracking number)*, bold, Teal.
    2. Button: `Get My Free Consultation` — background Orange, white text, bold → **link = Scroll to Element → `consult-form`**.
    3. On this button, set **visibility: hide on mobile** (there's a mobile CTA bar instead — see section 12).

## 3. Hero
- **Section background:** gradient Navy `#0f2a43` → Navy Dark `#0a1d30` (or solid Navy if your plan's section background doesn't support gradients). Padding ~56px top / 70px bottom.
- **Row:** 2 columns (~60/40 split), stacks on mobile.
- **Left column, top to bottom:**
  1. Text (eyebrow): `BOISE & MERIDIAN'S DENTAL IMPLANT SPECIALISTS` — uppercase, Gold, bold, 13px, letter-spaced.
  2. Headline (H1): `Missing Teeth? Get Your Confident Smile Back — Sometimes in Just One Day.` — white, Poppins 700, ~40px. If your Headline element supports inline color, make "Sometimes in Just One Day." Gold.
  3. Paragraph: `Idaho Perio's board-certified periodontists have placed thousands of dental implants for patients tired of loose dentures, gaps, and avoiding the foods they love. Find out if you're a candidate — free, no pressure.` — light `#cfdce3`, 19px, max width ~560px.
  4. **Icon List** (checkmark icon, Gold), 4 items, text `#e6eef2`:
     - Free implant consultation & 3D CT scan
     - Board-certified periodontists — not a general dentist referral
     - Teeth-in-a-Day & All-on-4/All-on-6 options available
     - Financing available — most insurance accepted
  5. **Button group** (side by side):
     - `Get My Free Consultation` — Orange bg, white text → Scroll to `consult-form`.
     - `Call (208) 377-2777` — transparent bg, white 2px border, white text → Call Phone Number link.
  6. Small text: `Locations in Boise (Eagle Rd) & Meridian, ID · Most dental insurance accepted · CareCredit & in-house financing` — `#a9bdc7`, 13.5px.
- **Right column — the form card** (this Row/Column *is* `consult-form`):
  - Container styling: white background, 16px corner radius, ~28px padding, drop shadow.
  1. Small badge/Text: `Free — No Obligation` — Teal Light background, Teal text, bold, small, padded.
  2. Headline (H3): `Request Your Free Implant Consultation` — Navy, Poppins 700, ~21px.
  3. Paragraph: `Tell us a little about your smile goals. A patient coordinator will call you within one business hour during office hours.` — Gray, 14px.
  4. **Drop in GHL's native Form element here** (Sites → Forms → build one with Name / Phone / Email / a dropdown "What best describes your situation?" with options: *Missing one or more teeth*, *Currently wear a denture / partial*, *Loose or failing teeth*, *Just exploring options*). Style its submit button: Orange bg, white text, `Get My Free Consultation →`.
  5. Small disclaimer text under the form, centered, `#8a97a1`, ~11.5px: `By submitting, you agree to be contacted by Idaho Perio by phone, text, or email. Message/data rates may apply.`

## 4. Problem section ("Sound Familiar?")
- **Section background:** Soft Gray `#f6f9fa`.
- **Section head** (centered, max width ~720px): Eyebrow `SOUND FAMILIAR?` (Teal) → Headline `You Don't Have to Live With This Anymore` (Navy) → Paragraph `If any of these describe you, dental implants could give you your life back.` (Gray).
- **2×2 grid** of cards (white bg, `#e3e9ec` border, 12px radius, padding ~20px), each with a small warning-circle icon in Orange + bold text next to it:
  1. Your denture slips, clicks, or rubs sore spots
  2. You avoid steak, corn, apples, or anything "chewy"
  3. You cover your mouth when you laugh or smile in photos
  4. A dentist told you "there's nothing more we can do" or that you need bone grafting first

## 5. Solution / benefits section
- **Section background:** White.
- **Section head:** Eyebrow `THE IDAHO PERIO DIFFERENCE` (Teal) → Headline `Permanent Teeth That Look, Feel, and Function Like Your Own` → Paragraph `Unlike dentures, dental implants are anchored directly into the jaw — so they don't slip, don't need adhesive, and help preserve your jawbone and facial structure.` (Gray).
- **4-column grid** of benefit cards (white bg, `#e3e9ec` border, 14px radius, centered text, circular Teal-Light icon badge with Teal icon):
  1. **Built to Last** — With proper care, implants are designed to last decades — often a lifetime.
  2. **Look & Feel Natural** — Custom-matched crowns blend seamlessly with your smile — no one will know.
  3. **Teeth-in-a-Day Available** — Qualifying patients can walk out with a full new smile in a single visit.
  4. **Eat What You Love Again** — Restore up to full biting force — steak, corn on the cob, apples, all back on the menu.

## 6. "What Happens After You Book" (process steps)
- **Section background:** Navy `#0f2a43`.
- **Section head:** Eyebrow `SIMPLE, GUIDED PROCESS` (Gold) → Headline `What Happens After You Book` (white) → Paragraph `No pressure, no obligation — just clarity on your options.` (light gray `#c3d3da`).
- **4-column grid**, each card a semi-transparent panel (white @ ~6% opacity bg, white @ 12% border, 14px radius). Inside each: a numbered circle badge (Gold bg, Navy Dark bold number, 1–4 — this *is* a real sequence, so numbering is appropriate here), a white Headline, and a light-gray paragraph:
  1. **Free Consultation** — Meet with one of our periodontists, get a free 3D CT scan, and ask every question you have.
  2. **Personalized Plan** — We build a treatment plan and cost breakdown tailored to your mouth, budget, and timeline.
  3. **Implant Placement** — Your implants are placed comfortably in-office, with sedation options available.
  4. **Your New Smile** — Heal, get your final restoration, and get back to living — and smiling — without limits.

## 7. Meet the doctors
- **Section background:** White.
- **Section head:** Eyebrow `WHO YOU'LL SEE` (Teal) → Headline `Board-Certified Periodontists, Not a Referral List` → Paragraph `You're treated directly by implant specialists with advanced surgical training — not a general dentist who outsources the surgery.` (Gray).
- **3-column grid** of doctor cards (white bg, `#e3e9ec` border, 14px radius): real headshot image on top (Teal-Light placeholder until you have one), then Name (Navy, Poppins 700, 17px), Role (Teal, bold, small: `Board-Certified Periodontist`), description (Gray, 14px):
  1. **Dr. Jace Hansen** — Specializes in dental implants, All-on-4/All-on-6 full-arch restoration, and laser periodontal therapy.
  2. **Dr. Kip Katseanes** — Focuses on complex implant cases, bone grafting, and same-day Teeth-in-a-Day procedures.
  3. **Dr. Christopher Sprott** — Brings advanced surgical training in implant placement and minimally invasive gum treatment.

## 8. Testimonials
- **Section background:** Soft Gray `#f6f9fa`.
- **Section head:** Eyebrow `REAL PATIENTS, REAL RESULTS` (Teal) → Headline (mark clearly as placeholder until you swap in real reviews).
- **If your GHL plan has a native Google Reviews widget**, use that instead of manual cards — it pulls live reviews automatically and needs zero upkeep. Otherwise: **3-column grid** of testimonial cards (white bg, `#e3e9ec` border, 14px radius): 5 Gold stars, italic-free quote (Ink color), then bold Navy name + Gray location underneath.
- **Do not publish invented quotes attributed to real people** — pull actual reviews from your Google Business Profile before this goes live.

## 9. FAQ
- **Section background:** White. Centered column, max width ~820px.
- **Section head:** Eyebrow `COMMON QUESTIONS` (Teal) → Headline `You Ask, We Answer`.
- Use GHL's native **Accordion/FAQ element**, 5 items:
  1. **Does getting a dental implant hurt?** — Most patients report the procedure is far more comfortable than expected. We use local anesthesia and offer sedation options, and most people manage any post-procedure soreness with over-the-counter pain relief.
  2. **How much do dental implants cost?** — Cost depends on how many teeth you're replacing and your specific case. That's exactly what your free consultation and 3D scan are for — you'll leave with a clear, personalized price and financing options before deciding on anything.
  3. **I was told I'm not a candidate / need bone grafting. Can you still help?** — Often, yes. Our periodontists specialize in complex cases, including bone grafting and patients who've been turned away elsewhere. A second opinion is free — it costs nothing to find out your real options.
  4. **How long does the whole process take?** — It varies by case. Some patients qualify for Teeth-in-a-Day, while others need a few months for healing between steps. We'll map out your exact timeline at your consultation.
  5. **Do you accept insurance or offer financing?** — We accept most dental insurance plans and offer financing options, including CareCredit, to help make treatment affordable.

## 10. Final CTA
- **Section background:** gradient Teal `#12807e` → `#0d5f5d` (or solid Teal). Centered content, text white.
- Headline: `Your New Smile Starts With One Free Conversation`.
- Paragraph (light teal `#dff2f0`): `Appointments in Boise & Meridian are limited each week for new implant consultations. Reserve yours today.`
- Button: `Get My Free Consultation` — Orange bg, white text → Scroll to `consult-form`.

## 11. Footer
- **Section background:** Navy Dark `#0a1d30`. Text color `#9fb2bc`.
- **Row, 2 columns:**
  - Left: logo/name, `6019 N Eagle Rd, Boise, ID 83713`, phone (Call link), `Boise & Meridian, ID`.
  - Right: `Mon–Thu: 8:00am–5:00pm` / `Fri: 8:00am–2:00pm` / `Sat–Sun: Closed`.
- Bottom legal line (small, `#6f8590`): `© [year] Idaho Perio. This is a promotional landing page; individual results vary.` + a **Privacy Policy** link to your real policy page.

## 12. Sticky mobile CTA bar
- Build one more Row with 2 buttons: `Call Now` (Navy bg, white text, phone icon → Call link) and `Free Consultation` (Orange bg, white text → Scroll to `consult-form`).
- In that Row/Section's **Advanced settings**, turn on **Sticky** (position: bottom) and set **visibility: mobile only**. This keeps a tap-to-call/tap-to-book bar pinned to the bottom of the screen on phones — the highest-intent action for TV-to-mobile traffic — without cluttering the desktop view.

---

## Required swaps before going live
Same list as the code version — don't skip these:
- Real GHL Form embedded in the hero card (not a placeholder).
- Phone number → a **call-tracking number**, not the main office line, so you can attribute calls to this campaign.
- Real logo + doctor headshots.
- Real, verified patient reviews in place of the sample testimonials.
- Real Privacy Policy link in the footer.

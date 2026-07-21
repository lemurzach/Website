# Idaho Perio — Implant Consultation Landing Page (GoHighLevel Template)

A single-goal funnel landing page built for driving TV/Display traffic to a free
dental implant consultation offer for Idaho Perio (Boise & Meridian, ID).

File: `index.html` — one self-contained file (HTML + CSS + JS, no external
dependencies besides a Google Fonts link).

## Why it's built this way

TV/Display traffic is cold and low-intent, so the page is intentionally:
- **Single-purpose** — no site navigation, no links off the page. Every path leads to the form or the phone number.
- **Above-the-fold offer** — headline, offer, and a lead form are visible without scrolling on desktop.
- **Objection-first structure** — Problem → Solution/Benefits → Process → Credibility (doctors) → Proof (testimonials) → FAQ (cost/pain/time objections) → final CTA.
- **Mobile-biased** — TV-to-mobile is common (someone sees the ad, picks up their phone). There's a sticky "Call Now / Free Consultation" bar on mobile at all times.
- **Click-to-call everywhere** — phone number is tappable in the header, hero, and sticky bar, since implant leads often convert better by phone than form for an older demographic.

## How to publish this in GoHighLevel

**Option A — Fastest: full custom-code funnel page**
1. In GHL: Sites → Funnels → create a new funnel → add a step.
2. On the step, choose the blank/custom-code page type (or add a full-width "Custom HTML/Code" element that spans the entire page).
3. Open `index.html`, copy everything, and paste it in.
4. Save + preview on desktop and mobile.

**Option B — More editable: rebuild inside GHL's drag-and-drop builder**
1. Move the big `<style>` block into **Page Settings → Custom CSS**.
2. Every section in `index.html` is marked with an HTML comment like `<!-- SECTION: Hero -->`. Add one GHL section per marked block, and paste that block's HTML into a Custom HTML element inside it.
3. Rebuild the lead form using GHL's native **Form** element instead of the placeholder form (see below) so submissions land in your CRM/pipeline.

## Required swaps before going live

Search the file for `GHL:` — every instance marks something to change:

| What | Where | Action |
|---|---|---|
| Lead form | `#ghl-form-embed` in the hero | Delete the placeholder `<form>` and paste your real GHL Form/Survey embed code (Sites → Forms → your form → Integrate → Embed Code) so leads actually reach your CRM. |
| Phone number | Header, hero, footer, sticky bar (`tel:+12083772777`) | Swap for a **call-tracking number** (GHL's built-in tracking number or CallRail) so you can attribute calls to this specific campaign — don't send TV traffic to the main office line. |
| Logo | Header + footer `.logo` div | Replace text logo with the real Idaho Perio logo image. |
| Doctor photos | `.doctor-photo` placeholders | Swap in real headshots of Dr. Hansen, Dr. Katseanes, Dr. Sprott. |
| Testimonials | Testimonials section | Replace the sample quotes with real, verified reviews (pull from your Google Business Profile or GHL Reputation widget — don't publish invented quotes attributed to real people). |
| Tracking pixels | Just before `</body>` | Add your Meta Pixel / Google Ads conversion tag, or use GHL's Sites → Settings → Tracking Code instead. |
| Privacy Policy link | Footer | Point to your real privacy policy URL. |

## Optional next steps once it's live

- Connect a GHL **Calendar** widget so hot leads can self-book a consultation time instead of only waiting for a callback.
- Set up a GHL **workflow** triggered by form submission: instant SMS/email confirmation to the lead + notification to your front desk, with a follow-up sequence for no-shows.
- A/B test the headline and hero image once you have volume — swap the `<h1>` copy and re-publish as a second funnel step.
- Since `meta name="robots"` is set to `noindex`, this page won't compete with idahoperio.com in search — keep that tag if you don't want the two pages fighting for the same keywords.

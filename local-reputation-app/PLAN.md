# PLAN

Working name: **Local Reputation** (placeholder — set `NEXT_PUBLIC_APP_NAME` when the brand is decided).

## Product

A simple, cheap alternative to SOCi for single-location and small multi-location local businesses: dentists, med spas, optometrists and home-services companies (plumbing, HVAC, roofing, cleaning).

It does three things:

1. **Google reviews** — pulls reviews from the customer's Google Business Profile, drafts an on-brand reply with Claude, and lets the owner approve, edit or auto-post it.
2. **Social posts** — generates a month of posts from what the business actually does and schedules them to Facebook, Instagram and Google Business Profile.
3. **Listings scan** — checks the business's name, address, phone, hours and website across Google, Facebook and Yelp and flags anything wrong or inconsistent.

### Selling points

- **Set up in under 10 minutes.** The owner pastes their website URL; we pre-fill the business profile, brand voice and first batch of posts. Every phase must protect this. If a step adds setup time, cut it or make it optional.
- **One flat monthly price.** No per-location sales call, no annual contract, no feature tiers at launch.

### Who uses it

- **Owner / office manager** — non-technical, busy, on a phone half the time. Wants to approve things, not build them.
- **Agency / multi-location operator** (later) — one login, several workspaces.

### Non-goals for v1

Social inbox/DMs, TikTok/LinkedIn/X, paid ads, review-request SMS campaigns, white-labelling, a mobile app.

## Stack

| Layer           | Choice                                                                             | Notes                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router)                                                            | Server Components + Server Actions by default; Route Handlers for webhooks, OAuth callbacks and cron.          |
| Language        | TypeScript (strict)                                                                |                                                                                                                |
| UI              | Tailwind CSS v4 + shadcn/ui (Radix, `new-york` style)                              | Components are copied into `src/components/ui` as needed.                                                      |
| Database + Auth | Supabase (Postgres, Auth, RLS)                                                     | `@supabase/ssr` for cookie sessions. Every table is scoped to a workspace and protected by Row Level Security. |
| Payments        | Stripe                                                                             | Checkout + Customer Portal + webhooks. One flat monthly price.                                                 |
| AI              | Claude API (`@anthropic-ai/sdk`)                                                   | Website → profile extraction, post generation, review reply drafts. Model set by `ANTHROPIC_MODEL`.            |
| Hosting         | Vercel                                                                             | Vercel Cron for scheduled publishing and review sync.                                                          |
| External APIs   | Meta Graph API, Google Business Profile APIs, Google Places API (New), Yelp Fusion | Called with `fetch`; no extra SDKs planned.                                                                    |

Code layout:

```
src/
  app/                 routes (marketing, (app) dashboard, api/*)
  components/ui/       shadcn/ui components
  lib/supabase/        client.ts (browser), server.ts (RSC/actions), admin.ts (service role)
  lib/anthropic.ts     Claude client + model
  lib/stripe.ts        Stripe client
```

### Libraries

Installed now: `next`, `react`, `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@anthropic-ai/sdk`, shadcn/ui's runtime deps (`radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`), `eslint`, `eslint-config-next`, `prettier`.

**Anything else needs approval first.** Candidates we will probably want, to decide when the phase arrives:

| Library                                    | Why                                                                   | Phase    |
| ------------------------------------------ | --------------------------------------------------------------------- | -------- |
| `supabase` (CLI, dev dep)                  | Local Postgres, SQL migrations, generated TypeScript types            | 1        |
| `zod`                                      | Validate form input, API payloads and Claude's structured output      | 1–2      |
| `server-only`                              | Build error if server code (secret keys) is imported into the browser | 1        |
| `react-hook-form` + `@hookform/resolvers`  | shadcn/ui's `Form` component is built on these                        | 1        |
| `date-fns` / `date-fns-tz`                 | Scheduling posts in the business's time zone                          | 3–4      |
| Email provider (e.g. `resend`)             | "New review" alerts and the Reputation Score report email             | 6–7      |
| `prettier-plugin-tailwindcss`              | Auto-sorts Tailwind classes                                           | any time |
| Test runner (`vitest`, `@playwright/test`) | Unit + end-to-end tests                                               | 10       |

## Data model (sketch)

All app tables carry `workspace_id` and an RLS policy of "user is a member of this workspace".

- `workspaces` — one per business (later: many per agency). Name, time zone, Stripe customer/subscription IDs, plan status.
- `workspace_members` — `user_id`, `workspace_id`, `role` (`owner`, `member`).
- `business_profiles` — name, category, address, phone, hours, website, services, brand voice, source URL.
- `integrations` — provider (`meta`, `google`), encrypted access/refresh tokens, expiry, connected account IDs (FB Page, IG account, GBP location).
- `posts` — body, media, target channels, status (`draft`, `scheduled`, `published`, `failed`), `scheduled_for`, per-channel result/IDs.
- `reviews` — GBP review ID, rating, text, author, created time, reply status.
- `review_replies` — draft text, final text, posted at, posted by (user or auto).
- `listing_scans` / `listing_findings` — per source: what we found, what's expected, mismatch type.
- `public_scans` — lead-magnet scans (no workspace), email captured, score, rate-limit metadata.

## Phases

Each phase ends deployable to Vercel with migrations applied. "Done when" is the acceptance bar.

### Phase 1 — Auth + workspaces

- Supabase Auth: email magic link + Sign in with Google.
- Session-refresh `proxy.ts` (Next 16's replacement for `middleware.ts`) and protected `(app)` route group.
- Create workspace on first sign-in; `workspaces` + `workspace_members` with RLS.
- App shell: sidebar, workspace name, sign out.
- SQL migrations checked into the repo.

**Done when:** a new user can sign up, lands in their own empty workspace, and cannot read another workspace's rows (verified with two test users).

### Phase 2 — Onboarding from website URL

- Single field: "What's your website?"
- Server fetches the homepage (and a few obvious pages: about, services, contact), strips to text, and asks Claude for structured output: name, category, address, phone, hours, services, service area, brand voice, sample tone.
- Owner reviews a pre-filled form, fixes anything wrong, saves `business_profiles`.
- Graceful fallback when the site can't be fetched (manual form, still pre-filled from Google Places if we find a match).

**Done when:** pasting a real dentist or HVAC site produces a mostly-correct profile in under 30 seconds and the owner can finish onboarding in under 2 minutes.

### Phase 3 — AI post generator

- Generate N posts (default: 12 for the month) from the business profile, with a mix of types: service spotlight, tip, seasonal, promo, FAQ, team/behind-the-scenes.
- Per-channel variants (GBP length limits, Instagram needs an image, hashtags only where they fit).
- Edit, regenerate one, delete, approve. Calendar/list view.
- Images: v1 uses owner uploads to Supabase Storage or a simple branded text card; no AI image generation yet.

**Done when:** one click produces a month of posts that an owner would approve with light edits, and they can be placed on a calendar.

### Phase 4 — Facebook / Instagram connect + publish

- Facebook Login for Business; owner picks the Page and its linked Instagram professional account.
- Store tokens encrypted (`TOKEN_ENCRYPTION_KEY`); handle expiry and "reconnect" state.
- Publisher: Vercel Cron every few minutes picks due `posts`, publishes to FB Page and IG (container → publish), records IDs or errors, retries with backoff.
- **Start Meta App Review early** — publishing for customers needs approved permissions, and review takes weeks.

**Done when:** a scheduled post appears on a real test Page and Instagram account at the right local time, and a failure shows a clear reason in the UI.

### Phase 5 — Google Business Profile reviews + posts

- Google OAuth (`business.manage`); owner picks the location.
- Sync reviews on a schedule (and on demand) into `reviews`.
- Publish posts to GBP (local posts) via the same publisher.
- **Apply for Business Profile API access at the start of the project** — it's gated by Google and blocks this phase.

**Done when:** reviews for a real location show up in the app within one sync cycle, and a scheduled post appears on the GBP listing.

### Phase 6 — AI review replies

- Draft a reply for each new review using the profile's brand voice; different handling for 1–2★ (apologise, take it offline, never argue) vs 4–5★ (thank, mention service specifically).
- Healthcare guardrail: replies must never confirm someone is a patient or mention treatment details (HIPAA). Same caution for med spas.
- Approve / edit / post. Optional auto-reply for 4–5★ only.
- Email alert for new reviews (needs an email provider, see Libraries).

**Done when:** a new review gets a sensible draft within one sync cycle and the owner can post it in one tap; negative-review and healthcare guardrails pass a set of sample reviews.

### Phase 7 — Listings scan / Reputation Score (public lead magnet)

- Inside the app: scan Google (Places), Facebook Page and Yelp for the business; compare NAP (name, address, phone), hours, website and category against `business_profiles`; list mismatches with how to fix them.
- Public page (no login): enter business name + city → Reputation Score (0–100) from rating, review count, review recency, reply rate, listing consistency, and posting activity where visible. Show the top 3 problems; email capture for the full report; CTA to start a trial.
- Rate-limit and cache public scans (Places API costs money); store results in `public_scans`.

**Done when:** the public page returns a score for a real business in under 10 seconds, is shareable by URL, and leads land in the database.

### Phase 8 — Dashboard

- Home screen: Reputation Score trend, average rating, new reviews, reviews needing a reply, upcoming posts, listing issues, connection health ("Instagram disconnected — reconnect").
- Everything links to the action that fixes it.

**Done when:** an owner can see what needs attention and act on it from the home screen in one tap each.

### Phase 9 — Stripe billing

- One flat monthly price (`STRIPE_PRICE_ID`), free trial, Stripe Checkout, Customer Portal for card changes/cancel.
- Webhook keeps `workspaces` plan status in sync; gate publishing/auto-replies when unpaid, keep read access.

**Done when:** a test-mode customer can subscribe, cancel and resubscribe, and the app reflects each state within seconds of the webhook.

### Phase 10 — Polish + launch

- Time the full signup → first scheduled post → first review reply flow; get it under 10 minutes on a phone.
- Empty states, loading/error states, mobile layout, accessibility pass.
- Marketing landing page, pricing page, terms, privacy policy (needed for Meta and Google app review too).
- Error monitoring, Vercel analytics, backups, production env vars, custom domain.
- Seed tests for the critical paths.

**Done when:** three real businesses complete setup unaided in under 10 minutes.

## Long-lead items (start now, in parallel with Phase 1)

1. **Google Business Profile API access request** — required for Phase 5.
2. **Meta app + Business Verification + App Review** — required to publish for customers in Phase 4.
3. Privacy policy and terms URLs — both reviews above ask for them.

## Open questions

- Product name and domain.
- Price point, trial length, and whether multi-location is priced per location.
- Auto-post review replies by default, or always require approval?
- Which email provider for alerts and the lead-magnet report?

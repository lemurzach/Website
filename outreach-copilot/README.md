# Outreach Copilot

A team tool that researches a prospect (website content, SEO signals, ad
activity, tech stack), drafts a cold email grounded in what it actually
finds, and sends it from the rep's own Gmail account — not a bulk sender
domain — because that's the single biggest lever for actually landing in the
inbox instead of spam.

## How it works

1. A rep signs in with their work Google account. Everyone who signs in with
   the same email domain shares one workspace (org), so the team sees the
   same prospect list.
2. They add a company name, website, and the prospect's contact email.
3. In the background: Playwright scrapes the site (content, headings, and
   detected ad/analytics pixels — Google Ads, Meta Pixel, GTM, TikTok, etc.),
   Google's PageSpeed Insights API pulls SEO/performance signals, and the Meta
   Ad Library API checks whether the company is currently running ads.
4. Claude extracts 3–6 specific, evidence-backed insights from all of that —
   it's instructed to skip anything it can't point to concrete data for.
5. Claude drafts a short (4–6 sentence) email referencing 2–3 of those
   insights, signed with the rep's real name. No generic flattery, no
   buzzwords.
6. The rep reviews and edits the draft, then hits **Send from my Gmail** —
   which sends via the Gmail API using their own OAuth grant. The email
   genuinely comes from their inbox, with their sending reputation.

## Local setup

Requires Node 20+, a Postgres database, and the credentials below.

```bash
npm install
cp .env.example .env   # fill in every variable — see "Getting credentials" below
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

## Getting credentials

You need four things before this runs: an Anthropic API key, a Postgres
database, and a Google OAuth client (which doubles as both login and the
Gmail-sending permission).

### 1. Anthropic API key

Create one at [console.anthropic.com](https://console.anthropic.com) →
API Keys. Set it as `ANTHROPIC_API_KEY`.

### 2. Postgres database

Any Postgres works. The fastest path: [neon.com](https://neon.com) → New
Project → copy the connection string it gives you → set it as
`DATABASE_URL`. Free tier is plenty for this.

### 3. Google OAuth client (login + Gmail sending)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create a new project (or use an existing one).
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **Internal** if everyone on the team is in the same Google
     Workspace org (simplest — no verification needed). Otherwise **External**
     and leave it in **Testing** mode.
   - Add the `.../auth/gmail.send` scope under "Data Access."
   - Under **Test users** (External + Testing mode only), add every
     teammate's email — Google caps unverified apps at 100 test users, which
     is plenty for internal team use. Skip this if you chose Internal.
   - Note: `gmail.send` is a Google "restricted scope." Going fully public
     (for selling to other companies later) requires Google's app
     verification process, which can take days to weeks and may ask for a
     demo video. Not needed for your team to use it today.
4. **APIs & Services → Credentials** → **Create Credentials → OAuth client
   ID** → Application type: **Web application**.
   - Authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
     (and `http://localhost:3000/api/auth/callback/google` for local dev).
5. Copy the Client ID and Client Secret into `AUTH_GOOGLE_ID` and
   `AUTH_GOOGLE_SECRET`.

### 4. Auth secret

Generate one: `npx auth secret` (or `openssl rand -base64 33`). Set it as
`AUTH_SECRET`.

## Deploying (Vercel)

1. Push this repo to GitHub, then go to
   [vercel.com/new](https://vercel.com/new) and import it.
2. Add every variable from `.env.example` in the Vercel project's
   Environment Variables settings.
3. Deploy. Vercel sets the deployment URL automatically, so you don't need
   `AUTH_URL` there — you do need it (pointed at your real domain) on any
   other host.
4. Go back to the Google Cloud Console and add
   `https://<your-vercel-domain>/api/auth/callback/google` as an authorized
   redirect URI (step 3.4 above) — this can't be done until you know the URL.
5. Run `npx prisma migrate deploy` against the production `DATABASE_URL`
   (from your machine, or as a Vercel deploy step) to create the tables.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Powers insight extraction and email drafting. |
| `DATABASE_URL` | Yes | Postgres connection string. |
| `AUTH_SECRET` | Yes | Signs session cookies. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Yes | From the Google OAuth client above. |
| `AUTH_URL` | Production only, non-Vercel | Your deployed URL. Vercel infers this automatically. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-5`. |
| `GOOGLE_PAGESPEED_API_KEY` | No | Raises the free PageSpeed Insights quota. Works without a key at low volume. |
| `META_AD_LIBRARY_ACCESS_TOKEN` | No | Enables the ad-activity check via Meta's official Ad Library API. Requires a Meta developer app with the `ads_read` permission. Without it, ad checks are skipped gracefully. |
| `SENDER_CONTEXT` | No | One line describing what you offer, used in generated drafts. |

## Architecture notes

- **Multi-tenant by email domain.** Every user who signs in shares an
  `Organization` keyed to their email domain, so onboarding a second company
  later is just "someone signs in with a new domain" — no code change.
  Every query is scoped by `organizationId`; there is no cross-org data path.
- **Sending is per-user, not centralized.** There is no shared sending
  domain, no SPF/DKIM/DMARC to manage, no inbox warm-up — each rep's OAuth
  grant is the sending mechanism. This is also the tool's core deliverability
  pitch: real inbox, real reputation.
- **Analysis runs in the background.** Adding a prospect returns immediately
  (`PENDING`); the scrape → SEO → ads → LLM pipeline runs via Next.js
  `after()` and the UI polls until it's `READY`. This keeps prospect creation
  fast and avoids serverless function timeouts.

## Known limitations / what's next if you're selling this

- **Google OAuth verification.** Selling to companies outside your own
  Google Workspace requires completing Google's verification for the
  `gmail.send` scope (see step 3 above). Budget time for this before a real
  launch to outside customers.
- **No billing.** The `Organization` model exists, but there's no plan/seat
  limiting or Stripe integration yet — every org has unlimited access.
- **Google Ads Transparency Center has no public API.** Scraping its UI
  violates Google's terms, so it isn't attempted here. Only Meta ad activity
  is checked out of the box. A paid ad-intelligence API (SEMrush, SpyFu) could
  be added behind the same `src/lib/ads.ts` interface if that matters for your
  niche.
- **No bulk import.** Prospects are added one at a time. CSV import would be
  a small, contained addition to `src/app/page.tsx` + a new API route.
- **No org invite flow.** Anyone who signs in with a matching email domain
  is auto-added to that org — there's no invite-by-email or role management.
  Fine for a single team; would need work before selling to companies that
  want to control who joins.

## Compliance

Sending commercial email is regulated (CAN-SPAM in the US, CASL in Canada,
GDPR in the EU). Sending from a real Gmail account addresses the deliverability
problem, not the compliance one — you (or your reps) still need accurate
sender identity, no deceptive subject lines, and to honor opt-out requests.

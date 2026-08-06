# Outreach Copilot

A personal tool that researches a prospect (website content, SEO signals, ad
activity, tech stack) and drafts a cold email grounded in what it actually
finds — not merge-tags, real observations.

## How it works

1. You add a company name + website.
2. It scrapes the site (title, meta description, headings, body copy, and
   detects ad/analytics pixels — Google Ads, Meta Pixel, GTM, TikTok, etc.)
   with Playwright.
3. It pulls SEO/performance signals from Google's PageSpeed Insights API.
4. It checks whether the company is currently running ads via the Meta Ad
   Library API (optional — requires a token; see below).
5. Claude extracts 3–6 specific, evidence-backed insights from all of that —
   it's instructed to skip anything it can't point to concrete data for.
6. Claude drafts a short (4–6 sentence) email that references 2–3 of those
   insights. No generic flattery, no buzzwords.
7. You review, edit, and approve the draft in the dashboard before sending it
   yourself.

This is intentionally review-before-send: there is no automated sending
pipeline here. Approving a draft just marks it as reviewed.

## Setup

```bash
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY at minimum
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Powers insight extraction and email drafting. |
| `DATABASE_URL` | Yes | Defaults to a local SQLite file — fine for personal use. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-5`. |
| `GOOGLE_PAGESPEED_API_KEY` | No | Raises the free PageSpeed Insights quota. Works without a key at low volume. |
| `META_AD_LIBRARY_ACCESS_TOKEN` | No | Enables the ad-activity check via Meta's official Ad Library API. Requires a Meta developer app with the `ads_read` permission. Without it, ad checks are skipped gracefully. |
| `SENDER_NAME`, `SENDER_CONTEXT` | No | Used in generated email drafts. |

## Known limitations

- **Google Ads Transparency Center has no public API.** Scraping its UI
  violates Google's terms, so it isn't attempted here. Only Meta ad activity
  is checked out of the box. A paid ad-intelligence API (SEMrush, SpyFu) could
  be added behind the same `src/lib/ads.ts` interface if that matters for your
  niche.
- **No email sending.** This tool stops at "draft ready to review." Wiring up
  actual sending means dealing with domain reputation, SPF/DKIM/DMARC, and
  inbox warm-up — infrastructure, not a code change, and worth doing
  deliberately rather than bolting on.
- **Single-user, local-first.** There's no auth or multi-tenancy. It's built
  to be run by one person against their own prospect list.

## Compliance

Sending unsolicited commercial email is regulated (CAN-SPAM in the US, CASL in
Canada, GDPR in the EU). Whatever you send from drafts generated here still
needs a working unsubscribe mechanism, accurate sender info, and no deceptive
subject lines — this tool doesn't handle that for you.

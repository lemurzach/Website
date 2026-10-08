# Local Reputation

Google reviews with AI-drafted replies, auto-generated social posts for Facebook, Instagram and Google Business Profile, and a listings scan, for local businesses. Set up in under 10 minutes, one flat monthly price.

**Status:** scaffold only. Product, stack and build phases are in [PLAN.md](./PLAN.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + Auth) · Stripe · Claude API · Vercel

## Run locally

Requirements: **Node.js 20.9+** (22 LTS recommended) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file, then fill in the values
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000.

The placeholder home page runs with an empty `.env.local`. Each key in `.env.example` says which phase first needs it; at minimum you'll want the Supabase keys for Phase 1:

1. Create a free project at https://supabase.com.
2. Project Settings → API: copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`, the publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the secret key into `SUPABASE_SECRET_KEY`.

For Stripe webhooks locally, install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

and paste the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`. (The webhook route arrives in Phase 9.)

## Scripts

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start the dev server                                |
| `npm run build`        | Production build                                    |
| `npm run start`        | Serve the production build                          |
| `npm run lint`         | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run lint:fix`     | ESLint with auto-fix                                |
| `npm run format`       | Format everything with Prettier                     |
| `npm run format:check` | Check formatting (use in CI)                        |
| `npm run typecheck`    | TypeScript type check, no output                    |

Before pushing: `npm run lint && npm run typecheck && npm run format:check`.

## Adding shadcn/ui components

```bash
npx shadcn@latest add button
```

Components land in `src/components/ui`. Config is in `components.json`.

## Project layout

```
src/
  app/                 routes, layouts, global CSS (Tailwind + shadcn theme tokens)
  components/ui/       shadcn/ui components
  lib/utils.ts         cn() class-name helper
  lib/supabase/        client.ts (browser), server.ts (server, as the user), admin.ts (service role, bypasses RLS)
  lib/anthropic.ts     Claude client and model setting
  lib/stripe.ts        Stripe client
```

## Deploying

Import the repo in Vercel, set **Root Directory** to `local-reputation-app`, add the environment variables from `.env.example`, and deploy. Set `NEXT_PUBLIC_APP_URL` to the production URL.

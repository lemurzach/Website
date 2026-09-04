# Aegis Bay Hero Registry

A public hero leaderboard and villain bounty board for a custom My Hero
Academia campaign set in Aegis Bay, plus a password-protected admin panel
for managing heroes, rankings, and villains.

- **Public site** (`/`, `/villains`): anyone can browse the hero leaderboard
  and the bounty board, and click into a hero or villain for their full
  bio/quirk.
- **Admin panel** (`/admin`): a single admin (you) logs in with a password
  to add/edit/delete heroes and villains, and set hero rank.

## Stack

- Next.js 16 (App Router, Server Actions)
- PostgreSQL + Prisma
- Session auth via a signed cookie (jose) + bcrypt-hashed admin password
- Tailwind CSS

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Postgres database (see [Deployment](#deployment) for free
   hosted options, or run one locally) and copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` — your Postgres connection string.
   - `SESSION_SECRET` — a random secret: `openssl rand -base64 32`.
   - `ADMIN_PASSWORD_HASH` — generate with:

     ```bash
     node scripts/hash-password.mjs "your-password-here"
     ```

     Copy the `ADMIN_PASSWORD_HASH="..."` line the script prints straight
     into `.env`. **Do not hand-edit a bcrypt hash into `.env` yourself** —
     bcrypt hashes contain `$` characters, and Next.js treats `$name` in
     `.env` files as a variable reference, silently corrupting the hash if
     the `$` isn't escaped as `\$`. The script already escapes it for you.

3. Apply the database schema:

   ```bash
   npx prisma migrate deploy
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` for the public site and
   `http://localhost:3000/admin` to log in and start adding heroes and
   villains.

## Deployment

This app deploys well to [Vercel](https://vercel.com) (or any Node host).
You'll need a hosted Postgres database — free tiers on
[Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel
Postgres all work.

1. Push this project to its own GitHub repo (or a subfolder deploy) and
   import it into Vercel.
2. Set the same three environment variables from `.env` in your host's
   dashboard (`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`) —
   again, paste the hash exactly as printed by `hash-password.mjs`, with
   the escaped `\$` characters intact.
3. Run `npx prisma migrate deploy` against the production database (once,
   from your machine or a build step) to create the tables.

## Editing content

Only the admin panel can create or change heroes and villains — there is
no public sign-up or edit access. Log in at `/admin`, then use the
**Heroes** and **Bounties & Villains** tabs to manage entries. Changes show
up on the public site immediately.

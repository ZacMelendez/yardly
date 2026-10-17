# Yardli

Business management software for lawn care and landscaping companies. Yardli handles the whole workflow, from lead to paid invoice: manage customers, send estimates that clients approve online, schedule recurring jobs on a map, and bill for the work. Teams share one organization account, with a subscription plan behind it.

**Live demo:** [yardly-five.vercel.app](https://yardly-five.vercel.app/)

## Screenshots

<!-- Add images to docs/screenshots/ and uncomment:
![Dashboard](docs/screenshots/dashboard.png)
![Estimate](docs/screenshots/estimate.png)
![Jobs map](docs/screenshots/jobs-map.png)
-->

## Features

- **Customers.** A full CRM with Google Places address autocomplete and bulk CSV import.
- **Estimates.** Build line-item estimates from a services catalog, generate a PDF (`pdf-lib`), and email it with Resend and React Email. Customers accept the estimate through a public link.
- **Jobs.** Schedule one-off or recurring jobs, and see them plotted on a Google Map on the dashboard.
- **Invoices.** Turn completed work into invoices, with totals calculated on the server, plus PDF and email delivery.
- **Organizations and teams.** Multi-user organizations with email invitations, built on the Better Auth organization plugin.
- **Subscriptions.** Stripe Checkout with monthly and yearly Basic, Pro, and Enterprise tiers, kept in sync by webhooks.
- **Hardening.** Upstash Redis rate limiting in middleware, and an admin area restricted by user ID.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js (App Router, Turbopack), React 19, TypeScript |
| Database | PostgreSQL, Prisma |
| Auth | Better Auth (Google OAuth, organizations, Prisma adapter) |
| UI | Mantine, mantine-react-table, CSS Modules |
| Data and state | TanStack Query, Jotai (`jotai-tanstack-query`, SSR hydration), React Hook Form, Zod |
| Integrations | Stripe, Resend and React Email, Google Maps and Places, Upstash Redis, pdf-lib |

## Getting started

**Prerequisites:** Node.js 20+, pnpm 9+, and PostgreSQL 14+ (or Docker).

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`. At minimum you need `DATABASE_URL`, `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), and the Google OAuth credentials. Set the Google redirect URI to `http://localhost:3000/api/auth/callback/google`. The Maps, Resend, Stripe, and Upstash keys enable their related features. Set `RATELIMIT_DISABLED=true` to skip rate limiting locally.

```bash
# Optional: run Postgres in Docker
docker run --name yardli-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=yardli -p 5432:5432 -d postgres:16

pnpm db:generate
pnpm db:push
pnpm db:seed    # demo services, customers, estimates, invoices, and jobs
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For the Maps features, enable the Maps JavaScript, Geocoding, and Places APIs in Google Cloud. See [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) for subscriptions and [docs/RATE_LIMIT.md](docs/RATE_LIMIT.md) for rate limiting.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js dev server, production build, and production server |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` | Create and apply a Prisma migration |
| `pnpm db:push` | Sync the schema without a migration (local iteration) |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Prisma Studio |

## Project structure

```
src/app/            Pages and API routes (customers, estimates, invoices, jobs, services, settings, admin)
src/app/estimates/accept/[id]/   Public estimate-approval page
src/components/     UI components and providers
src/lib/            Auth, Prisma client, rate limiting, Places API, Stripe, email, PDFs
prisma/             Schema, migrations, and seed
docs/               Stripe and rate-limit setup guides
```

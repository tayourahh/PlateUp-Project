# PlateUp! 🍽️

**Smart Solutions for Quality Surplus Food** — a platform connecting local culinary
businesses (UMKM) with students to redistribute quality surplus food before it goes
to waste, built for a sustainability-focused hackathon.

🔗 **Live demo:** [plate-up-project.vercel.app](https://plate-up-project.vercel.app)

---

## The Problem

Indonesia loses up to **48 million tons of food annually**, costing the economy an
estimated IDR 551 trillion per year (~5% of GDP) — while rotting food in landfills
contributes significantly to methane emissions. Meanwhile, local culinary businesses
(UMKM) routinely discard high-quality unsold meals at closing time, and students
often struggle to find affordable, quality food.

## The Solution

PlateUp! is a two-sided marketplace where:
- **Partners (UMKM)** list surplus food nearing closing time, with AI-assisted
  description and expiry estimation to speed up listing
- **Customers (students)** browse and claim affordable surplus meals near them
- Both sides can track the **environmental impact** of food saved (waste diverted,
  estimated emissions avoided)

## Key Features

- 🔐 Role-based auth (Partner / Customer) via Supabase
- 🤖 AI-assisted listing: auto-generate food descriptions and expiry estimates
  using Google Gemini (`@google/genai`)
- 📊 Partner dashboard for managing surplus inventory and orders
- 🛒 Customer dashboard for browsing and ordering surplus food
- 🌱 Impact tracking (food waste diverted, environmental metrics)

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Database & Auth | Supabase (Postgres, Auth, Storage) |
| AI | Google Gemini API (`@google/genai`), directly from Next.js API routes |
| Deployment | Vercel (frontend + API routes), Supabase (DB) |
| Retired | Python (Flask) backend — originally hosted on Railway; retired after
finding it wasn't serving any live traffic, see "Post-Competition Iteration"
below. Kept in `backend/` for reference. |

## Architecture

```
frontend/   → Next.js app (UI, auth flows via Supabase, AI API routes, dashboards)
backend/    → [RETIRED] Flask API, no longer deployed or called in production
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

You'll need your own Supabase project and Google Gemini API key — set the following
environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

> The Flask backend in `backend/` is retired and not required to run the app —
> see "Post-Competition Iteration" below for why.

## Competition Context & Lessons Learned

This project was built for a sustainability-tech competition. It didn't place, and
the judges' feedback was genuinely useful:

- **Weak value proposition for UMKM.** The pitch centered on "helping UMKM sell
  surplus food," but most UMKM already sell at low prices, so the incentive to
  adopt a new platform was thin. In hindsight, the stronger angle — which the
  landing page's own "Back Story" section already hinted at — is leading with
  **environmental impact and education**, with UMKM as contributors to that
  mission rather than the primary beneficiaries.
- **AI feature accuracy.** The food-condition/pricing AI assist used a general-purpose
  LLM without fine-tuning or a proper evaluation set, so its outputs weren't reliable
  enough to fully trust. A production version would need labeled training data and
  a narrower, evaluated task (e.g. structured classification instead of open-ended
  generation).

### What I'd do differently next

- Lead the product narrative with measurable environmental impact, not vendor
  acquisition
- Scope the AI feature down to something testable and evaluable, rather than a
  general LLM call
- Validate the UMKM value proposition with real interviews before building

## Post-Competition Iteration

After the competition, I kept iterating on this project as a portfolio piece and
ran into a few real-world lessons worth documenting:

- **Debugging a "silently degraded" AI feature.** The AI-generated descriptions
  and expiry/price estimates looked plausible but were noticeably weaker than
  expected. Tracing it back, I found the Next.js API route was calling a weaker
  fallback model (`gpt-3.5-turbo`) instead of the Gemini-based path with proper
  food-safety guardrails — the "better" path only ran when a separate Flask
  backend was reachable, and that backend had quietly gone offline. The AI
  never *errored*, it just silently downgraded, which is a harder class of bug
  to catch than an outright failure.
- **Discovering unused infrastructure.** Investigating that bug led to a bigger
  finding: the Flask backend (originally deployed on Railway) wasn't actually
  serving any live traffic. Every real feature — auth, product CRUD, profile
  updates — was already calling Supabase directly from the frontend. The
  backend was dead weight that still required separate hosting, environment
  variables, and uptime management for zero functional benefit.
- **Consolidating the architecture.** I retired the Flask backend and moved
  the AI features (photo condition scan, expiry/price estimation, description
  generation) into Next.js API routes on Vercel, calling the Gemini API
  directly. This collapsed the stack from three platforms (Vercel + Railway +
  Supabase) into two (Vercel + Supabase), removed an entire class of "is my
  backend still running" failure modes, and made the AI safety guardrails
  (shelf-life clamping, price bounds, fallback templates) consistent across
  every AI feature instead of duplicated and drifting apart.
- **Fixing a silent data bug.** While touring the codebase, I also found that
  uploaded product photos were previewed in the UI but never actually
  persisted to storage — the insert into `surplus_products` never included the
  image. Fixed by uploading to Supabase Storage before the database write.

## Post-Competition Iteration (continued): Keeping infra alive on free tiers

Running this on entirely free infrastructure surfaced a few operational
lessons too:

- Supabase's free tier pauses projects after ~7 days of inactivity. Fixed with
  a scheduled GitHub Actions workflow (`.github/workflows/keep-alive.yml`)
  that pings the project every 3 days.
- Hosted APIs deprecate models over time — `gemini-2.0-flash-lite` was retired
  mid-project in favor of `gemini-3.5-flash-lite`, which briefly broke every
  AI feature at once. A good reminder to not hardcode model names without a
  fallback/monitoring plan in a real production system.

## My Role

Built as the developer on a team project — responsible for frontend (Next.js),
backend (Flask API, later retired), database schema (Supabase), and deployment
(Vercel; previously Railway for the backend).

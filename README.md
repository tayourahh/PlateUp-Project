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
| Backend | Python (Flask), JWT auth |
| Database & Auth | Supabase (Postgres) |
| AI | Google Gemini API (`@google/genai`) |
| Deployment | Vercel (frontend), Railway (backend), Supabase (DB) |

## Architecture

```
frontend/   → Next.js app (UI, auth flows, AI API routes, dashboards)
backend/    → Flask API (auth routes, surplus food management)
```

## Running Locally

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
python run.py
```

You'll need your own Supabase project and Google Gemini API key — set the following
environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GENAI_API_KEY`
- Backend equivalents for Supabase connection & JWT secret

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

## My Role

Built as the developer on a team project — responsible for frontend (Next.js),
backend (Flask API), database schema (Supabase), and deployment (Vercel + Railway).

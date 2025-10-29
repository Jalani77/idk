# YiriAI – AI Integration Marketplace & Virtual Consultant

YiriAI helps small businesses discover, evaluate, and adopt cost‑effective AI tools. It includes:

- Avatar‑led conversational onboarding collecting business profile
- AI tool recommendation engine with ROI/time‑saved forecasts
- Interactive marketplace with vendor connection workflow
- Dashboard with charts, tables, and step‑by‑step integration instructions
- Privacy‑first data handling on a low‑cost, SQLite‑backed stack

## Tech Stack
- Frontend: Next.js (React, TypeScript)
- Backend: Node.js + Express
- Database: SQLite (better‑sqlite3)
- Charts: Chart.js via react‑chartjs‑2

## Quick Start (Local)

Prereqs: Node 20+

```bash
# From repo root
npm run install:all

# Start frontend (3000) and backend (4000) concurrently
npm run dev
```

Open `http://localhost:3000`. The frontend proxies `/api/*` to the backend via Next.js rewrites.

## Docker

```bash
# Build and run frontend (3000) and backend (4000)
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api/*`

## Environment

- Frontend: `frontend/.env.local`
  - `BACKEND_URL` (default `http://localhost:4000`)
- Backend: `backend/.env`
  - `PORT` (default `4000`)
  - `COOKIE_SECRET` (change in production)
  - `CORS_ORIGIN` (default `http://localhost:3000`)
  - `DB_PATH` (default `./data/yiriai.db`)

Copy samples:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

## Features

- Conversational onboarding stores a profile with: industry, size, revenue, team structure, current tools, workflows, goals
- Recommendations are ranked for SMBs with estimates of ROI, time saved, and efficiency improvement
- Marketplace browse, search, filter, and tool detail pages
- Vendor leads are stored without exposing private details; messages are masked for PII
- Dashboard shows totals and integration steps per tool

## API Overview (selected)
- `GET /api/health` – server health
- `GET /api/profile` – get profile
- `POST /api/profile` – upsert profile
- `POST /api/conversation/message` – chat with onboarding assistant
- `GET /api/tools` – list tools (q, category, cost_tier)
- `GET /api/tools/:id` – tool details
- `GET /api/recommendations` – current recommendations
- `POST /api/recommendations/refresh` – regenerate recommendations
- `GET /api/recommendations/dashboard` – dashboard data (profile, totals, recs + steps)

## Security & Privacy
- Anonymous, signed cookie issues an `org_id` per browser
- PII masking for email and phone numbers in user messages
- Helmet, CORS, and rate limiting enabled by default

## Notes
- SQLite DB is created at first run and pre‑seeded with demo vendors and tools
- Example org `org_demo` is created for first‑run trials
- The code is modular and commented to enable future enhancement (e.g., auth, vendors portal, billing)

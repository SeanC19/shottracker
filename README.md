ShotMap

Live shot tracking and shareable post-game analytics for hockey, built for anyone at the rink: coaches, parents and scorekeepers.

Live: getshotmap.com

Features
Tap-to-log shots: tap the rink to record shot location, player, shot type and result (Goal / On Target / Missed / Blocked), with one-tap undo
No signup to start: users begin with an anonymous session and can upgrade to an account later without losing data
Teams and rosters: auto-generated join codes (e.g. HAWKS42) and per-game codes so others can join a live session
Shareable reports: a public post-game shot map and per-player breakdown, shared by link or QR code, no login required
Mobile-first: built for a phone held in one hand at the glass
Tech stack

Frontend	React 19, React Router 7, Vite 8
Backend	Supabase (Postgres, Auth, Row Level Security)
Hosting	Vercel (production), Docker + nginx (self-hosted)
CI	Jenkins (lint → audit → build → Docker build → smoke test)
Architecture
Browser (React SPA)  ──supabase-js──▶  Supabase (Postgres + Auth + RLS)
        ▲
        │ static assets
Vercel CDN  /  nginx container

There is no custom API server. The client talks directly to Supabase, and access control is enforced in the database by Row Level Security policies tied to auth.uid(). The Supabase anon key is a public client identifier; RLS is what protects the data.

Shot positions are stored as percentages of the rink (x_pct, y_pct in 0–1), so a shot logged on a phone renders in the same place on any screen size.

Getting started
bash
cp .env.example .env      # add your Supabase URL and anon key
npm install
npm run dev               # http://localhost:5173
Docker
bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t shotmap .
docker run -p 8080:80 shotmap   # http://localhost:8080

The multi-stage build compiles the app in node:22-alpine and ships only the static output on nginx:alpine. nginx.conf falls back to index.html so client-side routes work on refresh.

CI/CD
Jenkins (Jenkinsfile): install → lint → npm audit (production deps, high+) → build → Docker image build → container smoke test, including a deep-link route
Vercel: deploys main automatically; vercel.json rewrites all routes to index.html
Roadmap
Lacrosse and soccer field support (in progress)
Real-time sync between multiple trackers via Supabase Realtime
Database migrations in version control
Freemium plan: one free team, paid tier for more

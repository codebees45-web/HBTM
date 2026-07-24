# ORBIT AI — Personal Learning Agent

A React (Vite) implementation of the ORBIT AI product for the HBTM problem
statement: an AI-powered Personal Learning Agent with a goal-intake flow,
adaptive roadmap, locked-down assessments, an AI mentor, smart nudges, and
analytics.

## Getting started

The frontend can run alone (mentor + goal-parsing fall back to local
canned/keyword logic), or with the real backend for actual LLM-powered
answers.

**Frontend only:**
```bash
npm install
npm run dev
```

**Frontend + real AI backend:**
```bash
npm install
cd server && npm install && cp .env.example .env
# edit server/.env and put a real ANTHROPIC_API_KEY in it
cd ..
npm run dev:all
```

`dev:all` runs the Vite dev server and the Express API together (Vite
proxies `/api/*` to `http://localhost:8787`, see `vite.config.js`).

Open the local URL Vite prints (usually http://localhost:5173). The first
run will send you through `/onboarding` since there's no goal saved yet.

## Build for production

```bash
npm run build
npm run preview
```

## Pages / routes

| Route | What it does |
|---|---|
| `/` | Marketing landing page |
| `/onboarding` | Goal intake + intent parsing (real LLM call to `/api/parse-goal` if the backend is running, keyword-match fallback otherwise) → builds your roadmap |
| `/dashboard` | Overview: completion %, streak, upcoming tasks, time chart |
| `/dashboard/roadmap` | Milestone list with real course links (Coursera, Udemy, Cisco NetAcad), search/filter, + a self-contained study-session panel that detects fast scrolling vs. actual reading |
| `/dashboard/assessment` | Fullscreen-locked quiz with live webcam phone detection (TensorFlow.js + COCO-SSD) and a QR pairing stub for a second-camera angle |
| `/dashboard/mentor` | Chat UI, calls `/api/mentor` on the Express backend for real LLM answers grounded in your goal/roadmap; falls back to an offline message if the backend isn't running |
| `/dashboard/notifications` | Smart nudges list, with a button to simulate the inactivity trigger |
| `/dashboard/analytics` | Assessment score trend + time-spent charts |
| `/dashboard/achievements` | Badges derived from your streak, completion %, and quiz scores |
| `/dashboard/community` | Leaderboard ranking you against sample peers |
| `/dashboard/profile` | Name/email, daily goal, reminders, and a reset-progress control |

## What's real vs. what's stubbed (be upfront about this in your demo)

**Real and working out of the box:**
- Fullscreen lock via the browser Fullscreen API, with detection if the user exits early.
- Live webcam object detection using TensorFlow.js + the COCO-SSD model (`cell phone` class), running entirely client-side.
- The scroll-vs-reading detector on the study session panel (real scroll-event math, not a mock).
- QR code generation for phone pairing.
- All state (roadmap, notifications, streaks, scores, profile, theme) persists to `localStorage` so a refresh doesn't lose progress.
- **AI Mentor and goal parsing are fully wired to a real Express backend** (`/server`) that calls the Anthropic API — see `server/index.js`. Both `/dashboard/mentor` and `/onboarding` already call it over HTTP (proxied via Vite in dev). You only need to supply your own `ANTHROPIC_API_KEY` in `server/.env` — nothing in the frontend needs to change. Without a key (or without the server running), both features degrade gracefully to local fallbacks instead of breaking.

**Deliberately stubbed / needs more work to be "real":**
- **Cross-site scroll tracking on Coursera/Cisco/etc.** A webpage cannot observe scroll or focus events on a different site in another tab — that's a browser security boundary, not a bug. The in-app study-session panel demonstrates the same detection logic locally. A true version of this needs a **browser extension**, not a website.
- **Second-camera QR pairing.** The QR code encodes a pairing URL and demonstrates the flow, but actually streaming video from the paired phone into the assessment session needs a small **WebRTC signaling server** — not something a static frontend can do alone.
- **Community leaderboard** uses a fixed set of sample peers (`MOCK_PEERS` in `src/data/mockData.js`) rather than real multi-user accounts.

## Project structure

```
src/
  App.jsx                 — router setup
  App.css                 — design tokens + all page styles
  context/AppContext.jsx  — global state: goal, roadmap, notifications, analytics (persisted to localStorage)
  data/mockData.js         — course catalogue, quiz bank, notification builders
  layouts/DashboardLayout.jsx — sidebar shell for all /dashboard/* pages
  pages/
    Landing.jsx
    Onboarding.jsx
    Dashboard.jsx
    Roadmap.jsx
    Assessment.jsx
    Mentor.jsx
    Notifications.jsx
    Analytics.jsx
  components/              — landing-page sections (Header, Hero, Contrast, Features, Loop, FinalCTA, Footer)
```

## Notes

- The webcam + fullscreen features require the browser to prompt for
  camera permission and must be served over `localhost` or HTTPS (both
  fine for `npm run dev` / most hosting).
- `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd` are loaded via
  dynamic `import()` only on the Assessment page, so they don't bloat
  every other route's bundle.
  
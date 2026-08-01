# AETHER → AETHER Integration

This wires the 5-agent AETHER architecture from `AETHER_1.docx` into the
existing AETHER codebase, using the stack decisions made for this project:

| Doc's choice | What's actually used here |
|---|---|
| Agent orchestration: LangGraph | `@langchain/langgraph` (JS), `server/agents/orchestrator.js` |
| LLM: Gemini + OpenAI fallback | **Groq** (`llama-3.3-70b-versatile`) — matches what AETHER's server already uses for mentor/goal-parsing/quiz gen |
| Structured storage: MongoDB | Reuses the existing Mongo connection; 3 new collections |
| Semantic storage: ChromaDB | Real ChromaDB, run as a small Python sidecar (`/chroma-sidecar`) since Chroma's first-class client is Python and the backend here is Node |
| Frontend: React + Vite + Tailwind | Existing AETHER React/Vite app (it uses plain CSS, not Tailwind — new page follows that convention) |

## What was added

```
AETHER/
  server/
    agents/
      groqClient.js        — shared Groq call + JSON-parsing helper
      identityAgent.js      — 7.1 Identity Agent
      habitAgent.js          — 7.2 Habit Intelligence Agent (real log math + LLM narrative)
      gapAnalysisAgent.js    — 7.3 Gap Analysis Agent (+ Chroma vector search per gap)
      curatorAgent.js        — 7.4 Curator Agent
      growthCoachAgent.js    — 7.5 Growth Coach Agent
      orchestrator.js        — LangGraph StateGraph chaining all 5, in order
    chroma/
      chromaClient.js       — HTTP client to the Python sidecar
    models/
      IdentityProfile.js    — Mongo: current profile + history + feedback log
      HabitProfile.js        — Mongo: current profile + history
      GrowthPlan.js           — Mongo: one doc per cycle (gaps + curated + plan)
    routes/
      AETHER.js             — POST /cycle, GET /profile, POST /feedback
    seed/
      seedResources.js       — seeds Chroma from the EXISTING COURSE_CATALOGUE
                                 in src/data/mockData.js, so curated resources
                                 point at the same real course links already
                                 used on the Roadmap page
    index.js                 — (modified) mounts /api/AETHER
    package.json              — (modified) added @langchain/langgraph, @langchain/core
    .env.example               — (modified) added CHROMA_SIDECAR_URL

  chroma-sidecar/             — new, top-level, separate from AETHER/
    app.py                     — FastAPI + ChromaDB
    requirements.txt
    README.md

  src/
    lib/AETHERApi.js          — client for the 3 new endpoints
    pages/GrowthPlan.jsx       — new dashboard page rendering the pipeline output
    App.jsx                     — (modified) added /dashboard/growth-plan route
    layouts/DashboardLayout.jsx — (modified) added sidebar link
```

## How the pipeline runs

`POST /api/AETHER/cycle` (auth required) does this, per the doc's §6/§9:

1. Loads the signed-in user's current `goal`, `roadmap`, `activityLog`,
   `timeSpentLog` from their already-synced state (`/api/state`), plus
   whatever Identity Profile + feedback history exists from previous cycles.
2. Runs the LangGraph pipeline: **Identity → Habit → Gap Analysis → Curator →
   Growth Coach**, each node a real Groq call (Habit also does real
   arithmetic on the logs before calling the model).
3. Gap Analysis queries the Chroma sidecar for each named gap; Curator ranks
   the candidates (or proposes a specific resource itself if the sidecar
   isn't running or the pool is empty — this degrades gracefully, nothing
   breaks without Chroma).
4. Persists the Identity Profile, Habit Profile, and this cycle's Growth Plan
   to Mongo, and returns everything in one response.

**The feedback loop (§6/§10):** `POST /api/AETHER/feedback` appends a
reflection/progress note to the stored Identity Profile. The *next* call to
`/cycle` reads that history in the Identity Agent — so the loop closes across
cycles rather than needing to hold a single request open indefinitely.

## Running it

```bash
# 1. Backend deps (langgraph/core already added to package.json)
cd AETHER/server
npm install
cp .env.example .env   # fill in GROQ_API_KEY, MONGODB_URI, JWT_SECRET as usual

# 2. Chroma sidecar (optional but recommended — see chroma-sidecar/README.md)
cd ../../chroma-sidecar
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --port 8000

# 3. Seed the resource library (once the sidecar is up)
cd ../AETHER/server
node seed/seedResources.js

# 4. Run everything
cd ..
npm run dev:all
```

Then sign in (AETHER is tied to an account, same as the leaderboard — guest
mode gets a prompt to register instead), set a goal via onboarding, and open
**Dashboard → Growth Plan**. Click "Run my first cycle."

## What's genuinely real vs. what degrades gracefully

- **Real:** all 5 agents are separate Groq calls with distinct system
  prompts and distinct inputs/outputs (not one prompt pretending to be five
  agents). Habit stats (consistency, session length, quiz average) are
  computed with actual arithmetic on your logs, not guessed by the model.
  LangGraph is a real compiled `StateGraph`, verified to load and run.
- **Degrades gracefully:** if the Chroma sidecar isn't running, Gap Analysis
  detects that via `/health` and the Curator Agent proposes specific
  resources itself instead of ranking a candidate pool — the pipeline still
  completes, you just lose "matched against our own resource library" until
  the sidecar is up.
- **Not yet done:** a live end-to-end run against a real Groq key (only
  syntax/import-verified here, since no key was available in this
  environment); UI polish on `GrowthPlan.jsx` beyond the existing app's
  plain-CSS conventions; no automated tests.
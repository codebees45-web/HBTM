// Client for the AETHER multi-agent pipeline endpoints (server/routes/AETHER.js).
// Same token/endpoint-override conventions as the rest of the app (see
// AppContext.jsx / Community.jsx): Bearer token from localStorage, endpoint
// path overridable via VITE_*_URL for non-default deployments.

const TOKEN_KEY = 'orbit-ai-token'
// Stable per-device ID for anyone using AETHER without an account. Generated
// once and reused, so a guest's Identity/Habit Profile persists across
// cycles on this device even though nothing is tied to a login.
const GUEST_ID_KEY = 'orbit-ai-guest-id'
const CYCLE_ENDPOINT = import.meta.env.VITE_AETHER_CYCLE_URL || '/api/AETHER/cycle'
const PROFILE_ENDPOINT = import.meta.env.VITE_AETHER_PROFILE_URL || '/api/AETHER/profile'
const FEEDBACK_ENDPOINT = import.meta.env.VITE_AETHER_FEEDBACK_URL || '/api/AETHER/feedback'

function getGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else {
    headers['X-Guest-Id'] = getGuestId()
  }
  return headers
}

async function parseOrThrow(res) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error || body.detail || `Server returned ${res.status}`)
  }
  return body
}

/**
 * Runs one full pass of the Identity → Habit → Gap Analysis → Curator →
 * Growth Coach pipeline. `stateSnapshot` ({ goal, roadmap, activityLog,
 * timeSpentLog }) is required for guests (no server-side state to read) and
 * is also what authed users' cycles run against, so it always reflects
 * what's on screen right now.
 */
export async function runAETHERCycle(stateSnapshot) {
  const res = await fetch(CYCLE_ENDPOINT, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(stateSnapshot || {}),
  })
  return parseOrThrow(res)
}

/** Fetches the latest stored profiles/plan without running a new cycle. */
export async function getAETHERProfile() {
  const res = await fetch(PROFILE_ENDPOINT, { headers: authHeaders() })
  return parseOrThrow(res)
}

/**
 * Submits a reflection/progress note. This is the feedback-loop step (§6/§10
 * of the doc): it's appended to the Identity Profile's history and read by
 * the Identity Agent the next time runAETHERCycle() is called.
 */
export async function submitAETHERFeedback(note) {
  const res = await fetch(FEEDBACK_ENDPOINT, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note }),
  })
  return parseOrThrow(res)
}
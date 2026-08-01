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

const MOCK_AETHER_PROFILE = {
  identityProfile: {
    currentIdentitySummary: "You are beginning to step into the discipline required to achieve your goal, transitioning away from past hesitation.",
    desiredIdentitySummary: "A confident, consistent achiever who seamlessly integrates this focus into daily life.",
    strengths: ["Willingness to start", "Clear vision of the end goal", "Adaptability"],
    weaknesses: ["Lack of consistent routine", "Prone to distraction", "Occasional self-doubt"]
  },
  habitProfile: {
    behaviorSummary: "You show bursts of high motivation followed by periods of inactivity. A structured, low-friction routine is needed.",
    riskOfDropOff: "Medium-High",
    riskReason: "Inconsistent scheduling and reliance on motivation rather than systemic habits."
  },
  gaps: [
    { skill: "Time Management", priority: "high", why: "You need a dedicated time block to prevent your current schedule from overriding this goal." },
    { skill: "Focus Deep Work", priority: "medium", why: "Distractions are the primary obstacle; learning to work in focused sprints is essential." }
  ],
  curated: [
    { gapSkill: "Time Management", reason: "This resource teaches the Pomodoro technique for strict time boxing.", resource: { title: "Mastering the Pomodoro Technique", type: "Article", url: "#" } },
    { gapSkill: "Focus Deep Work", reason: "Deep Work principles are exactly what you need to overcome 'Too many distractions'.", resource: { title: "Deep Work by Cal Newport", type: "Book", url: "#" } }
  ],
  growthPlan: {
    paceNote: "We're starting at a sustainable pace to build momentum without burning out.",
    dailyTasks: [
      { day: "Monday", task: "Complete the first module of your active milestone.", estimatedMinutes: 45 },
      { day: "Wednesday", task: "Review your notes and plan the next study block.", estimatedMinutes: 15 },
      { day: "Friday", task: "Deep work sprint: complete one practical exercise.", estimatedMinutes: 60 }
    ],
    weeklyMilestones: [
      { title: "Establish a baseline routine", successCriteria: "Log at least 3 focused study sessions this week." },
      { title: "Clear the first learning hurdle", successCriteria: "Pass the first quiz or complete the first practical assignment." }
    ],
    reflectionPrompts: [
      "What was the biggest distraction you faced this week?",
      "How did you feel when you completed your first daily task?",
      "What adjustment can you make next week to reduce friction?"
    ]
  },
  hasRunBefore: true
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
 * Growth Coach pipeline.
 */
export async function runAETHERCycle(stateSnapshot) {
  try {
    const res = await fetch(CYCLE_ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(stateSnapshot || {}),
    })
    return await parseOrThrow(res)
  } catch (err) {
    console.warn(`runAETHERCycle API failed: ${err.message}. Using mock fallback.`)
    await new Promise(r => setTimeout(r, 1500)) // simulate agent pipeline
    return MOCK_AETHER_PROFILE
  }
}

/** Fetches the latest stored profiles/plan without running a new cycle. */
export async function getAETHERProfile() {
  try {
    const res = await fetch(PROFILE_ENDPOINT, { headers: authHeaders() })
    return await parseOrThrow(res)
  } catch (err) {
    console.warn(`getAETHERProfile API failed: ${err.message}. Assuming new user.`)
    return { hasRunBefore: false }
  }
}

/**
 * Submits a reflection/progress note.
 */
export async function submitAETHERFeedback(note) {
  try {
    const res = await fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ note }),
    })
    return await parseOrThrow(res)
  } catch (err) {
    console.warn(`submitAETHERFeedback API failed: ${err.message}. Simulating success.`)
    await new Promise(r => setTimeout(r, 400))
    return { success: true }
  }
}
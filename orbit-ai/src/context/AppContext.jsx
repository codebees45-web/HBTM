import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  keywordToDomain,
  buildRoadmap,
  buildRoadmapFromMilestones,
  INITIAL_NOTIFICATIONS,
  buildInactivityNudge,
  buildRemedialNudge,
  buildDueDateReminder,
  computeDayStreak,
} from '../data/mockData.js'

const STORAGE_KEY = 'orbit-ai-state-v1'
const TOKEN_KEY = 'orbit-ai-token'
const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_URL || '/api/auth'
const STATE_ENDPOINT = import.meta.env.VITE_STATE_URL || '/api/state'
const SAVE_DEBOUNCE_MS = 800

const AppContext = createContext(null)

// Keeps the locked -> active -> completed chain valid after a reorder, add,
// or delete: completed milestones stay completed wherever they land, and the
// first non-completed milestone (in the current order) becomes the active one.
function recomputeStatuses(roadmap) {
  let activeAssigned = false
  return roadmap.map((m) => {
    if (m.status === 'completed') return m
    if (!activeAssigned) {
      activeAssigned = true
      return m.status === 'active' ? m : { ...m, status: 'active' }
    }
    return m.status === 'locked' ? m : { ...m, status: 'locked' }
  })
}

const DEFAULT_STATE = {
  goal: null, // { text, domain, timeline }
  roadmap: [],
  notifications: INITIAL_NOTIFICATIONS,
  streak: 0,
  xp: 0, // total XP earned — see levelFromXp() in mockData.js for leveling
  streakFreezes: 1, // banked freezes the learner can spend to protect a missed day
  freezeLog: [], // ['YYYY-MM-DD', ...] — days covered by a spent freeze, not real activity
  timeSpentLog: [], // [{ day: 'Mon', plannedMin, actualMin }]
  activityLog: [], // ['YYYY-MM-DD', ...] — one entry per day with study activity
  journalEntries: [], // [{ id, date, content }]
  resources: [], // [{ id, title, url, type, notes }]
  profile: {
    name: 'Learner',
    email: '',
    dailyGoalMinutes: 30,
    remindersEnabled: true,
    theme: 'light',
    language: 'en',
  },
}

function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      // Merge so sessions saved before newer fields (e.g. profile) existed don't crash.
      return { ...DEFAULT_STATE, ...saved, profile: { ...DEFAULT_STATE.profile, ...saved.profile } }
    }
  } catch (e) {
    console.warn('Could not read saved state, starting fresh.', e)
  }
  return DEFAULT_STATE
}

function mergeState(saved) {
  return { ...DEFAULT_STATE, ...saved, profile: { ...DEFAULT_STATE.profile, ...saved?.profile } }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadLocalState)
  const remindedRef = useRef(new Set())

  // --- Browser push notifications --------------------------------------
  // Real OS-level notifications for nudges (inactivity, remedial, due-date),
  // on top of the in-app notifications list. Falls back silently on
  // browsers/contexts without the Notification API (e.g. some webviews).
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window
  const [notificationPermission, setNotificationPermission] = useState(
    () => (notificationsSupported ? Notification.permission : 'unsupported')
  )

  async function requestNotificationPermission() {
    if (!notificationsSupported) return 'unsupported'
    const result = await Notification.requestPermission()
    setNotificationPermission(result)
    return result
  }

  // Fires a real browser notification for a nudge, respecting the user's
  // reminders preference and only when the tab isn't already focused
  // (no point popping an OS alert for something already on screen).
  function pushBrowserNotification(notification) {
    if (!notificationsSupported) return
    if (notificationPermission !== 'granted') return
    if (!state.profile.remindersEnabled) return
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') return
    try {
      new Notification(notification.title, {
        body: notification.body,
        tag: notification.id, // dedupes if the same nudge fires twice
      })
    } catch (e) {
      console.warn('Browser notification failed to show.', e)
    }
  }

  // --- Auth -----------------------------------------------------------
  // Guest mode (no token) behaves exactly like the original localStorage-only
  // version — nothing about that path changes. Logging in switches the save
  // target to the backend so progress follows the account across devices.
  const [auth, setAuth] = useState({ status: 'loading', user: null }) // 'loading' | 'guest' | 'authed'
  const hydratingRef = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setAuth({ status: 'guest', user: null })
      return
    }
    hydratingRef.current = true
    fetch(`${AUTH_ENDPOINT}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired')
        return res.json()
      })
      .then(({ user, state: serverState }) => {
        setState(mergeState(serverState))
        setAuth({ status: 'authed', user })
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setAuth({ status: 'guest', user: null })
      })
      .finally(() => {
        hydratingRef.current = false
      })
  }, [])

  async function register(name, email, password) {
    const res = await fetch(`${AUTH_ENDPOINT}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.detail || body.error || 'Registration failed')
    localStorage.setItem(TOKEN_KEY, body.token)
    hydratingRef.current = true
    setState(mergeState(body.state))
    setAuth({ status: 'authed', user: body.user })
    hydratingRef.current = false
  }

  async function login(email, password) {
    const res = await fetch(`${AUTH_ENDPOINT}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.detail || body.error || 'Login failed')
    localStorage.setItem(TOKEN_KEY, body.token)
    hydratingRef.current = true
    setState(mergeState(body.state))
    setAuth({ status: 'authed', user: body.user })
    hydratingRef.current = false
  }
  // Exchanges a Google Identity Services credential (JWT) for a session.
  // The backend verifies it against GOOGLE_CLIENT_ID and finds-or-creates
  // the account, then returns the same { token, user, state } shape as
  // register/login so the rest of the auth flow doesn't need to branch.
  async function loginWithGoogle(idToken) {
    const res = await fetch(`${AUTH_ENDPOINT}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.detail || body.error || 'Google sign-in failed')
    localStorage.setItem(TOKEN_KEY, body.token)
    hydratingRef.current = true
    setState(mergeState(body.state))
    setAuth({ status: 'authed', user: body.user })
    hydratingRef.current = false
    return body
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setAuth({ status: 'guest', user: null })
    setState(loadLocalState())
  }

  // Throws on failure (bad current password, too-short new password, no
  // account, etc.) — callers show err.message directly to the user.
  async function changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('You need to be signed in to change your password')
    const res = await fetch(`${AUTH_ENDPOINT}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.detail || body.error || 'Could not change password')
  }

  // --- Persistence ------------------------------------------------------
  // Authed: debounce a PUT to the backend so it survives across devices.
  // Guest: keep the original synchronous localStorage write.
  const saveTimerRef = useRef(null)
  useEffect(() => {
    if (auth.status === 'guest') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      return
    }
    if (auth.status !== 'authed' || hydratingRef.current) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return
      fetch(STATE_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ state }),
      }).catch((e) => console.warn('Could not sync progress to server:', e))
    }, SAVE_DEBOUNCE_MS)

    return () => clearTimeout(saveTimerRef.current)
  }, [state, auth.status])

  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
  }, [state.profile.theme])

  function setGoal({ text, timeline, domain, roadmap: customRoadmap }) {
    const finalDomain = domain || keywordToDomain(text)
    const roadmap = customRoadmap && customRoadmap.length
      ? customRoadmap
      : buildRoadmap(finalDomain)

    setState((s) => ({
      ...s,
      goal: { text, domain: finalDomain, timeline },
      roadmap,
      streak: 0,
    }))
  }

  function addNotification(notification) {
    setState((s) => ({ ...s, notifications: [notification, ...s.notifications] }))
    pushBrowserNotification(notification)
  }

  function markNotificationRead(id) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }

  function triggerInactivityNudge() {
    const active = state.roadmap.find((m) => m.status === 'active')
    if (!active || !state.goal) return
    addNotification(buildInactivityNudge(state.goal.text, active.title))
  }

  // Stamps today's local date into activityLog so the streak heatmap has
  // something to render. Safe to call as often as we like — days are
  // deduped, and the log is capped so it can't grow forever in localStorage.
  function recordActivity() {
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setState((s) => {
      if (s.activityLog[s.activityLog.length - 1] === key) return s
      const activityLog = [...s.activityLog, key].slice(-400)
      // +10 XP for a new day of activity — not per action, so this can't be
      // farmed by spamming logEngagement calls within the same day.
      return { ...s, activityLog, xp: s.xp + 10 }
    })
  }

  function logEngagement(milestoneId, minutes) {
    setState((s) => ({
      ...s,
      roadmap: s.roadmap.map((m) =>
        m.milestoneId === milestoneId ? { ...m, engagedMinutes: m.engagedMinutes + minutes } : m
      ),
    }))
    recordActivity()
  }

  function resetEngagement(milestoneId) {
    setState((s) => ({
      ...s,
      roadmap: s.roadmap.map((m) =>
        m.milestoneId === milestoneId ? { ...m, engagedMinutes: 0 } : m
      ),
    }))
  }

  function submitAssessment(milestoneId, score) {
    recordActivity()
    setState((s) => {
      const idx = s.roadmap.findIndex((m) => m.milestoneId === milestoneId)
      if (idx === -1) return s
      const passed = score >= 60
      const roadmap = [...s.roadmap]
      roadmap[idx] = { ...roadmap[idx], quizScore: score }

      if (passed) {
        roadmap[idx] = { ...roadmap[idx], status: 'completed' }
        if (roadmap[idx + 1]) {
          roadmap[idx + 1] = { ...roadmap[idx + 1], status: 'active' }
        }
      }

      const nextStreak = passed ? s.streak + 1 : s.streak
      // Every 7th passed assessment banks one more streak freeze, up to a
      // cap of 3 so it stays a rare save rather than an unlimited pass.
      const earnedFreeze = passed && nextStreak > 0 && nextStreak % 7 === 0 && s.streakFreezes < 3

      return {
        ...s,
        roadmap,
        streak: nextStreak,
        // +40 XP for passing an assessment (on top of the +10 for the day's activity above)
        xp: passed ? s.xp + 40 : s.xp,
        streakFreezes: earnedFreeze ? s.streakFreezes + 1 : s.streakFreezes,
      }
    })
    if (score < 60) {
      const m = state.roadmap.find((r) => r.milestoneId === milestoneId)
      if (m) addNotification(buildRemedialNudge(m.title))
    }
  }

  // Moves the milestone with `milestoneId` to sit just before the milestone
  // with `targetMilestoneId` in the roadmap order (drag-and-drop reordering).
  function reorderRoadmap(milestoneId, targetMilestoneId) {
    setState((s) => {
      if (milestoneId === targetMilestoneId) return s
      const current = [...s.roadmap]
      const fromIdx = current.findIndex((m) => m.milestoneId === milestoneId)
      const toIdx = current.findIndex((m) => m.milestoneId === targetMilestoneId)
      if (fromIdx === -1 || toIdx === -1) return s
      const [moved] = current.splice(fromIdx, 1)
      const insertAt = current.findIndex((m) => m.milestoneId === targetMilestoneId)
      current.splice(insertAt === -1 ? current.length : insertAt, 0, moved)
      return { ...s, roadmap: recomputeStatuses(current) }
    })
  }

  // Adds a learner-authored milestone to the end of the roadmap.
  function addMilestone({ title, provider, url, estHours, dueDate }) {
    setState((s) => {
      const newMilestone = {
        milestoneId: `custom-${Date.now()}`,
        title: (title || '').trim() || 'Untitled milestone',
        provider: (provider || '').trim() || 'Custom',
        url: (url || '').trim(),
        estHours: Number(estHours) > 0 ? Number(estHours) : 1,
        status: 'locked',
        engagedMinutes: 0,
        quizScore: null,
        dueDate: dueDate || null,
        notes: '',
        isCustom: true,
      }
      return { ...s, roadmap: recomputeStatuses([...s.roadmap, newMilestone]) }
    })
  }

  function updateMilestone(milestoneId, patch) {
    setState((s) => ({
      ...s,
      roadmap: s.roadmap.map((m) => (m.milestoneId === milestoneId ? { ...m, ...patch } : m)),
    }))
  }

  function deleteMilestone(milestoneId) {
    setState((s) => ({
      ...s,
      roadmap: recomputeStatuses(s.roadmap.filter((m) => m.milestoneId !== milestoneId)),
    }))
  }

  // Scans active/locked milestones with a due date and fires one reminder
  // notification each for anything overdue or due within 3 days.
  function checkDueDateReminders() {
    const now = Date.now()
    const soonThreshold = now + 3 * 24 * 60 * 60 * 1000
    state.roadmap.forEach((m) => {
      if (!m.dueDate || m.status === 'completed') return
      if (remindedRef.current.has(m.milestoneId)) return
      const due = new Date(m.dueDate).getTime()
      if (Number.isNaN(due)) return
      if (due < now) {
        addNotification(buildDueDateReminder(m.title, 'overdue'))
        remindedRef.current.add(m.milestoneId)
      } else if (due <= soonThreshold) {
        addNotification(buildDueDateReminder(m.title, 'soon'))
        remindedRef.current.add(m.milestoneId)
      }
    })
  }

  function logTimeSpent(day, plannedMin, actualMin) {
    setState((s) => {
      const existing = s.timeSpentLog.find((t) => t.day === day)
      const timeSpentLog = existing
        ? s.timeSpentLog.map((t) => (t.day === day ? { ...t, plannedMin, actualMin } : t))
        : [...s.timeSpentLog, { day, plannedMin, actualMin }]
      return { ...s, timeSpentLog }
    })
  }

  function updateProfile(patch) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }

  // Spends one banked streak freeze to cover today, so the day-based streak
  // (see computeDayStreak) survives even if no real activity gets logged.
  function useStreakFreeze() {
    const today = new Date()
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setState((s) => {
      if (s.streakFreezes <= 0) return s
      if (s.activityLog.includes(key) || s.freezeLog.includes(key)) return s // already covered today
      return {
        ...s,
        streakFreezes: s.streakFreezes - 1,
        freezeLog: [...s.freezeLog, key].slice(-400),
      }
    })
  }

  function addJournalEntry(entry) {
    setState((s) => ({ ...s, journalEntries: [{ ...entry, id: Date.now() }, ...(s.journalEntries || [])] }))
  }

  function deleteJournalEntry(id) {
    setState((s) => ({ ...s, journalEntries: (s.journalEntries || []).filter(e => e.id !== id) }))
  }

  function addResource(resource) {
    setState((s) => ({ ...s, resources: [{ ...resource, id: Date.now() }, ...(s.resources || [])] }))
  }

  function deleteResource(id) {
    setState((s) => ({ ...s, resources: (s.resources || []).filter(r => r.id !== id) }))
  }

  function resetProgress() {
    setState((s) => ({
      ...DEFAULT_STATE,
      profile: s.profile, // keep the learner's identity/preferences
    }))
  }

  function t(key) {
    // Basic translation lookup key support fallback
    return key
  }

  const value = {
    state,
    auth,
    login,
    register,
    logout,
    changePassword,
    setGoal,
    addNotification,
    markNotificationRead,
    triggerInactivityNudge,
    notificationPermission,
    notificationsSupported,
    requestNotificationPermission,
    logEngagement,
    resetEngagement,
    recordActivity,
    reorderRoadmap,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    checkDueDateReminders,
    submitAssessment,
    logTimeSpent,
    updateProfile,
    resetProgress,
    useStreakFreeze,
    addJournalEntry,
    deleteJournalEntry,
    addResource,
    deleteResource,
    dayStreak: computeDayStreak(state.activityLog, state.freezeLog),
    t,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
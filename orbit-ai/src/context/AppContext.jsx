import { createContext, useContext, useEffect, useState } from 'react'
import {
  keywordToDomain,
  buildRoadmap,
  buildRoadmapFromMilestones,
  INITIAL_NOTIFICATIONS,
  buildInactivityNudge,
  buildRemedialNudge,
} from '../data/mockData.js'


const STORAGE_KEY = 'orbit-ai-state-v1'

const AppContext = createContext(null)

const DEFAULT_STATE = {
  goal: null, // { text, domain, timeline }
  roadmap: [],
  notifications: INITIAL_NOTIFICATIONS,
  streak: 0,
  timeSpentLog: [], // [{ day: 'Mon', plannedMin, actualMin }]
  profile: {
    name: 'Learner',
    email: '',
    dailyGoalMinutes: 30,
    remindersEnabled: true,
    theme: 'dark',
  },
}

function loadInitialState() {
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

export function AppProvider({ children }) {
  const [state, setState] = useState(loadInitialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.profile.theme
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

  function logEngagement(milestoneId, minutes) {
    setState((s) => ({
      ...s,
      roadmap: s.roadmap.map((m) =>
        m.milestoneId === milestoneId ? { ...m, engagedMinutes: m.engagedMinutes + minutes } : m
      ),
    }))
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
      // else: stays active, a remedial nudge is fired by the caller

      return {
        ...s,
        roadmap,
        streak: passed ? s.streak + 1 : s.streak,
      }
    })
    if (score < 60) {
      const m = state.roadmap.find((r) => r.milestoneId === milestoneId)
      if (m) addNotification(buildRemedialNudge(m.title))
    }
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

  function toggleTheme() {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, theme: s.profile.theme === 'dark' ? 'light' : 'dark' },
    }))
  }

  function resetProgress() {
    setState((s) => ({
      ...DEFAULT_STATE,
      profile: s.profile, // keep the learner's identity/preferences
    }))
  }

  const value = {
    state,
    setGoal,
    addNotification,
    markNotificationRead,
    triggerInactivityNudge,
    logEngagement,
    resetEngagement,
    submitAssessment,
    logTimeSpent,
    updateProfile,
    toggleTheme,
    resetProgress,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
// 7.2 Habit Intelligence Agent
// Responsibilities: analyze learning behavior, track routines, monitor
// consistency, process reflections.
// Input:  daily logs, completed tasks, journals — here that's the existing
//         AETHER state fields activityLog, timeSpentLog, and roadmap.
// Output: Habit Profile.
//
// This agent is deliberately half arithmetic, half LLM: consistency and
// rhythm are things we can just compute from the logs, and the model is
// only asked to turn those numbers into a short behavioral narrative — an
// LLM guessing at a streak percentage would be strictly worse than counting.

import { callGroqJson } from './groqClient.js'

const SYSTEM_PROMPT = `You are the Habit Intelligence Agent inside AETHER, an agentic personal-growth platform.
You are given ALREADY-COMPUTED behavioral statistics (consistency, session length, streak health).
Your only job is to turn those numbers into a short, honest behavioral narrative and flag risk of
drop-off — do not invent statistics, use exactly the ones given.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "behaviorSummary": string,       // 2-3 sentences describing their actual study rhythm
  "riskOfDropOff": "low" | "medium" | "high",
  "riskReason": string,
  "recommendedCadenceNote": string // one sentence a Growth Coach agent could act on
}`

function computeStats({ activityLog = [], timeSpentLog = [], roadmap = [] }) {
  const uniqueDays = new Set(activityLog).size
  const last14 = activityLog.filter((d) => {
    const days = (Date.now() - new Date(d).getTime()) / 86400000
    return days >= 0 && days <= 14
  }).length
  const consistencyScore14d = Math.min(1, last14 / 14)

  const sessions = timeSpentLog.filter((t) => typeof t.actualMin === 'number')
  const avgSessionMinutes = sessions.length
    ? Math.round(sessions.reduce((s, t) => s + t.actualMin, 0) / sessions.length)
    : 0
  const avgPlannedMinutes = sessions.length
    ? Math.round(sessions.reduce((s, t) => s + (t.plannedMin || 0), 0) / sessions.length)
    : 0
  const adherenceRatio = avgPlannedMinutes > 0 ? avgSessionMinutes / avgPlannedMinutes : null

  const completed = roadmap.filter((m) => m.status === 'completed')
  const scored = roadmap.filter((m) => typeof m.quizScore === 'number')
  const avgQuizScore = scored.length
    ? Math.round(scored.reduce((s, m) => s + m.quizScore, 0) / scored.length)
    : null

  return {
    totalActiveDays: uniqueDays,
    consistencyScore14d: Number(consistencyScore14d.toFixed(2)),
    avgSessionMinutes,
    avgPlannedMinutes,
    adherenceRatio: adherenceRatio !== null ? Number(adherenceRatio.toFixed(2)) : null,
    milestonesCompleted: completed.length,
    avgQuizScore,
  }
}

/**
 * @param {object} params
 * @param {string[]} params.activityLog - ['YYYY-MM-DD', ...]
 * @param {Array<{day:string, plannedMin:number, actualMin:number}>} params.timeSpentLog
 * @param {Array} params.roadmap
 * @returns {Promise<object>} Habit Profile
 */
export async function runHabitAgent({ activityLog = [], timeSpentLog = [], roadmap = [] }) {
  const stats = computeStats({ activityLog, timeSpentLog, roadmap })

  const narrative = await callGroqJson({
    system: SYSTEM_PROMPT,
    user: `Computed statistics:\n${JSON.stringify(stats, null, 2)}`,
    max_tokens: 400,
  })

  return {
    ...stats,
    ...narrative,
    updatedAt: new Date().toISOString(),
  }
}
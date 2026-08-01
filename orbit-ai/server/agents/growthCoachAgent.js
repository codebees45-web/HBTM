// 7.5 Growth Coach Agent
// Responsibilities: generate daily plans, set weekly milestones, create
// reflection prompts, adapt schedules to progress.
// Input:  Curated Resource Set + Habit Profile.
// Output: Personalized Growth Plan — this is what closes the pipeline for
//         this cycle. The person acts on it, logs progress, and that
//         progress (via POST /api/AETHER/feedback) is what the Identity
//         Agent reads at the start of the *next* cycle — the feedback loop
//         described in §6/§9/§10 of the doc.

import { callGroqJson } from './groqClient.js'

const SYSTEM_PROMPT = `You are the Growth Coach Agent inside AETHER, an agentic personal-growth platform.
You take a Curated Resource Set (specific resources, each already tied to a named gap) and a Habit
Profile (real behavioral stats) and turn them into an actionable, realistically-paced plan. Respect
the person's actual demonstrated cadence from the Habit Profile — do not prescribe a heavier load
than their adherence ratio and consistency score support.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "dailyTasks": [ { "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun", "task": string, "linkedGap": string, "estimatedMinutes": number } ],
  "weeklyMilestones": [ { "title": string, "linkedGap": string, "successCriteria": string } ],
  "reflectionPrompts": [ string ],   // 2-4 prompts the person answers at week's end; these answers
                                      // are what gets fed back into the Identity Agent next cycle
  "paceNote": string                 // one honest sentence on why this pace was chosen given the Habit Profile
}`

/**
 * @param {object} params
 * @param {object[]} params.curated - from Curator Agent
 * @param {object} params.habitProfile
 * @returns {Promise<object>} Personalized Growth Plan
 */
export async function runGrowthCoachAgent({ curated, habitProfile }) {
  const plan = await callGroqJson({
    system: SYSTEM_PROMPT,
    user: [
      'Curated Resource Set:',
      JSON.stringify(curated, null, 2),
      '',
      'Habit Profile:',
      JSON.stringify(habitProfile, null, 2),
    ].join('\n'),
    max_tokens: 1100,
  })

  return {
    ...plan,
    generatedAt: new Date().toISOString(),
  }
}
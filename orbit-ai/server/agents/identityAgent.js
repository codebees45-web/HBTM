// 7.1 Identity Agent
// Responsibilities: understand aspirations, build the user profile, maintain
// an evolving identity, store strengths and weaknesses.
// Input:  goal (text, domain, timeline), plus any prior profile + feedback
//         fed back from a previous Growth Coach cycle.
// Output: Identity Profile — this is the thing every later agent reasons
//         against, and the thing the feedback loop (§10) writes back into.

import { callGroqJson } from './groqClient.js'

const SYSTEM_PROMPT = `You are the Identity Agent inside AETHER, an agentic personal-growth platform.
Your only job is to build and continuously update a person's Identity Profile: who they are today,
what they aspire to become, and the strengths/weaknesses that separate the two.

You are NOT recommending anything and NOT writing a plan — that is other agents' jobs. Stay in your lane.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "aspirations": string[],           // what the person is trying to become/achieve, in their own terms
  "currentIdentitySummary": string,  // 2-3 sentences: who they are today, in this domain
  "desiredIdentitySummary": string,  // 2-3 sentences: who they are trying to become
  "strengths": string[],
  "weaknesses": string[],
  "learningPreferences": string[],   // e.g. "prefers video over text", "learns best hands-on"
  "confidence": number               // 0-1, how confident this profile is given the evidence so far
}`

/**
 * @param {object} params
 * @param {{text:string, domain:string, timeline:string}} params.goal
 * @param {object|null} params.existingProfile - the last stored Identity Profile, if any
 * @param {Array<{note:string, at:string}>} params.feedbackHistory - reflections/progress
 *        fed back from previous Growth Coach cycles (see routes/AETHER.js POST /feedback)
 * @returns {Promise<object>} Identity Profile
 */
export async function runIdentityAgent({ goal, existingProfile = null, feedbackHistory = [] }) {
  const userParts = [
    `Stated goal: "${goal?.text || 'unknown'}"`,
    `Domain: ${goal?.domain || 'unspecified'}`,
    `Timeline: ${goal?.timeline || 'unspecified'}`,
  ]

  if (existingProfile) {
    userParts.push(
      '',
      'Existing Identity Profile from the last cycle (update it, do not start from scratch):',
      JSON.stringify(existingProfile, null, 2)
    )
  }

  if (feedbackHistory.length) {
    userParts.push(
      '',
      'Recent feedback/reflections from the person, most recent last (use these to update strengths,',
      'weaknesses, and confidence — this is the feedback loop closing):',
      feedbackHistory.slice(-8).map((f) => `- (${f.at}) ${f.note}`).join('\n')
    )
  }

  const profile = await callGroqJson({
    system: SYSTEM_PROMPT,
    user: userParts.join('\n'),
    max_tokens: 700,
  })

  return {
    ...profile,
    updatedAt: new Date().toISOString(),
  }
}
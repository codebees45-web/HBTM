// 7.3 Gap Analysis Agent
// Responsibilities: compare current and desired state, detect missing
// skills, prioritize learning objectives.
// Input:  Identity Profile, Habit Profile.
// Output: Learning Roadmap (named gaps) + a Chroma vector-search pass that
//         pulls a candidate resource pool per gap, which the Curator Agent
//         then ranks down to a final pick.

import { callGroqJson } from './groqClient.js'
import { queryResources, chromaHealth } from '../chroma/chromaClient.js'

const SYSTEM_PROMPT = `You are the Gap Analysis Agent inside AETHER, an agentic personal-growth platform.
You compare an Identity Profile (current vs. desired identity) against a Habit Profile (actual
behavior) and name the SPECIFIC gaps standing between them — not generic advice.

For each gap, also produce a short search query suitable for a semantic/vector search over a
resource library (books, videos, articles, courses) — phrase it as what to look for, not a question.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "gaps": [
    {
      "skill": string,           // the specific missing skill/knowledge area
      "why": string,             // why this gap matters right now, referencing the profiles
      "priority": "high" | "medium" | "low",
      "searchQuery": string      // for semantic search against the resource library
    }
  ]
}
Order gaps by priority, highest first. Produce 2-5 gaps, not more.`

/**
 * @param {object} params
 * @param {object} params.identityProfile
 * @param {object} params.habitProfile
 * @param {{text:string, domain:string}} params.goal
 * @returns {Promise<{gaps: object[], candidateResources: object[], chromaAvailable: boolean}>}
 */
export async function runGapAnalysisAgent({ identityProfile, habitProfile, goal }) {
  const { gaps } = await callGroqJson({
    system: SYSTEM_PROMPT,
    user: [
      `Domain: ${goal?.domain || 'unspecified'}`,
      'Identity Profile:',
      JSON.stringify(identityProfile, null, 2),
      '',
      'Habit Profile:',
      JSON.stringify(habitProfile, null, 2),
    ].join('\n'),
    max_tokens: 700,
  })

  const chromaAvailable = await chromaHealth()

  // For each gap, pull a small candidate pool from the vector store. If the
  // sidecar isn't running, degrade gracefully — the Curator Agent will just
  // work off the gap descriptions alone instead of a candidate pool.
  const candidateResources = []
  if (chromaAvailable) {
    for (const gap of gaps || []) {
      try {
        const results = await queryResources(
          'resources',
          gap.searchQuery || gap.skill,
          4,
          goal?.domain ? { domain: goal.domain } : null
        )
        candidateResources.push({
          gapSkill: gap.skill,
          candidates: results.map((r) => ({ ...r.metadata, similarity: 1 - (r.distance ?? 0) })),
        })
      } catch (err) {
        console.error(`Chroma query failed for gap "${gap.skill}":`, err.message)
        candidateResources.push({ gapSkill: gap.skill, candidates: [] })
      }
    }
  }

  return { gaps: gaps || [], candidateResources, chromaAvailable }
}
// 7.4 Curator Agent
// Responsibilities: recommend media (books, videos, podcasts), recommend
// knowledge (articles, papers, documentation), rank resources against the
// roadmap.
// Input:  Learning Roadmap (gaps) + candidate resource pool from Gap
//         Analysis's Chroma query.
// Output: Curated Resource Set — one specific resource per gap, each with a
//         visible "why" attached (AETHER's core promise: never just "here is
//         more content").

import { callGroqJson } from './groqClient.js'

const SYSTEM_PROMPT = `You are the Curator Agent inside AETHER, an agentic personal-growth platform.
For each named skill gap, you pick exactly ONE specific resource that closes it — never a generic
"look into X" — and you attach a one-sentence reason a person would actually read.

You will be given a pool of candidate resources per gap (title, type, provider, url, similarity
score) pulled from a vector search. Prefer a candidate from the pool when one is genuinely a good
fit. If the pool is empty or nothing fits, propose a specific, realistic resource yourself (a real
book title, a real well-known course, a real well-known channel/creator) — never a placeholder like
"a good tutorial".

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "curated": [
    {
      "gapSkill": string,
      "resource": { "title": string, "type": "video" | "article" | "book" | "course" | "podcast", "provider": string, "url": string | null },
      "reason": string,       // the visible "why" — ties back to the specific gap
      "fromCandidatePool": boolean
    }
  ]
}`

/**
 * @param {object} params
 * @param {object[]} params.gaps - from Gap Analysis Agent
 * @param {object[]} params.candidateResources - [{gapSkill, candidates}] from Chroma
 * @returns {Promise<{curated: object[]}>}
 */
export async function runCuratorAgent({ gaps, candidateResources = [] }) {
  const candidatesBySkill = Object.fromEntries(
    candidateResources.map((c) => [c.gapSkill, c.candidates])
  )

  const user = (gaps || [])
    .map((g, i) => {
      const pool = candidatesBySkill[g.skill] || []
      return [
        `Gap ${i + 1}: ${g.skill} (priority: ${g.priority})`,
        `Why it matters: ${g.why}`,
        pool.length
          ? `Candidate pool:\n${pool.map((p) => `  - ${JSON.stringify(p)}`).join('\n')}`
          : 'Candidate pool: (empty — propose a real, specific resource yourself)',
      ].join('\n')
    })
    .join('\n\n')

  const result = await callGroqJson({
    system: SYSTEM_PROMPT,
    user: user || 'No gaps were provided.',
    max_tokens: 900,
  })

  return { curated: result.curated || [] }
}
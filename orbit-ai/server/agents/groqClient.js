// Shared Groq call helper used by every AETHER agent.
//
// This intentionally mirrors the callGroq()/extractJson() pattern already
// used in server/index.js for /api/mentor, /api/parse-goal, etc. — the
// agents are just more Groq callers with a specific system prompt and a
// specific piece of state to read/write, so there's no reason for them to
// have a different HTTP client than the rest of the app.

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint and returns the
 * raw text content of the reply.
 */
export async function callGroq({ system, messages, max_tokens = 900, temperature = 0.4 }) {
  if (!GROQ_API_KEY) {
    const err = new Error('Server missing GROQ_API_KEY')
    err.status = 500
    throw err
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens,
      temperature,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.error?.message || `Groq API returned ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Strips markdown fences and parses a JSON object out of a model reply.
 * Every agent asks the model for JSON-only output, so this is shared too.
 */
export function extractJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim()
  return JSON.parse(cleaned)
}

/**
 * Calls Groq expecting a JSON object back, with one automatic retry that
 * re-states the formatting requirement if the first reply doesn't parse.
 * Every agent node needs this exact behavior, so it lives here once.
 */
export async function callGroqJson({ system, user, max_tokens = 900, temperature = 0.4 }) {
  const messages = [{ role: 'user', content: user }]

  const raw = await callGroq({ system, messages, max_tokens, temperature })
  try {
    return extractJson(raw)
  } catch {
    const retry = await callGroq({
      system,
      max_tokens,
      temperature,
      messages: [
        ...messages,
        { role: 'assistant', content: raw },
        {
          role: 'user',
          content:
            'That was not valid JSON. Reply again with ONLY the JSON object — no markdown fences, no prose before or after it.',
        },
      ],
    })
    return extractJson(retry)
  }
}
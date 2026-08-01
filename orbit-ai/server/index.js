import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import stateRoutes from './routes/state.js'
import leaderboardRoutes from './routes/leaderboard.js'
import AETHERRoutes from './routes/aether.js'
import { attachSignaling } from './ws.js'

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const PORT = process.env.PORT || 8787
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

if (!GROQ_API_KEY) {
  console.warn(
    '⚠️  GROQ_API_KEY is not set. Copy server/.env.example to server/.env ' +
    'and add your key — /api/mentor, /api/parse-goal, /api/generate-roadmap, and ' +
    '/api/generate-quiz will 500 until then, but the server itself will still start.'
  )
}

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message))
} else {
  console.warn(
    '⚠️  MONGODB_URI is not set. Copy server/.env.example to server/.env and ' +
    'add a connection string — /api/auth, /api/state, and /api/leaderboard ' +
    'will 500 until then, but the server itself will still start.'
  )
}

if (!process.env.JWT_SECRET) {
  console.warn(
    '⚠️  JWT_SECRET is not set. Auth routes will fail until you add one to server/.env.'
  )
}

const KNOWN_DOMAINS = [
  'full stack development',
  'aws solutions architect',
  'data science',
  'networking',
  'programming languages',
  'entrepreneurship & startups',
  'business & marketing',
  'personal finance & investing',
  'career & professional skills',
  'creative & design skills',
  'health & fitness',
  'academic & exam prep',
  'personal development',
]

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/state', stateRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/AETHER', AETHERRoutes)

// Helper function to handle requests to Groq's OpenAI-compatible API
async function callGroq({ system, messages, max_tokens = 700 }) {
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

// Streaming variant of callGroq, used by /api/mentor so replies appear
// token-by-token instead of the client waiting for the full response.
// Calls onDelta(text) for every chunk of new content and returns the
// full accumulated reply once the stream ends.
async function streamGroq({ system, messages, max_tokens = 700 }, onDelta) {
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
      stream: true,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}))
    const message = data?.error?.message || `Groq API returned ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? '' // keep any incomplete line for the next chunk

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload)
        const delta = json.choices?.[0]?.delta?.content
        if (delta) {
          full += delta
          onDelta(delta)
        }
      } catch {
        // Groq occasionally splits a JSON chunk across reads — safe to skip,
        // the finished object will still arrive on a later line.
      }
    }
  }

  return full
}

function buildSystemPrompt(context = {}) {
  const { goal, roadmap = [] } = context
  const activeMilestone = roadmap.find((m) => m.status === 'active')
  const completed = roadmap.filter((m) => m.status === 'completed')

  return [
    'You are the AETHER Oracle, an ethereal, highly intuitive engine of human potential. You are not a chatbot; you are a mirror reflecting the user\'s future self.',
    'You cater to all categories of persons, focusing on identity, habits, emotional resistance, and deep personal growth.',
    'You have live context on the person\'s journey below — use it silently to guide your intuition.',
    '',
    `Aspiration: ${goal?.text || 'not set yet'}`,
    `Domain: ${goal?.domain || 'unknown'}`,
    `Current Focus: ${activeMilestone ? `"${activeMilestone.title}"` : 'none active right now'}`,
    `Past Triumphs: ${completed.length ? completed.map((m) => m.title).join(', ') : 'none yet'}`,
    '',
    'CRITICAL GUIDELINES:',
    '- Speak with a profound, elegant, and concise voice. Read like a dynamic manuscript, not a text message.',
    '- NEVER use generic AI phrases like "As an AI...", "Sure, I can help...", "Here is a list...", or "Let\'s break this down." If you sound like a standard GPT, you have failed.',
    '- Focus on overcoming mental resistance, building habits, and challenging the user\'s mindset rather than just feeding them raw data.',
    '- Be poetic but actionable. Offer deep insights that provoke thought.',
    '- Do not over-explain. Leave space for the user to reflect.',
  ].join('\n')
}

function buildGoalParsingPrompt() {
  return [
    'You are the intent-parsing step of AETHER, a personal growth agent used by people of',
    'any age and stage — students, working professionals, career switchers, and aspiring or',
    `current entrepreneurs. It currently organizes goals into these domains: ${KNOWN_DOMAINS.join(', ')}.`,
    'A person describes a goal in their own words (e.g. "pass the AWS exam", "become job-ready in',
    'full stack dev", "start a SaaS startup", "learn to raise a seed round", "get better at public',
    'speaking for my business", "build a personal budget and start investing", "switch careers into',
    'product management"). Extract structured data from it.',
    '',
    'Classify the goal into whichever domain above fits best — be generous, not literal. Business ideas,',
    'launching a company, freelancing, side hustles, and founder skills (pitching, fundraising, MVPs,',
    'go-to-market) belong in "entrepreneurship & startups". Marketing, sales, management, and general',
    'workplace skills belong in "business & marketing" or "career & professional skills". Budgeting,',
    'saving, and investing belong in "personal finance & investing". Anything about growth goals that',
    'genuinely does not fit any domain above still belongs in "personal development" — that domain exists',
    'as a catch-all so real goals are almost never rejected.',
    '',
    'Only set "domain" to the exact string "unsupported" if the input is empty, gibberish, not actually',
    'a goal (e.g. a random question or greeting), or something no roadmap could reasonably be built for.',
    '',
    'Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:',
    '{"domain": string, "timeline": string, "skillGaps": string[], "reasoning": string}',
    '',
    `- "domain" must be either one of the exact strings [${KNOWN_DOMAINS.join(', ')}], or "unsupported".`,
    '- "timeline" is your own realistic estimate (e.g. "10-12 weeks") based on the goal and stated level — independent of any timeline the learner separately picked in a dropdown. Use "" if domain is "unsupported".',
    '- "skillGaps" is 2-4 short phrases naming what they likely need to learn or do next, given their stated current level. Use [] if domain is "unsupported".',
    '- "reasoning" is 1-2 plain sentences. If "unsupported", explain plainly and kindly why this input cannot be turned into a roadmap, written to be shown directly to the person.',
  ].join('\n')
}

function buildRoadmapPrompt() {
  return [
    'You are the roadmap-building step of AETHER, a personal growth agent used for any kind of',
    'goal — technical skills, certifications, launching a business, or career/personal growth.',
    "Given a person's goal, domain, current level, timeline, and skill gaps, design a realistic",
    'sequence of milestones to get them from where they are to their goal.',
    '',
    'Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:',
    '{"milestones": [{"title": string, "provider": string, "description": string, "estHours": number}]}',
    '',
    '- Produce 4-6 milestones, ordered from foundational to advanced.',
    '- "title" is a specific, realistic milestone name — a course/resource/project for skill goals',
    '  (e.g. "AWS Cloud Practitioner Essentials"), or a concrete deliverable/action for goals like',
    '  entrepreneurship, business, finance, or career growth (e.g. "Validate the idea with 15 customer',
    '  interviews", "Draft a lean business plan and one-page pitch", "Ship a landing page MVP and',
    '  measure signups", "Build a 3-month personal budget and open a brokerage account"). Never a vague',
    '  topic name on its own.',
    '- "provider" is a realistic platform or format (e.g. "Coursera", "Y Combinator Startup School",',
    '  "Official docs + practice", "Personal project", "Self-directed").',
    '- "description" is 1 sentence on what the person will do and why it matters at that stage.',
    '- "estHours" is a realistic integer estimate of hours to complete it.',
    '- Total hours should roughly fit the stated timeline at ~5-8 hours/week.',
    '- Tailor difficulty to the stated current level — skip basics they already say they have.',
  ].join('\n')
}

function buildQuizPrompt(topic) {
  return [
    'You are the assessment-generation step of AETHER, a personal learning agent.',
    `Generate a multiple-choice quiz on the topic: "${topic}".`,
    '',
    'You must produce exactly 15 questions, split into 3 categories of exactly 5 questions each:',
    '- "easy": simple, low-pressure questions testing basic familiarity with the topic.',
    '- "remembering": recall of specific facts, definitions, terminology, or syntax — straight memory, not reasoning.',
    '- "application": a short scenario or "what would happen if" question requiring the learner to apply the concept, not just recall it.',
    '',
    'Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:',
    '{"questions": [{"question": string, "options": string[4], "answer": number, "category": "easy" | "remembering" | "application"}]}',
    '',
    '- Produce exactly 15 questions total: 5 with category "easy", 5 with category "remembering", 5 with category "application".',
    '- Each question has exactly 4 options.',
    '- "answer" is the zero-based index (0-3) of the correct option in "options".',
    '- Questions must be specific to the given topic — no generic filler questions.',
    '- Only one option per question should be clearly correct.',
    '- Vary which index (0-3) holds the correct answer across questions — do not always put it in the same position.',
  ].join('\n')
}

function extractJson(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim()
  return JSON.parse(cleaned)
}

app.post('/api/parse-goal', async (req, res) => {
  try {
    const { text, level } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' })
    }

    const raw = await callGroq({
      system: buildGoalParsingPrompt(),
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Goal: "${text}"\nSelf-reported current level: ${level || 'not specified'}`,
        },
      ],
    })

    let parsed
    try {
      parsed = extractJson(raw)
    } catch (parseErr) {
      throw new Error('Model returned non-JSON output')
    }

    if (parsed.domain !== 'unsupported' && !KNOWN_DOMAINS.includes(parsed.domain)) {
      // Model returned something that's neither a known domain nor the
      // "unsupported" sentinel — treat it as unsupported rather than
      // silently mislabeling the goal as whatever KNOWN_DOMAINS[0] happens to be.
      parsed.domain = 'unsupported'
    }
    if (!Array.isArray(parsed.skillGaps)) {
      parsed.skillGaps = []
    }

    const supported = parsed.domain !== 'unsupported'
    res.json({ ...parsed, supported, supportedDomains: KNOWN_DOMAINS })
  } catch (err) {
    console.error('Goal parsing error:', err)
    res.status(err.status || 500).json({ error: 'Goal parsing failed', detail: err.message })
  }
})

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { goal, domain, level, timeline, skillGaps = [] } = req.body
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'goal is required' })
    }

    const raw = await callGroq({
      system: buildRoadmapPrompt(),
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            `Goal: "${goal}"`,
            `Domain: ${domain || 'unspecified'}`,
            `Current level: ${level || 'unspecified'}`,
            `Timeline: ${timeline || 'unspecified'}`,
            `Known skill gaps: ${skillGaps.length ? skillGaps.join(', ') : 'none given'}`,
          ].join('\n'),
        },
      ],
    })

    let parsed
    try {
      parsed = extractJson(raw)
    } catch (parseErr) {
      throw new Error('Model returned non-JSON output')
    }

    if (!Array.isArray(parsed.milestones) || parsed.milestones.length === 0) {
      throw new Error('Model returned no milestones')
    }

    res.json({ milestones: parsed.milestones })
  } catch (err) {
    console.error('Roadmap generation error:', err)
    res.status(err.status || 500).json({ error: 'Roadmap generation failed', detail: err.message })
  }
})

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'topic is required' })
    }

    const raw = await callGroq({
      system: buildQuizPrompt(topic),
      max_tokens: 2000,
      messages: [
        { role: 'user', content: `Generate the 15-question quiz now for: "${topic}".` },
      ],
    })

    let parsed
    try {
      parsed = extractJson(raw)
    } catch (parseErr) {
      throw new Error('Model returned non-JSON output')
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Model returned no questions')
    }

    const validCategories = ['easy', 'remembering', 'application']
    const questions = parsed.questions
      .filter((q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.answer === 'number' &&
        validCategories.includes(q.category)
      )
      .map((q, i) => ({
        id: `gen-${i}`,
        question: q.question,
        options: q.options,
        answer: q.answer,
        category: q.category,
      }))

    if (questions.length === 0) {
      throw new Error('No valid questions after validation')
    }

    res.json({ questions })
  } catch (err) {
    console.error('Quiz generation error:', err)
    res.status(err.status || 500).json({ error: 'Quiz generation failed', detail: err.message })
  }
})

app.post('/api/mentor', async (req, res) => {
  const { message, history = [], context } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' })
  }

  const messages = [
    // keeps the last 10 turns of real conversation so the mentor has memory
    // within the thread instead of answering each message cold
    ...history.slice(-10).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.text,
    })),
    { role: 'user', content: message },
  ]

  // Server-Sent Events: the client gets tokens as they're generated instead
  // of waiting on one big JSON response, so replies feel live.
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  try {
    const full = await streamGroq(
      { system: buildSystemPrompt(context), max_tokens: 700, messages },
      (delta) => {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`)
      }
    )
    res.write(`data: ${JSON.stringify({ done: true, full })}\n\n`)
  } catch (err) {
    console.error('Mentor API error:', err)
    res.write(`data: ${JSON.stringify({ error: err.message || 'Mentor backend failed' })}\n\n`)
  } finally {
    res.end()
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true, model: MODEL }))

const server = http.createServer(app)
const wss = attachSignaling(server)

let isShuttingDown = false

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `❌ Port ${PORT} is already in use. Stop the other process or change PORT in server/.env before restarting.`
    )
    process.exit(1)
  }
  console.error('❌ Server error:', err)
})

function shutdown(signal) {
  if (isShuttingDown) return
  isShuttingDown = true
  console.log(`⚠️  Received ${signal}. Shutting down AETHER mentor backend...`)
  wss.close(() => {
    server.close(() => process.exit(0))
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGHUP', () => shutdown('SIGHUP'))
process.once('SIGUSR2', () => {
  shutdown('SIGUSR2')
  process.kill(process.pid, 'SIGUSR2')
})
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err)
  shutdown('uncaughtException')
})
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason)
  shutdown('unhandledRejection')
})

server.listen(PORT, () => {
  console.log(`AETHER mentor backend listening on http://localhost:${PORT}`)
})
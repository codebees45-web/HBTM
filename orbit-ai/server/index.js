import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const PORT = process.env.PORT || 8787

let groq = null
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
} else {
  console.warn(
    '⚠️  GROQ_API_KEY is not set. Copy server/.env.example to server/.env ' +
    'and add your free key from https://console.groq.com/keys — ' +
    '/api/mentor, /api/parse-goal, and /api/generate-roadmap will 500 until then.'
  )
}

const KNOWN_DOMAINS = [
  'full stack development',
  'aws solutions architect',
  'data science',
  'networking',
]

const app = express()
app.use(cors())
app.use(express.json())

function buildSystemPrompt(context = {}) {
  const { goal, roadmap = [] } = context
  const activeMilestone = roadmap.find((m) => m.status === 'active')
  const completed = roadmap.filter((m) => m.status === 'completed')
  const scored = roadmap.filter((m) => m.quizScore !== null && m.quizScore !== undefined)

  return [
    'You are the ORBIT AI Mentor, an in-app tutor embedded inside a personal learning agent.',
    "You have live context on the learner's goal and roadmap below — use it, don't ask them to repeat it.",
    '',
    `Goal: ${goal?.text || 'not set yet'}`,
    `Domain: ${goal?.domain || 'unknown'}`,
    `Timeline: ${goal?.timeline || 'unknown'}`,
    `Current milestone: ${activeMilestone ? `"${activeMilestone.title}" (${activeMilestone.provider})` : 'none active right now'}`,
    `Completed milestones: ${completed.length ? completed.map((m) => m.title).join(', ') : 'none yet'}`,
    `Recent assessment scores: ${scored.length ? scored.map((m) => `${m.title}: ${m.quizScore}%`).join(', ') : 'none yet'}`,
    '',
    'Guidelines:',
    '- Be concise and concrete. Prefer a short explanation plus a next action over a lecture.',
    "- If they're stuck on something in the current milestone, teach the underlying concept, not just the answer.",
    '- If their recent scores are low, be honest and encouraging — point at the specific gap, not general reassurance.',
    "- If the question is unrelated to their learning goal, answer it briefly, then gently connect back to their roadmap if there's a natural link.",
  ].join('\n')
}

function buildGoalParsingPrompt() {
  return [
    'You are the intent-parsing step of ORBIT AI, a personal learning agent.',
    "A learner describes a goal in their own words. Extract structured data from it.",
    '',
    `You must classify the goal into exactly one of these domains: ${KNOWN_DOMAINS.join(', ')}.`,
    'If nothing matches well, pick the closest one — never invent a new domain string.',
    '',
    'Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:',
    '{"domain": string, "timeline": string, "skillGaps": string[], "reasoning": string}',
    '',
    '- "domain" must be one of the exact strings listed above.',
    '- "timeline" is your own realistic estimate (e.g. "10-12 weeks") based on the goal and stated level.',
    '- "skillGaps" is 2-4 short phrases naming what they likely need to learn next.',
    '- "reasoning" is 1-2 plain sentences explaining the domain classification, shown directly to the learner.',
  ].join('\n')
}

function buildRoadmapPrompt() {
  return [
    'You are the roadmap-building step of ORBIT AI, a personal learning agent.',
    "Given a learner's goal, domain, current level, timeline, and skill gaps, design a",
    'realistic sequence of learning milestones to get them from where they are to their goal.',
    '',
    'Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:',
    '{"milestones": [{"title": string, "provider": string, "description": string, "estHours": number}]}',
    '',
    '- Produce 4-6 milestones, ordered from foundational to advanced.',
    '- "title" is a specific, realistic course/resource/project name (not a vague topic name).',
    '- "provider" is a realistic platform or format (e.g. "Coursera", "Official docs + practice", "Personal project").',
    '- "description" is 1 sentence on what the learner will do and why it matters at that stage.',
    '- "estHours" is a realistic integer estimate of hours to complete it.',
    '- Total hours should roughly fit the stated timeline at ~5-8 hours/week.',
    '- Tailor difficulty to the stated current level — skip basics they already say they have.',
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
    if (!groq) {
      return res.status(500).json({ error: 'Server missing GROQ_API_KEY' })
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: buildGoalParsingPrompt() },
        { role: 'user', content: `Goal: "${text}"\nSelf-reported current level: ${level || 'not specified'}` },
      ],
    })

    const raw = completion.choices[0].message.content
    let parsed
    try {
      parsed = extractJson(raw)
    } catch (parseErr) {
      throw new Error('Model returned non-JSON output')
    }

    if (!KNOWN_DOMAINS.includes(parsed.domain)) {
      parsed.domain = KNOWN_DOMAINS[0]
    }
    if (!Array.isArray(parsed.skillGaps)) {
      parsed.skillGaps = []
    }

    res.json(parsed)
  } catch (err) {
    console.error('Goal parsing error:', err)
    res.status(500).json({ error: 'Goal parsing failed', detail: err.message })
  }
})

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { goal, domain, level, timeline, skillGaps = [] } = req.body
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'goal is required' })
    }
    if (!groq) {
      return res.status(500).json({ error: 'Server missing GROQ_API_KEY' })
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: buildRoadmapPrompt() },
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

    const raw = completion.choices[0].message.content
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
    res.status(500).json({ error: 'Roadmap generation failed', detail: err.message })
  }
})

app.post('/api/mentor', async (req, res) => {
  try {
    const { message, history = [], context } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' })
    }
    if (!groq) {
      return res.status(500).json({ error: 'Server missing GROQ_API_KEY' })
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(context) },
      ...history.slice(-10).map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.text,
      })),
      { role: 'user', content: message },
    ]

    const completion = await groq.chat.completions.create({ model: MODEL, messages })
    const reply = completion.choices[0].message.content

    res.json({ reply })
  } catch (err) {
    console.error('Mentor API error:', err)
    res.status(500).json({ error: 'Mentor backend failed', detail: err.message })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true, model: MODEL }))

app.listen(PORT, () => {
  console.log(`ORBIT AI mentor backend listening on http://localhost:${PORT}`)
})
function buildQuizPrompt(topic) {
  return [
    'You are the assessment-generation step of ORBIT AI, a personal learning agent.',
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

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'topic is required' })
    }
    if (!groq) {
      return res.status(500).json({ error: 'Server missing GROQ_API_KEY' })
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: buildQuizPrompt(topic) },
        { role: 'user', content: `Generate the 15-question quiz now for: "${topic}".` },
      ],
    })

    const raw = completion.choices[0].message.content
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
    res.status(500).json({ error: 'Quiz generation failed', detail: err.message })
  }
})
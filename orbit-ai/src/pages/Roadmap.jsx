import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const MOCK_LESSON = `
Lesson: Understanding the Request/Response Cycle

Every time a browser loads a page, it sends a request to a server and
waits for a response. The request carries a method (GET, POST, PUT,
DELETE), a URL, headers, and sometimes a body. The server reads the
request, does whatever work is needed — querying a database, checking
auth, rendering a template — and sends back a response: a status code,
headers, and a body.

Status codes are grouped by their first digit. 2xx means success. 3xx
means redirect. 4xx means the client made a mistake — bad input,
missing auth, a typo in the URL. 5xx means the server broke.

Idempotency matters here. A GET request should be safe to repeat: it
just reads data and shouldn't change anything. A POST usually isn't
idempotent — running it twice might create two records instead of one.
PUT is meant to be idempotent: replacing a resource with the same data
twice should leave things exactly as they were after the first call.

Keep this mental model — request in, work happens, response out — and
almost everything else you learn about web frameworks will slot neatly
on top of it.

Take your time on this. Skimming fast to "finish" a lesson defeats the
purpose — you'll hit the assessment with gaps you don't know you have.
`.trim()

const SESSION_SECONDS_TO_COMPLETE = 25 // shortened for demo purposes
const FAST_SCROLL_PX_PER_TICK = 260

function StudySession({ milestone, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [warning, setWarning] = useState(null)
  const [paused, setPaused] = useState(false)
  const scrollRef = useRef(null)
  const lastScrollTop = useRef(0)
  const flaggedRecently = useRef(false)

  useEffect(() => {
    function handleVisibility() {
      setPaused(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      onComplete()
    }
  }, [progress]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      if (paused || flaggedRecently.current) return
      setProgress((p) => Math.min(100, p + 100 / SESSION_SECONDS_TO_COMPLETE))
    }, 1000)
    return () => clearInterval(interval)
  }, [paused])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const delta = Math.abs(el.scrollTop - lastScrollTop.current)
    lastScrollTop.current = el.scrollTop

    if (delta > FAST_SCROLL_PX_PER_TICK) {
      flaggedRecently.current = true
      setWarning("That's scrolling, not reading — progress paused. Slow down and we'll pick back up.")
      setProgress((p) => Math.max(0, p - 15))
      setTimeout(() => {
        flaggedRecently.current = false
        setWarning(null)
      }, 2500)
    }
  }

  return (
    <div className="study-session">
      <div className="study-session-head">
        <span className="eyebrow">Study session · {milestone.title}</span>
        <a href={milestone.url} target="_blank" rel="noreferrer" className="muted-link">
          Open on {milestone.provider} ↗
        </a>
      </div>

      <p className="study-note">
        Live cross-site scroll tracking on {milestone.provider}'s own pages isn't
        something a browser lets a third-party webpage do — that needs a browser
        extension. This panel demonstrates the same idea locally: read at a normal
        pace and your progress fills in; scroll fast and it resets.
      </p>

      <div
        className="study-passage"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {MOCK_LESSON.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {warning && <div className="study-warning">{warning}</div>}
      {paused && <div className="study-warning muted">Tab hidden — progress paused, not reset.</div>}

      <div className="stat-bar" style={{ marginTop: 16 }}>
        <div className="stat-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="task-meta">{Math.round(progress)}% engaged reading</span>
    </div>
  )
}

export default function Roadmap() {
  const { state, logEngagement } = useApp()
  const navigate = useNavigate()
  const [sessionMilestone, setSessionMilestone] = useState(null)
  const [readyForAssessment, setReadyForAssessment] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { roadmap } = state

  const filtered = roadmap
    .map((m, i) => ({ ...m, _idx: i }))
    .filter((m) => statusFilter === 'all' || m.status === statusFilter)
    .filter((m) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return m.title.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
    })

  function startSession(m) {
    setSessionMilestone(m)
    setReadyForAssessment(null)
  }

  function handleSessionComplete() {
    if (!sessionMilestone) return
    logEngagement(sessionMilestone.milestoneId, 20)
    setReadyForAssessment(sessionMilestone.milestoneId)
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Living roadmap</span>
        <h1>Milestones for {state.goal?.domain}</h1>
      </div>

      <div className="roadmap-filters">
        <input
          type="text"
          placeholder="Search milestones or providers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="locked">Locked</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="roadmap-list">
        {filtered.length === 0 && (
          <p className="empty-state" style={{ padding: '20px 24px' }}>
            No milestones match "{query}"{statusFilter !== 'all' ? ` in ${statusFilter}` : ''}.
          </p>
        )}
        {filtered.map((m) => (
          <div key={m.milestoneId} className={`roadmap-card status-${m.status}`}>
            <div className="roadmap-index">{String(m._idx + 1).padStart(2, '0')}</div>
            <div className="roadmap-body">
              <h3>{m.title}</h3>
              <span className="task-meta">{m.provider} · ~{m.estHours}h · {m.status}</span>
              {m.quizScore !== null && (
                <span className="task-meta"> · last assessment: {m.quizScore}%</span>
              )}
            </div>
            <div className="roadmap-actions">
              {m.status === 'active' && (
                <button className="btn btn-ghost" onClick={() => startSession(m)}>
                  Study →
                </button>
              )}
              {m.status === 'completed' && <span className="task-tag">done</span>}
              {m.status === 'locked' && <span className="task-tag">locked</span>}
            </div>
          </div>
        ))}
      </div>

      {sessionMilestone && (
        <>
          <StudySession milestone={sessionMilestone} onComplete={handleSessionComplete} />
          {readyForAssessment === sessionMilestone.milestoneId && (
            <div className="panel" style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: 14 }}>
                Nice work — you've earned the assessment for this milestone.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard/assessment')}>
                Go to Assessment →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
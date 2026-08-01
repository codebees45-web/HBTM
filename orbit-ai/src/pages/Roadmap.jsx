import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { isExtensionPresent, requestTodayExternalActivity } from '../lib/externalActivity.js'

const MOCK_LESSON = `
Lesson: The Architecture of Identity

True personal growth isn't about acquiring facts; it's about shifting how
you see yourself. Every action you take is a vote for the type of person
you wish to become. When you curate your media, the tools you use, and
the experiences you lean into, you are actively designing your environment
to reflect that future self.

Most digital algorithms optimize for attention—keeping you scrolling
through endless feeds of short-term dopamine hits. But an agentic AI
optimizes for human potential. It filters out the noise and surfaces the
exact mentor, book, or practice you need at this precise moment in your
journey.

Growth is rarely linear. There will be plateaus where it feels like
nothing is changing, followed by sudden breakthroughs. Your goal right now
is to build the systems and habits that sustain you during the plateaus.
Focus on consistency over intensity.

Read this actively. Think about one specific habit you can tweak today
that aligns with your aspirations, and prepare to integrate it.
`.trim()

const SESSION_SECONDS_TO_COMPLETE = 25
const FAST_SCROLL_PX_PER_TICK = 260

function buildResourceLinks(title) {
  const q = encodeURIComponent(title)
  return [
    { name: 'YouTube', url: `https://www.youtube.com/results?search_query=${q}` },
    { name: 'Udemy', url: `https://www.udemy.com/courses/search/?q=${q}` },
    { name: 'Coursera', url: `https://www.coursera.org/search?query=${q}` },
    { name: 'freeCodeCamp', url: `https://www.freecodecamp.org/news/search/?query=${q}` },
    { name: 'Google', url: `https://www.google.com/search?q=${q}` },
  ]
}

function StudySession({ milestone, onComplete, onPickProvider }) {
  const [progress, setProgress] = useState(0)
  const [warning, setWarning] = useState(null)
  const [paused, setPaused] = useState(false)
  const scrollRef = useRef(null)
  const lastScrollTop = useRef(0)
  const flaggedRecently = useRef(false)
  const [externalActivity, setExternalActivity] = useState(null)
  const [extensionChecked, setExtensionChecked] = useState(false)

  useEffect(() => {
    function handleVisibility() {
      setPaused(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    let cancelled = false
    isExtensionPresent().then((present) => {
      if (cancelled) return
      setExtensionChecked(true)
      if (!present) return
      requestTodayExternalActivity().then((activity) => {
        if (!cancelled) setExternalActivity(activity)
      })
    })
    return () => { cancelled = true }
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

  const resourceLinks = buildResourceLinks(milestone.title)

  return (
    <div className="study-session">
      <div className="study-session-head">
        <span className="eyebrow">Experience · {milestone.title}</span>
        <a href={milestone.url} target="_blank" rel="noreferrer" className="muted-link">
          Open on {milestone.provider} ↗
        </a>
      </div>

      <div className="study-resource-links">
        <span className="task-meta" style={{ marginRight: 8 }}>
          Pick where you're following this course:
        </span>
        {resourceLinks.map(function (r) {
          const isTracked = milestone.provider === r.name
          return (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="task-tag"
              onClick={() => onPickProvider(r)}
              title={isTracked ? `Currently tracking this milestone via ${r.name}` : `Track this milestone via ${r.name}`}
              style={{
                marginRight: 8,
                textDecoration: 'none',
                borderColor: isTracked ? 'var(--gold)' : undefined,
                color: isTracked ? 'var(--gold)' : undefined,
              }}
            >
              {isTracked ? '● ' : ''}{r.name} ↗
            </a>
          )
        })}
      </div>
      <p className="task-meta" style={{ marginTop: 4 }}>
        Any one of these works — study through whichever platform suits you, then come
        back here and keep reading below (or track real progress on that site with the
        browser extension) to unlock your reflection check-in.
      </p>

      <p className="study-note">
        {externalActivity ? (
          <>
            📡 Cross-site tracking active — the AETHER browser extension reports{' '}
            <strong>{Math.round(externalActivity.totalSeconds / 60)} min</strong> of real
            reading today on {Object.keys(externalActivity.byDomain).join(', ')}.
          </>
        ) : extensionChecked ? (
          <>
            Live scroll tracking on {milestone.provider}'s own pages needs a browser
            extension — a webpage can't observe another site's scroll/focus events on
            its own. Install the AETHER extension (see <code>/browser-extension</code>)
            for real cross-site tracking, or use this panel: read at a normal pace and
            your progress fills in; scroll fast and it resets.
          </>
        ) : (
          <>
            Checking for the AETHER browser extension… In the meantime, this panel
            tracks reading vs. scrolling locally: read at a normal pace and your
            progress fills in; scroll fast and it resets.
          </>
        )}
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

const DAY_MS = 24 * 60 * 60 * 1000

function dueBadge(dueDate, status) {
  if (!dueDate || status === 'completed') return null
  const due = new Date(dueDate).getTime()
  if (Number.isNaN(due)) return null
  const daysLeft = Math.ceil((due - Date.now()) / DAY_MS)
  const label = new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (daysLeft < 0) return { text: `Overdue · was due ${label}`, cls: 'due-overdue' }
  if (daysLeft <= 3) return { text: `Due soon · ${label}`, cls: 'due-soon' }
  return { text: `Due ${label}`, cls: 'due-later' }
}

const EMPTY_FORM = { title: '', provider: '', url: '', estHours: '', dueDate: '' }

export default function Roadmap() {
  const { state, logEngagement, updateMilestone, addMilestone, deleteMilestone, reorderRoadmap } = useApp()
  const navigate = useNavigate()
  const [sessionMilestone, setSessionMilestone] = useState(null)
  const [readyForAssessment, setReadyForAssessment] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingNotesId, setEditingNotesId] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const { roadmap } = state

  const filtered = roadmap
    .map((m, i) => ({ ...m, _idx: i }))
    .filter((m) => statusFilter === 'all' || m.status === statusFilter)
    .filter((m) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return m.title.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
    })

  // Reordering only makes sense against the full, unfiltered order — with a
  // search or status filter active, adjacent cards on screen aren't
  // necessarily adjacent in the real roadmap, so we disable it rather than
  // silently do something confusing.
  const reorderEnabled = statusFilter === 'all' && query.trim() === ''

  const completedCount = roadmap.filter((m) => m.status === 'completed').length
  const activeCount = roadmap.filter((m) => m.status === 'active').length
  const lockedCount = roadmap.filter((m) => m.status === 'locked').length
  const totalHours = roadmap.reduce((sum, m) => sum + (m.estHours || 0), 0)
  const totalMinutes = roadmap.reduce((sum, m) => sum + (m.engagedMinutes || 0), 0)
  const scored = roadmap.filter((m) => m.quizScore !== null)
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, m) => sum + m.quizScore, 0) / scored.length)
    : null

  function startSession(m) {
    setSessionMilestone(m)
    setReadyForAssessment(null)
  }

  function handlePickProvider(r) {
    if (!sessionMilestone) return
    updateMilestone(sessionMilestone.milestoneId, { provider: r.name, url: r.url })
    setSessionMilestone((prev) => (prev ? { ...prev, provider: r.name, url: r.url } : prev))
  }

  function handleSessionComplete() {
    if (!sessionMilestone) return
    logEngagement(sessionMilestone.milestoneId, 20)
    setReadyForAssessment(sessionMilestone.milestoneId)
  }

  function handleAddMilestone(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    addMilestone(form)
    setForm(EMPTY_FORM)
    setShowAddForm(false)
  }

  function handleDelete(m) {
    if (window.confirm(`Delete "${m.title}"? This can't be undone.`)) {
      deleteMilestone(m.milestoneId)
    }
  }

  function openNotes(m) {
    setEditingNotesId(m.milestoneId)
    setNotesDraft(m.notes || '')
  }

  function saveNotes(milestoneId) {
    updateMilestone(milestoneId, { notes: notesDraft })
    setEditingNotesId(null)
  }

  function moveUp(idx) {
    if (idx <= 0) return
    reorderRoadmap(roadmap[idx].milestoneId, roadmap[idx - 1].milestoneId)
  }

  function moveDown(idx) {
    if (idx >= roadmap.length - 1) return
    reorderRoadmap(roadmap[idx + 1].milestoneId, roadmap[idx].milestoneId)
  }

  function handleDrop(targetId) {
    if (dragId && dragId !== targetId) reorderRoadmap(dragId, targetId)
    setDragId(null)
    setDragOverId(null)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Curated Journey</span>
          <h1>Milestones for {state.goal?.domain}</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowAddForm((s) => !s)}>
          {showAddForm ? 'Cancel' : '+ Add milestone'}
        </button>
      </div>

      <div className="panel progress-overview" style={{ marginBottom: 20 }}>
        <div className="progress-stats">
          <div className="progress-stat">
            <span className="progress-stat-value">{completedCount}<span className="progress-stat-of"> / {roadmap.length}</span></span>
            <span className="task-meta">Completed</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{activeCount}</span>
            <span className="task-meta">Active</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{lockedCount}</span>
            <span className="task-meta">Locked</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{totalHours}h</span>
            <span className="task-meta">Planned</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{totalMinutes}m</span>
            <span className="task-meta">Engaged</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{avgScore !== null ? `${avgScore}%` : '—'}</span>
            <span className="task-meta">Avg score</span>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="panel milestone-form-panel" style={{ marginBottom: 20 }}>
          <form className="milestone-form" onSubmit={handleAddMilestone}>
            <div className="milestone-form-row">
              <label>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Build a REST API"
                  required
                />
              </label>
              <label>
                Provider
                <input
                  type="text"
                  value={form.provider}
                  onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                  placeholder="e.g. Self-directed"
                />
              </label>
            </div>
            <div className="milestone-form-row">
              <label>
                Link (optional)
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
              <label>
                Due date (optional)
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </label>
            </div>
            <div className="milestone-form-hours">
              <label>
                Estimated hours
                <input
                  type="number"
                  min="1"
                  value={form.estHours}
                  onChange={(e) => setForm((f) => ({ ...f, estHours: e.target.value }))}
                  placeholder="1"
                />
              </label>
            </div>
            <div className="milestone-form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM) }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add milestone</button>
            </div>
          </form>
        </div>
      )}

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
      {!reorderEnabled && (
        <p className="task-meta" style={{ marginBottom: 12 }}>
          Reordering is disabled while a search or filter is active — clear it to drag or reorder milestones.
        </p>
      )}

      <div className="roadmap-list">
        {filtered.length === 0 && (
          <p className="empty-state" style={{ padding: '20px 24px' }}>
            No milestones match "{query}"{statusFilter !== 'all' ? ` in ${statusFilter}` : ''}.
          </p>
        )}

        {filtered.map((m) => {
          const badge = dueBadge(m.dueDate, m.status)
          return (
            <div key={m.milestoneId} style={{ width: '100%' }}>
              <div
                className={`roadmap-card status-${m.status}${dragId === m.milestoneId ? ' dragging' : ''}${dragOverId === m.milestoneId ? ' drag-over' : ''}`}
                onDragOver={(e) => {
                  if (!reorderEnabled) return
                  e.preventDefault()
                  setDragOverId(m.milestoneId)
                }}
                onDragLeave={() => setDragOverId((id) => (id === m.milestoneId ? null : id))}
                onDrop={(e) => {
                  if (!reorderEnabled) return
                  e.preventDefault()
                  handleDrop(m.milestoneId)
                }}
              >
                {reorderEnabled && (
                  <span
                    className="drag-handle"
                    draggable
                    onDragStart={() => setDragId(m.milestoneId)}
                    onDragEnd={() => { setDragId(null); setDragOverId(null) }}
                    title="Drag to reorder"
                  >
                    ⠿
                  </span>
                )}
                <div className="roadmap-index">{String(m._idx + 1).padStart(2, '0')}</div>
                <div className="roadmap-body">
                  <h3>{m.title}</h3>
                  <span className="task-meta">{m.provider} · ~{m.estHours}h · {m.status}</span>
                  {m.quizScore !== null && (
                    <span className="task-meta"> · last assessment: {m.quizScore}%</span>
                  )}
                  {badge && <span className={`due-badge ${badge.cls}`}>{badge.text}</span>}

                  {editingNotesId === m.milestoneId ? (
                    <div className="notes-editor">
                      <textarea
                        rows={3}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Notes for yourself about this milestone…"
                        style={{ width: '100%' }}
                      />
                      <div className="milestone-form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setEditingNotesId(null)}>
                          Cancel
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => saveNotes(m.milestoneId)}>
                          Save note
                        </button>
                      </div>
                    </div>
                  ) : (
                    m.notes && <p className="notes-preview">{m.notes}</p>
                  )}
                </div>
                <div className="roadmap-actions">
                  {reorderEnabled && (
                    <div className="reorder-controls">
                      <button
                        className="btn btn-ghost icon-btn-tiny"
                        onClick={() => moveUp(m._idx)}
                        disabled={m._idx === 0}
                        title="Move up"
                        aria-label="Move milestone up"
                      >
                        ▲
                      </button>
                      <button
                        className="btn btn-ghost icon-btn-tiny"
                        onClick={() => moveDown(m._idx)}
                        disabled={m._idx === roadmap.length - 1}
                        title="Move down"
                        aria-label="Move milestone down"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                  {m.status === 'active' && (
                    <button className="btn btn-ghost" onClick={() => startSession(m)}>
                      Deep Dive →
                    </button>
                  )}
                  {m.status === 'completed' && <span className="task-tag">done</span>}
                  {m.status === 'locked' && <span className="task-tag">locked</span>}
                  <button
                    className="icon-btn"
                    onClick={() => (editingNotesId === m.milestoneId ? setEditingNotesId(null) : openNotes(m))}
                    title={m.notes ? 'Edit note' : 'Add note'}
                    aria-label="Edit note"
                  >
                    ✎
                  </button>
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={() => handleDelete(m)}
                    title="Delete milestone"
                    aria-label="Delete milestone"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {sessionMilestone?.milestoneId === m.milestoneId && (
                <div style={{ padding: '16px' }}>
                  <StudySession milestone={sessionMilestone} onComplete={handleSessionComplete} onPickProvider={handlePickProvider} />
                  {readyForAssessment === sessionMilestone.milestoneId && (
                    <div className="panel" style={{ textAlign: 'center', marginTop: 16 }}>
                      <p style={{ marginBottom: 14 }}>
                        Nice work — you've earned the reflection check-in for this milestone.
                      </p>
                      <button className="btn btn-primary" onClick={() => navigate('/dashboard/assessment')}>
                        Go to Reflection →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
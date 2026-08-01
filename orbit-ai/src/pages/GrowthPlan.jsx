import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { runAETHERCycle, getAETHERProfile, submitAETHERFeedback } from '../lib/aetherApi.js'

const PRIORITY_TONE = { high: 'tone-remedial', medium: 'tone-nudge', low: '' }

function GapCard({ gap, curated }) {
  const match = curated?.find((c) => c.gapSkill === gap.skill)
  return (
    <li className={`notif-row ${PRIORITY_TONE[gap.priority] || ''}`}>
      <div style={{ flex: '1 1 320px' }}>
        <strong>{gap.skill}</strong>
        <span className="task-meta" style={{ display: 'block', marginTop: 2 }}>
          priority: {gap.priority}
        </span>
        <p>{gap.why}</p>
        {match && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <p style={{ color: 'var(--text)' }}>
              <strong>{match.resource?.title}</strong>
              {match.resource?.provider ? ` — ${match.resource.provider}` : ''}
              {match.resource?.type ? ` (${match.resource.type})` : ''}
            </p>
            <p className="task-meta">Why this: {match.reason}</p>
            {match.resource?.url && (
              <a className="muted-link" href={match.resource.url} target="_blank" rel="noreferrer">
                Open resource →
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export default function GrowthPlan() {
  const { auth, state } = useApp()
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [reflection, setReflection] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState(null)

  const authed = auth?.status === 'authed'

  useEffect(() => {
    getAETHERProfile()
      .then((body) => setData(body))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleRunCycle() {
    setRunning(true)
    setError(null)
    try {
      const result = await runAETHERCycle({
        goal: state.goal,
        roadmap: state.roadmap,
        activityLog: state.activityLog,
        timeSpentLog: state.timeSpentLog,
      })
      setData({ ...result, hasRunBefore: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  async function handleSubmitFeedback(e) {
    e.preventDefault()
    if (!reflection.trim()) return
    try {
      await submitAETHERFeedback(reflection.trim())
      setFeedbackStatus('Saved — this feeds the Identity Agent on your next cycle.')
      setReflection('')
    } catch (err) {
      setFeedbackStatus(`Could not save: ${err.message}`)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">AETHER · Identity-Driven Recommendation</span>
        <h1>Growth Plan</h1>
      </div>

      {!authed && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <p className="task-meta">
            You're using AETHER as a guest — the full pipeline runs and your Identity and
            Habit Profiles are saved to this device.{' '}
            <a className="muted-link" href="/register">Create an account</a> if you'd like
            them to follow you across devices instead.
          </p>
        </div>
      )}

      <div className="panel" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p className="task-meta" style={{ maxWidth: 560 }}>
          Runs the full pipeline — Identity → Habit Intelligence → Gap Analysis → Curator →
          Growth Coach — against your current goal and activity, and closes the loop with
          whatever you reflect below.
        </p>
        <button className="btn btn-primary" onClick={handleRunCycle} disabled={running}>
          {running ? 'Running agents…' : data?.hasRunBefore || data?.growthPlan ? 'Re-run cycle' : 'Run my first cycle'}
        </button>
      </div>

      {error && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <p style={{ color: '#F0A98A' }}>{error}</p>
        </div>
      )}

      {loading && <p className="task-meta">Loading…</p>}

      {!loading && data && !data.identityProfile && !running && (
        <p className="empty-state">No growth plan yet — run your first cycle above.</p>
      )}

      {data?.identityProfile && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 10 }}>Identity Profile</h3>
          <p style={{ marginBottom: 8 }}>{data.identityProfile.currentIdentitySummary}</p>
          <p className="task-meta" style={{ marginBottom: 8 }}>
            Aiming for: {data.identityProfile.desiredIdentitySummary}
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span className="task-meta">Strengths</span>
              <ul>
                {(data.identityProfile.strengths || []).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="task-meta">Weaknesses</span>
              <ul>
                {(data.identityProfile.weaknesses || []).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {data?.habitProfile && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 10 }}>Habit Profile</h3>
          <p style={{ marginBottom: 8 }}>{data.habitProfile.behaviorSummary}</p>
          <p className="task-meta">
            Drop-off risk: {data.habitProfile.riskOfDropOff} — {data.habitProfile.riskReason}
          </p>
        </div>
      )}

      {Boolean(data?.gaps?.length) && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 10 }}>Gap Analysis &amp; Curated Resources</h3>
          <ul className="notif-list">
            {data.gaps.map((g) => (
              <GapCard key={g.skill} gap={g} curated={data.curated} />
            ))}
          </ul>
        </div>
      )}

      {data?.growthPlan && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 10 }}>This Week's Plan</h3>
          <p className="task-meta" style={{ marginBottom: 12 }}>{data.growthPlan.paceNote}</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px' }}>
              <span className="task-meta">Daily tasks</span>
              <ul>
                {(data.growthPlan.dailyTasks || []).map((t, i) => (
                  <li key={i}>
                    <strong>{t.day}:</strong> {t.task} ({t.estimatedMinutes}m)
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: '1 1 260px' }}>
              <span className="task-meta">Weekly milestones</span>
              <ul>
                {(data.growthPlan.weeklyMilestones || []).map((m, i) => (
                  <li key={i}>
                    <strong>{m.title}</strong> — {m.successCriteria}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {Boolean(data?.growthPlan?.reflectionPrompts?.length) && (
        <div className="panel">
          <h3 style={{ marginBottom: 10 }}>Reflect (feeds back into your Identity Profile)</h3>
          <ul style={{ marginBottom: 12 }}>
            {data.growthPlan.reflectionPrompts.map((p, i) => (
              <li key={i} className="task-meta">{p}</li>
            ))}
          </ul>
          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you notice this week?"
              rows={3}
              style={{
                flex: '1 1 320px',
                background: 'var(--bg-panel-2)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: 10,
              }}
            />
            <button className="btn btn-ghost" type="submit">Save reflection</button>
          </form>
          {feedbackStatus && <p className="task-meta" style={{ marginTop: 8 }}>{feedbackStatus}</p>}
        </div>
      )}
    </div>
  )
}
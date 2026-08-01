import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { runAETHERCycle, getAETHERProfile, submitAETHERFeedback } from '../lib/aetherApi.js'
import { Fingerprint, Brain, Target, BookOpen, Compass, AlertCircle, Info, RefreshCw, CheckCircle2, User, Activity } from 'lucide-react'

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

const PipelineDiagram = () => (
  <div className="pipeline-diagram">
    <div className="pipeline-step"><Fingerprint size={24} /><span>Identity</span></div>
    <div className="pipeline-line" />
    <div className="pipeline-step"><Brain size={24} /><span>Habits</span></div>
    <div className="pipeline-line" />
    <div className="pipeline-step"><Target size={24} /><span>Gaps</span></div>
    <div className="pipeline-line" />
    <div className="pipeline-step"><BookOpen size={24} /><span>Curator</span></div>
    <div className="pipeline-line" />
    <div className="pipeline-step"><Compass size={24} /><span>Coach</span></div>
  </div>
)

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
        journalEntries: state.journalEntries,
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
        <span className="eyebrow">AETHER · Autonomous Growth System</span>
        <h1>Growth Plan</h1>
      </div>

      {!authed && (
        <div className="alert-banner">
          <Info className="icon" size={20} />
          <div>
            You're using AETHER as a guest. The pipeline runs locally and saves to this device.{' '}
            <a className="muted-link" href="/register" style={{textDecoration:'underline'}}>Create an account</a> to sync across devices.
          </div>
        </div>
      )}

      <div className="growth-action-panel">
        <h2>Initiate Pipeline</h2>
        <p className="task-meta" style={{ maxWidth: 480, margin: '0 auto 24px' }}>
          Execute the autonomous growth cycle against your current goals and activity.
        </p>
        
        <PipelineDiagram />

        <button 
          className="btn btn-primary" 
          onClick={handleRunCycle} 
          disabled={running}
          style={{ padding: '16px 32px', fontSize: '16px' }}
        >
          {running ? (
            <>
              <span className="spinner" style={{ marginRight: 8, verticalAlign: 'middle', width: 16, height: 16 }} />
              Running pipeline...
            </>
          ) : (
            data?.hasRunBefore || data?.growthPlan ? 'Re-run cycle' : 'Run my first cycle'
          )}
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <div className="alert-error-title"><AlertCircle size={20} /> Pipeline Error</div>
          <p className="alert-error-msg">Something went wrong generating your growth plan.</p>
          <p className="task-meta" style={{ marginBottom: 16 }}>{error}</p>
          <button className="btn btn-ghost" onClick={handleRunCycle}>
            <RefreshCw size={16} style={{marginRight: 6}} /> Try again
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span className="spinner" style={{ borderColor: 'var(--muted)', borderTopColor: 'var(--gold)' }} />
          <p className="task-meta" style={{ marginTop: 12 }}>Loading profile...</p>
        </div>
      )}

      {!loading && data && !data.identityProfile && !running && !error && (
        <p className="empty-state">No growth plan yet — run your first cycle above.</p>
      )}

      {(data?.identityProfile || data?.habitProfile) && (
        <div className="growth-grid">
          {data?.identityProfile && (
            <div className="growth-card">
              <div className="growth-card-header"><User className="icon" size={20} /> Identity Profile</div>
              <p style={{ marginBottom: 8, fontSize: 15 }}>{data.identityProfile.currentIdentitySummary}</p>
              <p className="task-meta" style={{ marginBottom: 16 }}>
                Aiming for: {data.identityProfile.desiredIdentitySummary}
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: 1, alignContent: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <span className="task-meta" style={{fontWeight: 600}}>Strengths</span>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 16, color: 'var(--text)', fontSize: 14 }}>
                    {(data.identityProfile.strengths || []).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <span className="task-meta" style={{fontWeight: 600}}>Weaknesses</span>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 16, color: 'var(--text)', fontSize: 14 }}>
                    {(data.identityProfile.weaknesses || []).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {data?.habitProfile && (
            <div className="growth-card">
              <div className="growth-card-header"><Activity className="icon" size={20} /> Habit Profile</div>
              <p style={{ marginBottom: 12, fontSize: 15, flex: 1 }}>{data.habitProfile.behaviorSummary}</p>
              <div style={{ background: 'var(--bg-panel-2)', padding: 12, borderRadius: 8 }}>
                <span className="task-meta" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Drop-off Risk: {data.habitProfile.riskOfDropOff}</span>
                <p className="task-meta" style={{ margin: 0 }}>{data.habitProfile.riskReason}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {Boolean(data?.gaps?.length) && (
        <div className="panel" style={{ marginBottom: 24, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Target size={24} color="var(--gold)" />
            <h3 style={{ margin: 0 }}>Gap Analysis & Curated Resources</h3>
          </div>
          <ul className="notif-list">
            {data.gaps.map((g) => (
              <GapCard key={g.skill} gap={g} curated={data.curated} />
            ))}
          </ul>
        </div>
      )}

      {data?.growthPlan && (
        <div className="panel" style={{ marginBottom: 24, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Compass size={24} color="var(--gold)" />
            <h3 style={{ margin: 0 }}>This Week's Plan</h3>
          </div>
          <p className="task-meta" style={{ marginBottom: 24 }}>{data.growthPlan.paceNote}</p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <span className="task-meta" style={{ fontWeight: 600, display: 'block', marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>Daily tasks</span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(data.growthPlan.dailyTasks || []).map((t, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} style={{ marginTop: 2, color: 'var(--muted)' }} />
                    <div style={{ flex: 1 }}>
                      <strong>{t.day}</strong> <span style={{ opacity: 0.6 }}>({t.estimatedMinutes}m)</span>
                      <p style={{ margin: '4px 0 0', fontSize: 14 }}>{t.task}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <span className="task-meta" style={{ fontWeight: 600, display: 'block', marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>Weekly milestones</span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(data.growthPlan.weeklyMilestones || []).map((m, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} style={{ marginTop: 2, color: 'var(--muted)' }} />
                    <div style={{ flex: 1 }}>
                      <strong>{m.title}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 14 }}>{m.successCriteria}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {Boolean(data?.growthPlan?.reflectionPrompts?.length) && (
        <div className="panel" style={{ padding: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Reflect & Calibrate</h3>
          <p className="task-meta" style={{ marginBottom: 16 }}>Your reflections feed directly back into your Identity Profile for the next cycle.</p>
          <ul style={{ marginBottom: 20, paddingLeft: 20 }}>
            {data.growthPlan.reflectionPrompts.map((p, i) => (
              <li key={i} className="task-meta" style={{ marginBottom: 8 }}>{p}</li>
            ))}
          </ul>
          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you notice this week? What was difficult? What came easily?"
              rows={3}
              style={{
                flex: '1 1 320px',
                background: 'var(--bg-panel-2)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: 16,
                fontSize: 15
              }}
            />
            <button className="btn btn-primary" type="submit" disabled={!reflection.trim()}>Save Reflection</button>
          </form>
          {feedbackStatus && <p className="task-meta" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14} color="var(--gold)" /> {feedbackStatus}</p>}
        </div>
      )}
    </div>
  )
}
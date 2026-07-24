import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext.jsx'

export default function Dashboard() {
  const { state } = useApp()
  const { roadmap, streak, timeSpentLog } = state

  const completed = roadmap.filter((m) => m.status === 'completed').length
  const pct = roadmap.length ? Math.round((completed / roadmap.length) * 100) : 0
  const upcoming = roadmap.filter((m) => m.status !== 'completed').slice(0, 3)
  const totalPlanned = timeSpentLog.reduce((a, t) => a + t.plannedMin, 0)
  const totalActual = timeSpentLog.reduce((a, t) => a + t.actualMin, 0)

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Overview</span>
        <h1>Your progress at a glance</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Overall completion</span>
          <span className="stat-value">{pct}%</span>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Current streak</span>
          <span className="stat-value">{streak} <small>milestones</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Time spent vs planned</span>
          <span className="stat-value">
            {totalActual}<small>/{totalPlanned || '—'} min</small>
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Upcoming tasks</h2>
          <Link className="muted-link" to="/dashboard/roadmap">View full roadmap →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="empty-state">Nothing queued — you've cleared your roadmap.</p>
        ) : (
          <ul className="task-list">
            {upcoming.map((m) => (
              <li key={m.milestoneId} className={`task-row status-${m.status}`}>
                <span className="task-status" />
                <div>
                  <strong>{m.title}</strong>
                  <span className="task-meta">{m.provider} · ~{m.estHours}h</span>
                </div>
                <span className="task-tag">{m.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Time spent vs planned</h2>
          <Link className="muted-link" to="/dashboard/analytics">Full analytics →</Link>
        </div>
        {timeSpentLog.length === 0 ? (
          <p className="empty-state">
            No sessions logged yet — spend time on a roadmap course to see this fill in.
          </p>
        ) : (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={timeSpentLog}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,237,0.08)" />
                <XAxis dataKey="day" stroke="#9A9CAA" fontSize={12} />
                <YAxis stroke="#9A9CAA" fontSize={12} />
                <Tooltip contentStyle={{ background: '#171A24', border: '1px solid rgba(245,243,237,0.09)' }} />
                <Bar dataKey="plannedMin" name="Planned (min)" fill="rgba(245,243,237,0.18)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualMin" name="Actual (min)" fill="#E8B355" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

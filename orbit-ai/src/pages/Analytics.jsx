import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { useApp } from '../context/AppContext.jsx'

export default function Analytics() {
  const { state } = useApp()
  const { roadmap, timeSpentLog } = state

  const completionTrend = roadmap.map((m, i) => ({
    name: `M${i + 1}`,
    score: m.quizScore ?? 0,
  }))

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Analytics</span>
        <h1>How your learning is trending</h1>
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 16 }}>Assessment scores by milestone</h2>
        {roadmap.every((m) => m.quizScore === null) ? (
          <p className="empty-state">No assessments taken yet.</p>
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,237,0.08)" />
                <XAxis dataKey="name" stroke="#9A9CAA" fontSize={12} />
                <YAxis stroke="#9A9CAA" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#171A24', border: '1px solid rgba(245,243,237,0.09)' }} />
                <Line type="monotone" dataKey="score" stroke="#E8B355" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 16 }}>Time spent vs planned</h2>
        {timeSpentLog.length === 0 ? (
          <p className="empty-state">No sessions logged yet.</p>
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={timeSpentLog}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,237,0.08)" />
                <XAxis dataKey="day" stroke="#9A9CAA" fontSize={12} />
                <YAxis stroke="#9A9CAA" fontSize={12} />
                <Tooltip contentStyle={{ background: '#171A24', border: '1px solid rgba(245,243,237,0.09)' }} />
                <Legend />
                <Bar dataKey="plannedMin" name="Planned (min)" fill="rgba(245,243,237,0.18)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualMin" name="Actual (min)" fill="#E8B355" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 12 }}>Milestone breakdown</h2>
        <ul className="task-list">
          {roadmap.map((m) => (
            <li key={m.milestoneId} className={`task-row status-${m.status}`}>
              <span className="task-status" />
              <div>
                <strong>{m.title}</strong>
                <span className="task-meta">
                  {m.engagedMinutes} min engaged
                  {m.quizScore !== null ? ` · scored ${m.quizScore}%` : ''}
                </span>
              </div>
              <span className="task-tag">{m.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

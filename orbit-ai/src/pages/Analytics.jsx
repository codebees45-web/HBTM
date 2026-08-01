import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { BADGES } from '../data/mockData.js'
import { exportProgressReport } from '../lib/exportReport.js'

function ProgressRing({ pct, size = 110, stroke = 10, color = 'var(--gold)' }) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct / 100)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(245,243,237,0.15)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default function Analytics() {
  const { state } = useApp()
  const { roadmap, timeSpentLog, streak } = state

  const completionTrend = roadmap.map((m, i) => ({
    name: `M${i + 1}`,
    score: m.quizScore ?? 0,
  }))

  const completedCount = roadmap.filter((m) => m.status === 'completed').length
  const completionPct = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0

  const totalActualMin = timeSpentLog.reduce((sum, t) => sum + (t.actualMin || 0), 0)
  const scoredQuizzes = roadmap.filter((m) => m.quizScore !== null)
  const avgScore = scoredQuizzes.length
    ? Math.round(scoredQuizzes.reduce((sum, m) => sum + m.quizScore, 0) / scoredQuizzes.length)
    : 0

  const statItems = [
    { label: 'STREAK', icon: '🔥', value: streak },
    { label: 'AVG SCORE', icon: '📊', value: `${avgScore}%` },
    { label: 'TIME LOGGED', icon: '⏱️', value: `${totalActualMin}m` },
  ]

  const earnedBadgeIds = new Set(BADGES.filter((b) => b.isEarned(state)).map((b) => b.id))

  const radarData = [
    { subject: 'Discipline', score: Math.min(100, streak * 10) || 10, fullMark: 100 },
    { subject: 'Execution', score: Math.min(100, completedCount * 15) || 10, fullMark: 100 },
    { subject: 'Mastery', score: avgScore || 10, fullMark: 100 },
    { subject: 'Consistency', score: Math.min(100, timeSpentLog.length * 10) || 10, fullMark: 100 },
    { subject: 'Vision', score: 80, fullMark: 100 },
    { subject: 'Mindset', score: 75, fullMark: 100 },
  ];

  const { t } = useApp()
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>How your learning is trending</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => exportProgressReport(state)}>
          Export report (PDF)
        </button>
      </div>

      {/* HERO BANNER — one cohesive gradient panel, no boxed cards */}
      <div
        className="panel"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-panel-2) 100%)',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          flexWrap: 'wrap',
          padding: '28px 32px',
        }}
      >
        <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <ProgressRing pct={completionPct} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <strong style={{ fontSize: 24 }}>{completionPct}%</strong>
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <span className="task-meta">MILESTONES</span>
          <h2 style={{ margin: '2px 0 0' }}>{completedCount} / {roadmap.length}</h2>
        </div>

        <div style={{ display: 'flex', gap: 0, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {statItems.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '0 28px',
                borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
              }}
            >
              <span style={{ fontSize: 30 }}>{s.icon}</span>
              <div>
                <strong style={{ fontSize: 22, display: 'block', lineHeight: 1.1 }}>{s.value}</strong>
                <span className="task-meta">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IDENTITY RADAR */}
      <div className="panel bento-card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 16 }}>Identity Radar</h2>
        <p className="task-meta" style={{ marginBottom: 24 }}>A multi-dimensional view of your core attributes.</p>
        <div style={{ width: '100%', height: 320, display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 13, fontFamily: 'Satoshi' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="You" dataKey="score" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--gold)', borderRadius: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MILESTONE PROGRESS BARS */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 16 }}>Milestone progress</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {roadmap.map((m) => {
            const targetMin = m.estHours ? m.estHours * 60 : 60
            const pct = m.status === 'completed' ? 100 : Math.min(100, Math.round((m.engagedMinutes / targetMin) * 100))
            return (
              <div key={m.milestoneId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14 }}>
                    {m.status === 'locked' && '🔒 '}
                    {m.status === 'completed' && '✅ '}
                    {m.title}
                  </strong>
                  <span className="task-meta">
                    {m.quizScore !== null ? `${m.quizScore}% scored · ` : ''}{pct}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(245,243,237,0.1)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 999,
                      background: m.status === 'locked' ? 'rgba(245,243,237,0.25)' : 'var(--gold)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* BADGE CASE */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Badge case</h2>
        <p className="task-meta" style={{ marginBottom: 16 }}>{earnedBadgeIds.size} of {BADGES.length} unlocked</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {BADGES.map((b) => {
            const earned = earnedBadgeIds.has(b.id)
            return (
              <div
                key={b.id}
                style={{
                  padding: '16px 12px', borderRadius: 10, textAlign: 'center',
                  background: earned ? 'var(--gold-dim)' : 'rgba(245,243,237,0.04)',
                  border: `1px solid ${earned ? 'var(--gold)' : 'var(--line)'}`,
                  opacity: earned ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{earned ? b.icon : '🔒'}</div>
                <strong style={{ fontSize: 13, display: 'block' }}>{b.label}</strong>
                <span className="task-meta" style={{ fontSize: 11 }}>{b.desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ASSESSMENT RESULTS — bar chart, red below passing threshold */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 16 }}>Assessment results</h2>
        {roadmap.every((m) => m.quizScore === null) ? (
          <p className="empty-state">No assessments taken yet.</p>
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,243,237,0.08)" />
                <XAxis dataKey="name" stroke="#9A9CAA" fontSize={12} />
                <YAxis stroke="#9A9CAA" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#171A24', border: '1px solid rgba(245,243,237,0.09)' }} />
                <Bar dataKey="score" name="Score (%)" radius={[4, 4, 0, 0]}>
                  {completionTrend.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 60 ? '#E8B355' : 'rgba(224,128,128,0.7)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* TIME SPENT VS PLANNED */}
      <div className="panel">
        <h2 style={{ marginBottom: 16 }}>Time spent vs planned</h2>
        {timeSpentLog.length === 0 ? (
          <p className="empty-state">No sessions logged yet.</p>
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={timeSpentLog}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', color: 'var(--text)' }}
                  labelStyle={{ color: 'var(--text)' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Legend wrapperStyle={{ color: 'var(--muted)' }} />
                <Bar dataKey="plannedMin" name="Planned (min)" fill="var(--line)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualMin" name="Actual (min)" fill="var(--gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
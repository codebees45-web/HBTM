import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { BADGES } from '../data/mockData.js'
import { exportProgressReport } from '../lib/exportReport.js'
import { Download, Flame, BarChart2, Clock, Lock, CheckCircle2, Shield } from 'lucide-react'

function ProgressRing({ pct, size = 110, stroke = 10, color = 'var(--gold)' }) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct / 100)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
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
    { label: 'STREAK', icon: <Flame size={28} color="var(--gold)" />, value: streak },
    { label: 'AVG SCORE', icon: <BarChart2 size={28} color="var(--gold)" />, value: `${avgScore}%` },
    { label: 'TIME LOGGED', icon: <Clock size={28} color="var(--gold)" />, value: `${totalActualMin}m` },
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

  return (
    <div className="page">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>How your learning is trending</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => exportProgressReport(state)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', color: 'var(--muted)' }}>
          <Download size={16} /> Export report (PDF)
        </button>
      </div>

      {/* HERO BANNER */}
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
              <span>{s.icon}</span>
              <div>
                <strong style={{ fontSize: 22, display: 'block', lineHeight: 1.1 }}>{s.value}</strong>
                <span className="task-meta">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* IDENTITY RADAR */}
        <div className="panel">
          <h2 style={{ marginBottom: 16 }}>Identity Radar</h2>
          <p className="task-meta" style={{ marginBottom: 24 }}>A multi-dimensional view of your core attributes.</p>
          <div style={{ width: '100%', height: 320, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 13, fontFamily: 'Satoshi' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="You" dataKey="score" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.2} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: '12px', color: 'var(--text)' }} itemStyle={{ color: 'var(--text)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MILESTONE PROGRESS BARS */}
        <div className="panel">
          <h2 style={{ marginBottom: 16 }}>Milestone progress</h2>
          <p className="task-meta" style={{ marginBottom: 24 }}>Your execution rate across the current roadmap.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {roadmap.map((m) => {
              const targetMin = m.estHours ? m.estHours * 60 : 60
              const pct = m.status === 'completed' ? 100 : Math.min(100, Math.round((m.engagedMinutes / targetMin) * 100))
              return (
                <div key={m.milestoneId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: m.status === 'locked' ? 'var(--muted)' : 'var(--text)' }}>
                      {m.status === 'locked' && <Lock size={14} />}
                      {m.status === 'completed' && <CheckCircle2 size={14} color="var(--gold)" />}
                      {m.title}
                    </strong>
                    <span className="task-meta">
                      {m.quizScore !== null ? `${m.quizScore}% scored · ` : ''}{pct}%
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 999,
                        background: m.status === 'locked' ? 'var(--line)' : 'var(--gold)',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* BADGE CASE */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>Badge case</h2>
        <p className="task-meta" style={{ marginBottom: 24 }}>{earnedBadgeIds.size} of {BADGES.length} unlocked</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
          {BADGES.map((b) => {
            const earned = earnedBadgeIds.has(b.id)
            return (
              <div
                key={b.id}
                style={{
                  padding: '20px 16px', borderRadius: 12, textAlign: 'center',
                  background: earned ? 'var(--gold-dim)' : 'var(--bg)',
                  border: `1px solid ${earned ? 'var(--gold)' : 'var(--line)'}`,
                  opacity: earned ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  {earned ? <Shield size={32} color="var(--gold)" /> : <Lock size={32} color="var(--muted)" />}
                </div>
                <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{b.label}</strong>
                <span className="task-meta" style={{ fontSize: 11, lineHeight: 1.4, display: 'block' }}>{b.desc}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* ASSESSMENT RESULTS */}
        <div className="panel">
          <h2 style={{ marginBottom: 16 }}>Assessment results</h2>
          {roadmap.every((m) => m.quizScore === null) ? (
            <p className="empty-state" style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No assessments taken yet.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: '12px' }} itemStyle={{ color: 'var(--text)' }} />
                  <Bar dataKey="score" name="Score (%)" radius={[4, 4, 0, 0]}>
                    {completionTrend.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 60 ? 'var(--gold)' : '#ef4444'} />
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
            <p className="empty-state" style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No sessions logged yet.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={timeSpentLog}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: '12px', color: 'var(--text)' }}
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
    </div>
  )
}
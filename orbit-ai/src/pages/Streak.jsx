import { useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext.jsx'

function buildYearGrid(year, activeDaysSet) {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  const today = new Date()
  const cappedEnd = end > today ? today : end
  if (start > cappedEnd) return []

  const days = []
  const cursor = new Date(start)
  while (cursor <= cappedEnd) {
    const key = cursor.toISOString().slice(0, 10)
    days.push({ date: new Date(cursor), key, active: activeDaysSet.has(key) })
    cursor.setDate(cursor.getDate() + 1)
  }

  const leadingEmpty = days.length ? days[0].date.getDay() : 0
  const padded = Array.from({ length: leadingEmpty }, () => null).concat(days)
  const weeks = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }
  return weeks
}

export default function Streak() {
  const { state, useStreakFreeze, dayStreak } = useApp()
  const { streak, timeSpentLog, activityLog, streakFreezes, freezeLog } = state
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayCovered = activityLog.includes(todayKey) || freezeLog.includes(todayKey)

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  // Real activity history — one entry per day the learner actually logged
  // engagement, submitted an assessment, or chatted with the mentor — plus
  // any days covered by a spent streak freeze, so the heatmap matches the
  // day streak it's protecting.
  const activeDaysSet = useMemo(() => new Set([...activityLog, ...freezeLog]), [activityLog, freezeLog])

  const weeks = useMemo(
    () => buildYearGrid(selectedYear, activeDaysSet),
    [selectedYear, activeDaysSet]
  )

  const trendData = useMemo(() => {
    if (timeSpentLog.length > 0) {
      return timeSpentLog.map((d) => ({ name: d.day, minutes: d.actualMin }))
    }
    return Array.from({ length: 14 }, (_, i) => {
      const key = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10)
      return { name: `D${i + 1}`, minutes: activeDaysSet.has(key) ? 20 : 0 }
    })
  }, [timeSpentLog, activeDaysSet])

  // Group weeks into month segments so the label sits directly above its own columns.
  const monthSegments = useMemo(() => {
    const segments = []
    let current = null
    weeks.forEach((week, wi) => {
      const firstDay = week.find((d) => d)
      const monthKey = firstDay ? `${firstDay.date.getFullYear()}-${firstDay.date.getMonth()}` : null
      if (monthKey && (!current || current.key !== monthKey)) {
        current = {
          key: monthKey,
          label: firstDay.date.toLocaleString('default', { month: 'short' }),
          weekIndices: [wi],
        }
        segments.push(current)
      } else if (current) {
        current.weekIndices.push(wi)
      }
    })
    return segments
  }, [weeks])

  let cellIndex = 0

  return (
    <div className="page">
      <div className="page-head streak-page-head">
        <div>
          <span className="eyebrow">Streak</span>
          <h1>Your consistency, mapped</h1>
        </div>
        <select
          className="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="panel streak-hero">
        <div className="streak-hero-number">
          <span className="streak-hero-flame" aria-hidden="true">🔥</span>
          <span className="streak-hero-count">{streak}</span>
          <span className="streak-hero-label">day streak</span>
        </div>
        <p className="study-note" style={{ marginTop: 4 }}>
          Every active day lights up below. Keep showing up to extend the chain.
        </p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Daily streak & freezes</h2>
        </div>
        <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat-card">
            <span className="stat-label">Current day streak</span>
            <span className="stat-value">{dayStreak}<small> days</small></span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Streak freezes banked</span>
            <span className="stat-value">{streakFreezes}<small> / 3</small></span>
          </div>
        </div>
        <p className="task-meta" style={{ marginTop: 12, marginBottom: 10 }}>
          {todayCovered
            ? "Today's already covered — nothing to do."
            : streakFreezes > 0
              ? "No activity logged today yet. Spend a freeze to protect your streak, or just log some study time."
              : 'No freezes banked. Pass 7 assessments in a row to earn one (up to 3 banked at once).'}
        </p>
        {!todayCovered && streakFreezes > 0 && (
          <button className="btn btn-ghost" onClick={useStreakFreeze}>
            ❄ Use a streak freeze for today
          </button>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>{selectedYear}</h2>
          <div className="heatmap-legend">
            <span>Less</span>
            <span className="legend-swatch l0" />
            <span className="legend-swatch l4" />
            <span>More</span>
          </div>
        </div>

        {weeks.length === 0 ? (
          <p className="empty-state">No activity data for {selectedYear} yet.</p>
        ) : (
          <div className="heatmap-scroll">
            <div className="heatmap-grid">
              {monthSegments.map((seg) => (
                <div className="heatmap-month-group" key={seg.key}>
                  <span className="heatmap-month-label">{seg.label}</span>
                  <div className="heatmap-month-cols">
                    {seg.weekIndices.map((wi) => (
                      <div className="heatmap-col" key={wi}>
                        {weeks[wi].map((day, di) => {
                          const idx = cellIndex++
                          return (
                            <span
                              key={di}
                              className={`heatmap-cell${day?.active ? ' active' : ''}${!day ? ' empty' : ''}`}
                              style={{ animationDelay: `${idx * 4}ms` }}
                              title={day ? day.key : ''}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Minutes engaged, recent days</h2>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="streakFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  color: 'var(--text)',
                }}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="var(--gold)"
                strokeWidth={2.5}
                fill="url(#streakFill)"
                isAnimationActive
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
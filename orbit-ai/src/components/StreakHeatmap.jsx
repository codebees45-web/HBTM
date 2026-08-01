const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

// Builds week columns (Sun→Sat rows) covering the last `weeks` calendar
// weeks, ending today. Mirrors how GitHub's contribution graph lays out.
function buildColumns(activitySet, weeks) {
  const today = startOfDay(new Date())
  const totalDays = weeks * 7
  let start = new Date(today.getTime() - (totalDays - 1) * DAY_MS)
  start = new Date(start.getTime() - start.getDay() * DAY_MS) // back up to the previous Sunday

  const days = []
  for (let d = new Date(start); d <= today; d = new Date(d.getTime() + DAY_MS)) {
    days.push({ date: new Date(d), key: dateKey(d), active: activitySet.has(dateKey(d)) })
  }

  const columns = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))
  return columns
}

// Current streak counts back from today; if today has no activity yet it
// still counts back from yesterday so the streak doesn't look "broken"
// before the learner has had a chance to study today.
function computeStreaks(activitySet) {
  const today = startOfDay(new Date())
  let cursor = activitySet.has(dateKey(today)) ? today : new Date(today.getTime() - DAY_MS)
  let current = 0
  while (activitySet.has(dateKey(cursor))) {
    current += 1
    cursor = new Date(cursor.getTime() - DAY_MS)
  }

  const sortedKeys = [...activitySet].sort()
  let longest = 0
  let run = 0
  let prevKey = null
  for (const key of sortedKeys) {
    if (prevKey) {
      const diffDays = Math.round((new Date(`${key}T00:00:00`) - new Date(`${prevKey}T00:00:00`)) / DAY_MS)
      run = diffDays === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    prevKey = key
  }

  return { current, longest: Math.max(longest, current) }
}

export default function StreakHeatmap({ activityLog = [], weeks = 18 }) {
  const activitySet = new Set(activityLog)
  const columns = buildColumns(activitySet, weeks)
  const { current, longest } = computeStreaks(activitySet)
  const todayKey = dateKey(new Date())

  // Only label a column's month when the month actually changes there,
  // so labels don't repeat every single week.
  let lastMonth = null
  const monthLabels = columns.map((col) => {
    const firstOfMonth = col.find((day) => day.date.getDate() <= 7)
    if (!firstOfMonth || firstOfMonth.date.getMonth() === lastMonth) return ''
    lastMonth = firstOfMonth.date.getMonth()
    return MONTH_LABELS[firstOfMonth.date.getMonth()]
  })

  return (
    <div className="heatmap">
      <div className="heatmap-stats">
        <div>
          <span className="stat-value">{current}<small> day{current === 1 ? '' : 's'}</small></span>
          <span className="stat-label">Current streak</span>
        </div>
        <div>
          <span className="stat-value">{longest}<small> day{longest === 1 ? '' : 's'}</small></span>
          <span className="stat-label">Longest streak</span>
        </div>
        <div>
          <span className="stat-value">{activityLog.length}<small> days</small></span>
          <span className="stat-label">Total active days</span>
        </div>
      </div>

      <div className="heatmap-scroll">
        <div className="heatmap-grid">
          <div className="heatmap-col heatmap-weekday-labels">
            <div className="heatmap-month-spacer" />
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="heatmap-weekday">{label}</span>
            ))}
          </div>
          {columns.map((col, i) => (
            <div className="heatmap-col" key={i}>
              <span className="heatmap-month">{monthLabels[i]}</span>
              {col.map((day) => (
                <span
                  key={day.key}
                  className={`heatmap-cell${day.active ? ' active' : ''}${day.key === todayKey ? ' today' : ''}`}
                  title={`${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}${day.active ? ' — studied' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {activityLog.length === 0 && (
        <p className="empty-state" style={{ marginTop: 12 }}>
          No study activity logged yet — submit an assessment, log time on a
          milestone, or chat with the mentor to start your streak.
        </p>
      )}
    </div>
  )
}
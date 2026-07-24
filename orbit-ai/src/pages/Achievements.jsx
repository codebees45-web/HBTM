import { useApp } from '../context/AppContext.jsx'
import { BADGES } from '../data/mockData.js'

export default function Achievements() {
  const { state } = useApp()
  const earnedCount = BADGES.filter((b) => b.isEarned(state)).length

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Achievements</span>
        <h1>{earnedCount} of {BADGES.length} badges earned</h1>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="stat-card">
          <span className="stat-label">Progress</span>
          <span className="stat-value">{earnedCount}<small> / {BADGES.length}</small></span>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="badge-grid">
        {BADGES.map((badge) => {
          const earned = badge.isEarned(state)
          return (
            <div key={badge.id} className={`badge-card${earned ? ' earned' : ''}`}>
              <span className="badge-icon">{badge.icon}</span>
              <strong>{badge.label}</strong>
              <p>{badge.desc}</p>
              <span className="badge-status">{earned ? 'Earned' : 'Locked'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
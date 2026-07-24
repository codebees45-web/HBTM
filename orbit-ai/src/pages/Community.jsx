import { useApp } from '../context/AppContext.jsx'
import { MOCK_PEERS } from '../data/mockData.js'

export default function Community() {
  const { state } = useApp()
  const { profile, goal, roadmap, streak } = state

  const you = {
    id: 'you',
    name: profile.name || 'You',
    domain: goal?.domain || 'full stack development',
    completed: roadmap.filter((m) => m.status === 'completed').length,
    streak,
    isYou: true,
  }

  const board = [...MOCK_PEERS, you].sort((a, b) => b.completed - a.completed || b.streak - a.streak)
  const yourRank = board.findIndex((p) => p.isYou) + 1
  const sameDomain = board.filter((p) => p.domain === you.domain)

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Community</span>
        <h1>See how you stack up</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Your rank</span>
          <span className="stat-value">#{yourRank}<small> / {board.length}</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Milestones completed</span>
          <span className="stat-value">{you.completed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In your track ({you.domain})</span>
          <span className="stat-value">{sameDomain.length}<small> learners</small></span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Leaderboard</h2>
        </div>
        <ul className="task-list">
          {board.map((p, i) => (
            <li key={p.id} className={`task-row status-${p.isYou ? 'active' : 'completed'}`}>
              <span className="task-status" />
              <div>
                <strong>{i + 1}. {p.name}{p.isYou ? ' (you)' : ''}</strong>
                <span className="task-meta">{p.domain} · streak {p.streak}</span>
              </div>
              <span className="task-tag">{p.completed} done</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="empty-state">
        Leaderboard uses sample learners for now — this becomes a live
        community feed once account sync ships.
      </p>
    </div>
  )
}
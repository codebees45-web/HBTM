import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { MOCK_PEERS } from '../data/mockData.js'

const LEADERBOARD_ENDPOINT = import.meta.env.VITE_LEADERBOARD_URL || '/api/leaderboard'
const TOKEN_KEY = 'orbit-ai-token'

function initialsOf(name) {
  return (name || '?').trim().charAt(0).toUpperCase()
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="board-rank medal">🥇</span>
  if (rank === 2) return <span className="board-rank medal">🥈</span>
  if (rank === 3) return <span className="board-rank medal">🥉</span>
  return <span className="board-rank">#{rank}</span>
}

export default function Community() {
  const { state, auth } = useApp()
  const { profile, goal, roadmap, streak } = state

  const you = {
    id: 'you',
    name: profile.name || 'You',
    domain: goal?.domain || 'full stack development',
    completed: roadmap.filter((m) => m.status === 'completed').length,
    streak,
    isYou: true,
  }

  const [board, setBoard] = useState(null) // null = not loaded yet from server
  const [loadError, setLoadError] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')

  useEffect(() => {
    if (auth.status !== 'authed') return
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    let cancelled = false
    function load() {
      fetch(LEADERBOARD_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (!res.ok) throw new Error('Could not load leaderboard')
          return res.json()
        })
        .then((data) => {
          if (!cancelled) setBoard(data.board)
        })
        .catch((err) => {
          if (!cancelled) setLoadError(err.message)
        })
    }

    load()
    // Refresh periodically so ranks update while a learner is sitting on
    // this page, without needing a full page reload.
    const interval = setInterval(load, 20000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [auth.status])

  const isLive = auth.status === 'authed' && Array.isArray(board)
  const displayBoard = isLive
    ? board
    : [...MOCK_PEERS, you].sort((a, b) => b.completed - a.completed || b.streak - a.streak)

  // Rank is computed against the full board, before any domain filtering,
  // so a learner's position doesn't shift just because they filtered the view.
  const rankedBoard = useMemo(() => displayBoard.map((p, i) => ({ ...p, rank: i + 1 })), [displayBoard])

  const domains = useMemo(
    () => Array.from(new Set(rankedBoard.map((p) => p.domain))).sort(),
    [rankedBoard]
  )

  const filteredBoard = domainFilter === 'all'
    ? rankedBoard
    : rankedBoard.filter((p) => p.domain === domainFilter)

  const yourRank = rankedBoard.find((p) => p.isYou)?.rank
  const sameDomain = rankedBoard.filter((p) => p.domain === you.domain)

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Community</span>
        <h1>See how you stack up</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Your rank</span>
          <span className="stat-value">#{yourRank || '—'}<small> / {rankedBoard.length}</small></span>
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
          <select
            className="year-select"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="all">All tracks</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {loadError && <p className="auth-error">{loadError}</p>}
        <ul className="board-list">
          {filteredBoard.map((p) => (
            <li key={p.id} className={`board-row${p.isYou ? ' you' : ''}`}>
              <RankBadge rank={p.rank} />
              <span className="board-avatar">{initialsOf(p.name)}</span>
              <div>
                <strong>{p.name}{p.isYou ? ' (you)' : ''}</strong>
                <span className="task-meta">{p.domain} · streak {p.streak}</span>
              </div>
              <span className="task-tag">{p.completed} done</span>
            </li>
          ))}
        </ul>
        {filteredBoard.length === 0 && (
          <p className="empty-state">No learners in this track yet.</p>
        )}
      </div>

      {isLive ? (
        <p className="empty-state">
          Live leaderboard — ranked across every learner with an account.
        </p>
      ) : (
        <p className="empty-state">
          Leaderboard uses sample learners in guest mode.{' '}
          <Link to="/register">Create an account</Link> to appear on the real,
          live leaderboard with everyone else.
        </p>
      )}
    </div>
  )
}
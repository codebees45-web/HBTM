import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { levelFromXp } from '../data/mockData.js'

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { roadmap, xp, timeSpentLog, goal } = state
  const { level, currentTierXp, nextTierXp } = levelFromXp(xp)

  const completed = roadmap.filter((m) => m.status === 'completed').length
  const pct = roadmap.length ? Math.round((completed / roadmap.length) * 100) : 0
  const upcoming = roadmap.filter((m) => m.status !== 'completed').slice(0, 3)
  
  const progressToNext = ((currentTierXp) / (nextTierXp || 1)) * 100

  const [showCalibration, setShowCalibration] = useState(true)

  // HiveMind Simulated Data
  const [ledgerEvents, setLedgerEvents] = useState([
    { id: 1, text: '> [USER_094] entered the Deep Work Nexus...' },
    { id: 2, text: '> [USER_211] unlocked the Mastery badge.' },
    { id: 3, text: '> [USER_883] calibrated Cognitive Load to Optimal.' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const activities = [
        '> [USER_' + Math.floor(Math.random()*999) + '] initialized Protocol.',
        '> [USER_' + Math.floor(Math.random()*999) + '] achieved 5-day streak.',
        '> [USER_' + Math.floor(Math.random()*999) + '] connected to The Oracle.',
        '> [USER_' + Math.floor(Math.random()*999) + '] bypassed mental resistance.',
      ]
      const newEvent = { id: Date.now(), text: activities[Math.floor(Math.random() * activities.length)] }
      setLedgerEvents(prev => [...prev.slice(-4), newEvent])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function handleCalibrate(level) {
    setShowCalibration(false)
    // In a real hackathon backend, this would trigger an AI recalculation of the roadmap.
    if (level === 'Depleted') {
      alert("AETHER has recalibrated your immediate tasks to 15-minute micro-sessions to preserve your streak and mental energy.")
    }
  }

  return (
    <div className="bento-dashboard">
      
      {showCalibration && (
        <div className="calibration-modal-overlay">
          <div className="calibration-modal bento-card">
            <h2>Cognitive Load Calibration</h2>
            <p className="task-meta" style={{marginBottom:'24px'}}>AETHER requires your current mental bandwidth to optimize today's roadmap.</p>
            <div className="calibration-options">
              <button className="btn btn-ghost" onClick={() => handleCalibrate('Optimal')}>
                <span style={{fontSize:'24px'}}>⚡</span>
                <div style={{textAlign:'left'}}>
                  <strong>Optimal</strong>
                  <div className="task-meta">High energy, ready for deep work</div>
                </div>
              </button>
              <button className="btn btn-ghost" onClick={() => handleCalibrate('Standard')}>
                <span style={{fontSize:'24px'}}>🔋</span>
                <div style={{textAlign:'left'}}>
                  <strong>Standard</strong>
                  <div className="task-meta">Normal capacity</div>
                </div>
              </button>
              <button className="btn btn-ghost" onClick={() => handleCalibrate('Depleted')}>
                <span style={{fontSize:'24px'}}>🪫</span>
                <div style={{textAlign:'left'}}>
                  <strong>Depleted</strong>
                  <div className="task-meta">Burned out, need micro-tasks</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bento-card bento-hero">
        <div className="hero-content">
          <span className="eyebrow">Your Identity</span>
          <h1>{goal?.text || 'Becoming your future self.'}</h1>
          <p className="hero-subtitle">You have completed {pct}% of your current curated path.</p>
        </div>
        <div className="hero-stats">
          <div className="level-ring-container">
            <svg viewBox="0 0 100 100" className="level-ring">
              <circle cx="50" cy="50" r="45" className="ring-bg" />
              <circle cx="50" cy="50" r="45" className="ring-fill" strokeDasharray={`${progressToNext * 2.827} 282.7`} />
            </svg>
            <div className="level-number">Lvl {level}</div>
          </div>
          <div className="xp-details">
            <strong>{xp} Total XP</strong>
            <span>{nextTierXp - currentTierXp} XP to next level</span>
          </div>
        </div>
      </div>

      <div className="bento-row">

        <div className="bento-card bento-action">
          <div className="panel-head">
            <h2>Next Action</h2>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-action">
              <p>You've cleared your path.</p>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard/mentor')}>Talk to AETHER</button>
            </div>
          ) : (
            <div className="action-content">
              <h3>{upcoming[0].title}</h3>
              <p className="task-meta">{upcoming[0].provider} · ~{upcoming[0].estHours}h</p>
              <button className="btn btn-primary bento-btn" onClick={() => navigate('/focus')}>
                Begin Deep Dive →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bento-row">
        <div className="bento-card bento-velocity" style={{flex: 2}}>
          <div className="panel-head">
            <h2>Velocity</h2>
            <Link className="muted-link" to="/dashboard/analytics">Full analytics →</Link>
          </div>
          {timeSpentLog.length === 0 ? (
            <p className="empty-state">No deep work logged yet. Chart your velocity here.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={timeSpentLog}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--text)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--text)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="actualMin" stroke="var(--text)" fillOpacity={1} fill="url(#colorActual)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bento-card bento-ledger" style={{flex: 1, border: '1px solid var(--gold)'}}>
          <div className="panel-head">
            <h2 style={{color: 'var(--gold)'}}>HiveMind Ledger</h2>
            <div className="pulse-dot" style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-ring 2s infinite'}}></div>
          </div>
          <div className="ledger-feed" style={{fontFamily: 'Fira Code, monospace', fontSize: '13px', color: 'var(--gold)', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {ledgerEvents.map(ev => (
              <div key={ev.id} className="ledger-event typewriter-active" style={{borderRight: 'none', animation: 'none'}}>
                {ev.text}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
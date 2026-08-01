import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Profile() {
  const { state, updateProfile, resetProgress, auth, logout } = useApp()
  const { profile, goal, roadmap, streak } = state
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(profile.dailyGoalMinutes)
  const [remindersEnabled, setRemindersEnabled] = useState(profile.remindersEnabled)
  const [saved, setSaved] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const completed = roadmap.filter((m) => m.status === 'completed').length

  function handleSave(e) {
    e.preventDefault()
    updateProfile({
      name: name.trim() || 'Learner',
      email: email.trim(),
      dailyGoalMinutes: Number(dailyGoalMinutes) || 0,
      remindersEnabled,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    resetProgress()
    navigate('/onboarding')
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Profile</span>
        <h1>Your account & preferences</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Current streak</span>
          <span className="stat-value">{streak}<small> passed</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Milestones completed</span>
          <span className="stat-value">{completed}<small> / {roadmap.length}</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Daily goal</span>
          <span className="stat-value">{profile.dailyGoalMinutes}<small> min</small></span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Account</h2>
        </div>
        {auth.status === 'authed' ? (
          <div className="account-row">
            <div>
              <strong>{auth.user?.name}</strong>
              <span className="task-meta">{auth.user?.email} · synced to the database</span>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
          </div>
        ) : (
          <div className="account-row">
            <p className="empty-state" style={{ margin: 0 }}>
              You're browsing as a guest — progress is saved only to this browser.
            </p>
            <Link className="btn btn-primary" to="/register">Create an account</Link>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Personal details</h2>
        </div>
        <form className="onboard-form" onSubmit={handleSave}>
          <div className="onboard-row">
            <div className="onboard-field">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="onboard-field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="onboard-row">
            <div className="onboard-field">
              <label htmlFor="daily-goal">Daily study goal (minutes)</label>
              <input
                id="daily-goal"
                type="number"
                min={5}
                max={480}
                step={5}
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(e.target.value)}
              />
            </div>
            <div className="onboard-field">
              <label htmlFor="reminders">Reminders</label>
              <select
                id="reminders"
                value={remindersEnabled ? 'on' : 'off'}
                onChange={(e) => setRemindersEnabled(e.target.value === 'on')}
              >
                <option value="on">Nudge me when I go inactive</option>
                <option value="off">Don't nudge me</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" type="submit">
            {saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Current goal</h2>
        </div>
        {goal ? (
          <ul className="task-list">
            <li className="task-row status-active">
              <span className="task-status" />
              <div>
                <strong>{goal.text}</strong>
                <span className="task-meta">{goal.domain} · {goal.timeline}</span>
              </div>
              <span className="task-tag">active</span>
            </li>
          </ul>
        ) : (
          <p className="empty-state">No goal set yet.</p>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2 style={{ color: '#F0A98A' }}>Danger zone</h2>
        </div>
        {!confirmingReset ? (
          <button className="btn btn-ghost" onClick={() => setConfirmingReset(true)}>
            Reset all progress
          </button>
        ) : (
          <div>
            <p className="study-warning" style={{ marginTop: 0, marginBottom: 14 }}>
              This clears your goal, roadmap, streak, and time logs, then sends
              you back through onboarding. Your name and preferences stay put.
              This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleReset}>
                Yes, reset everything
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmingReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
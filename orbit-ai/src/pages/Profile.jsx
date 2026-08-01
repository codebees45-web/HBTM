import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { User, Target, Flame, AlertTriangle, Cloud, CloudOff, Info } from 'lucide-react'

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
      <div className="page-head" style={{ marginBottom: 32 }}>
        <span className="eyebrow">Profile</span>
        <h1>Your account & preferences</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'var(--gold-dim)', borderRadius: 12, color: 'var(--gold)' }}>
            <Flame size={24} />
          </div>
          <div>
            <span className="task-meta" style={{ display: 'block', marginBottom: 4 }}>Current Streak</span>
            <strong style={{ fontSize: 24, lineHeight: 1 }}>{streak} <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>days</span></strong>
          </div>
        </div>
        
        <div className="panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--text)' }}>
            <Target size={24} />
          </div>
          <div>
            <span className="task-meta" style={{ display: 'block', marginBottom: 4 }}>Milestones</span>
            <strong style={{ fontSize: 24, lineHeight: 1 }}>{completed} <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>/ {roadmap.length}</span></strong>
          </div>
        </div>

        <div className="panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--text)' }}>
            <User size={24} />
          </div>
          <div>
            <span className="task-meta" style={{ display: 'block', marginBottom: 4 }}>Daily Goal</span>
            <strong style={{ fontSize: 24, lineHeight: 1 }}>{profile.dailyGoalMinutes} <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>min</span></strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24, maxWidth: 800 }}>
        {/* ACCOUNT STATUS PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              {auth.status === 'authed' ? <Cloud size={20} color="var(--gold)" /> : <CloudOff size={20} color="var(--muted)" />}
            </div>
            <h2 style={{ margin: 0 }}>Account Status</h2>
          </div>
          
          {auth.status === 'authed' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 16 }}>{auth.user?.name}</p>
                <span className="task-meta" style={{ display: 'block', marginTop: 4 }}>{auth.user?.email} · Synced to cloud</span>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout} style={{ color: 'var(--muted)' }}>Sign out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Info size={20} color="var(--muted)" style={{ marginTop: 2 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--text)' }}>Browsing as Guest</p>
                  <span className="task-meta" style={{ display: 'block', marginTop: 4, maxWidth: 350 }}>Your progress is saved locally. Create an account to sync across devices.</span>
                </div>
              </div>
              <Link className="btn btn-primary" to="/register">Create Account</Link>
            </div>
          )}
        </div>

        {/* PERSONAL DETAILS PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <User size={20} color="var(--text)" />
            </div>
            <h2 style={{ margin: 0 }}>Personal Details</h2>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="profile-name" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="profile-email" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="daily-goal" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Daily study goal (minutes)</label>
                <input
                  id="daily-goal"
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(e.target.value)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="reminders" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Reminders</label>
                <select
                  id="reminders"
                  value={remindersEnabled ? 'on' : 'off'}
                  onChange={(e) => setRemindersEnabled(e.target.value === 'on')}
                  className="input-field"
                >
                  <option value="on">Nudge me when I go inactive</option>
                  <option value="off">Don't nudge me</option>
                </select>
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <button className="btn btn-primary" type="submit">
                {saved ? 'Saved ✓' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* CURRENT GOAL PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <Target size={20} color="var(--text)" />
            </div>
            <h2 style={{ margin: 0 }}>Current Goal</h2>
          </div>

          {goal ? (
            <div style={{ padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }} />
                <div>
                  <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{goal.text}</strong>
                  <span className="task-meta">{goal.domain} · {goal.timeline}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', background: 'var(--gold-dim)', color: 'var(--gold)', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>
            </div>
          ) : (
            <p className="empty-state">No goal set yet.</p>
          )}
        </div>

        {/* DANGER ZONE PANEL */}
        <div className="panel" style={{ padding: '24px 32px', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <h2 style={{ margin: 0, color: '#ef4444' }}>Danger Zone</h2>
          </div>

          {!confirmingReset ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--text)' }}>Reset Progress</p>
                <span className="task-meta" style={{ display: 'block', marginTop: 4 }}>Clear your goal, roadmap, and analytics.</span>
              </div>
              <button className="btn btn-secondary" onClick={() => setConfirmingReset(true)} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                Reset everything
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: 20, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ marginTop: 0, marginBottom: 20, color: '#b91c1c', fontSize: 14, lineHeight: 1.6 }}>
                <strong>Are you absolutely sure?</strong> This will permanently delete your active goal, roadmap, current streak, and time logs, returning you to the onboarding flow. Your name and preferences will remain. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={handleReset} style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff' }}>
                  Yes, reset progress
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirmingReset(false)} style={{ color: 'var(--muted)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', end: true, icon: '◎' },
  { to: '/dashboard/roadmap', label: 'Roadmap', icon: '⟿' },
  { to: '/dashboard/assessment', label: 'Assessment', icon: '▣' },
  { to: '/dashboard/mentor', label: 'AI Mentor', icon: '✦' },
  { to: '/dashboard/notifications', label: 'Notifications', icon: '◈' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '▤' },
  { to: '/dashboard/achievements', label: 'Achievements', icon: '⚑' },
  { to: '/dashboard/community', label: 'Community', icon: '⟡' },
  { to: '/dashboard/profile', label: 'Profile', icon: '☉' },
]

export default function DashboardLayout() {
  const { state, toggleTheme } = useApp()

  if (!state.goal) {
    // No goal set yet — send them through onboarding first.
    return <Navigate to="/onboarding" replace />
  }

  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span className="logo-ring" aria-hidden="true"></span> ORBIT AI
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {state.profile.theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
        <nav className="dash-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              {item.label}
              {item.label === 'Notifications' && unread > 0 && (
                <span className="dash-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/dashboard/profile" className="dash-profile-card">
          <span className="dash-avatar">{(state.profile.name || 'L').trim().charAt(0).toUpperCase()}</span>
          <div className="dash-profile-meta">
            <strong>{state.profile.name || 'Learner'}</strong>
            <span>View profile</span>
          </div>
        </NavLink>
        <div className="dash-goal-card">
          <span className="eyebrow">Current goal</span>
          <p>{state.goal.text}</p>
        </div>
      </aside>
      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  )
}
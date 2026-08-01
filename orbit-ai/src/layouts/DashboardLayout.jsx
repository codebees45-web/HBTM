import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Performance', end: true, icon: '◎' },
  { to: '/dashboard/roadmap', label: 'Curated Path', icon: '⟿' },
  { to: '/dashboard/growth-plan', label: 'Growth Plan', icon: '◐' },
  { to: '/dashboard/vault', label: 'Knowledge Vault', icon: '✦' },
  { to: '/dashboard/journal', label: 'Daily Journal', icon: '📝' },
  { to: '/dashboard/assessment', label: 'Reflection', icon: '▣' },
  { to: '/dashboard/mentor', label: 'AETHER Oracle', icon: '✧' },
  { to: '/dashboard/notifications', label: 'Notifications', icon: '◈' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '▤' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

export default function DashboardLayout() {
  const { state, auth, logout } = useApp()
  const navigate = useNavigate()

  if (!state.goal) {
    return <Navigate to="/onboarding" replace />
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const unread = state.notifications ? state.notifications.filter((n) => !n.read).length : 0

  return (
    <div className="dash-shell bento-layout">
      <aside className="dash-sidebar floating-sidebar">
        <div className="dash-logo">
          <span className="logo-ring" aria-hidden="true"></span> AETHER
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

        <div className="sidebar-bottom">
          <div className={`dash-sync-status ${auth?.status}`}>
            {auth?.status === 'authed' ? (
              <>
                <span className="dash-sync-dot" /> Synced to account
                <button className="dash-sync-action" onClick={handleLogout}>Sign out</button>
              </>
            ) : (
              <>
                <span className="dash-sync-dot" /> Guest — local only
                <NavLink className="dash-sync-action" to="/register">Save progress</NavLink>
              </>
            )}
          </div>

          <NavLink to="/dashboard/profile" className="dash-profile-card">
            <span className="dash-avatar">
              {(state.profile?.name || 'L').trim().charAt(0).toUpperCase()}
            </span>
            <div className="dash-profile-meta">
              <strong>{state.profile?.name || 'Learner'}</strong>
              <span>View profile</span>
            </div>
          </NavLink>
        </div>
      </aside>

      <main className="dash-main">
        <TopBar />
        <div className="dash-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
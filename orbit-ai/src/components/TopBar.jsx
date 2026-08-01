import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function TopBar() {
  const { state } = useApp()
  const unread = state.notifications.filter((n) => !n.read).length
  const initial = (state.profile.name || 'L').trim().charAt(0).toUpperCase()

  return (
    <header className="top-bar">
      <div className="top-bar-spacer" />
      <div className="top-bar-actions">
        {state.mood && (
          <div className="streak-pill" title="Current mood" style={{cursor: 'default', pointerEvents: 'none'}}>
            <span aria-hidden="true">{state.mood === 'Optimal' ? '⚡' : state.mood === 'Standard' ? '🔋' : '🪫'}</span>
            <span>{state.mood}</span>
          </div>
        )}

        <NavLink to="/dashboard/notifications" className="icon-btn" aria-label="Notifications">
          <span aria-hidden="true">◈</span>
          {unread > 0 && <span className="icon-btn-badge">{unread}</span>}
        </NavLink>

        <NavLink to="/dashboard/profile" className="top-avatar" aria-label="Profile">
          {initial}
        </NavLink>
      </div>
    </header>
  )
}
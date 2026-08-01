import { useApp } from '../context/AppContext.jsx'
import { Bell, BellOff, Info, CheckCircle2, RotateCcw } from 'lucide-react'

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export default function Notifications() {
  const {
    state,
    markNotificationRead,
    triggerInactivityNudge,
    notificationPermission,
    notificationsSupported,
    requestNotificationPermission,
  } = useApp()
  const { notifications } = state

  return (
    <div className="page">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="eyebrow">Smart Nudges</span>
          <h1>Notifications</h1>
        </div>
        <button 
          className="btn btn-ghost" 
          onClick={triggerInactivityNudge} 
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', color: 'var(--muted)' }}
          title="Simulate inactivity nudge for demo purposes"
        >
          <RotateCcw size={16} /> Simulate Nudge
        </button>
      </div>

      {notificationsSupported && notificationPermission !== 'granted' && (
        <div className="panel" style={{ marginBottom: 24, padding: 24, display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-panel-2)' }}>
          <div style={{ background: 'var(--line)', padding: 12, borderRadius: 12, color: 'var(--muted)' }}>
            <BellOff size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 4 }}>Browser Notifications Disabled</h3>
            <p className="task-meta">
              {notificationPermission === 'denied'
                ? "Notifications are blocked. Enable them in your browser's site settings to get nudges even when this tab isn't open."
                : 'Turn on browser notifications to receive nudges when the tab is in the background.'}
            </p>
          </div>
          {notificationPermission !== 'denied' && (
            <button className="btn btn-secondary" onClick={requestNotificationPermission}>
              Enable
            </button>
          )}
        </div>
      )}

      {notificationsSupported && notificationPermission === 'granted' && !state.profile.remindersEnabled && (
        <div className="panel" style={{ marginBottom: 24, padding: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--gold)' }}>
          <Bell size={20} color="var(--gold)" />
          <span className="task-meta" style={{ color: 'var(--gold)' }}>
            Browser notifications are granted, but reminders are currently turned off in your Profile settings.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {notifications.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', background: 'var(--bg-panel-2)' }}>
            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: 8, color: 'var(--text)' }}>You're all caught up</h3>
            <p>We'll nudge you when it's time to focus.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`journal-entry-card ${n.read ? 'read' : 'unread'}`} 
              style={{ display: 'flex', gap: 16, padding: '20px 24px', opacity: n.read ? 0.6 : 1 }}
            >
              <div style={{ padding: 10, background: n.read ? 'var(--bg)' : 'var(--gold-dim)', borderRadius: 12, height: 'fit-content', color: n.read ? 'var(--muted)' : 'var(--gold)' }}>
                <Info size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <strong style={{ fontSize: '1.1rem' }}>{n.title}</strong>
                  <span className="task-meta">{timeAgo(n.createdAt)}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>{n.body}</p>
              </div>
              {!n.read && (
                <div style={{ alignSelf: 'center' }}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => markNotificationRead(n.id)}
                    style={{ padding: '8px', color: 'var(--gold)' }}
                    title="Mark as read"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
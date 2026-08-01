import { useApp } from '../context/AppContext.jsx'

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

  const { t } = useApp()

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Smart nudges</span>
        <h1>Notifications</h1>
      </div>

      {notificationsSupported && notificationPermission !== 'granted' && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <p className="task-meta" style={{ marginBottom: 10 }}>
            {notificationPermission === 'denied'
              ? "Browser notifications are blocked. Enable them in your browser's site settings to get nudges even when this tab isn't open."
              : 'Turn on browser notifications to get nudged even when this tab is in the background.'}
          </p>
          {notificationPermission !== 'denied' && (
            <button className="btn btn-ghost" onClick={requestNotificationPermission}>
              Enable browser notifications
            </button>
          )}
        </div>
      )}

      {notificationsSupported && notificationPermission === 'granted' && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <span className="cam-status cam-ready">
            Browser notifications are on {!state.profile.remindersEnabled && '(but reminders are off in Profile)'}
          </span>
        </div>
      )}

      <div className="panel" style={{ marginBottom: 20 }}>
        <p className="task-meta" style={{ marginBottom: 10 }}>
          In production this fires automatically after N days of inactivity or a
          failed quiz. This button simulates that trigger for demo purposes.
        </p>
        <button className="btn btn-ghost" onClick={triggerInactivityNudge}>
          Simulate inactivity nudge
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="empty-state">You're all caught up.</p>
      ) : (
        <ul className="notif-list">
          {notifications.map((n) => (
            <li key={n.id} className={`notif-row tone-${n.tone} ${n.read ? 'read' : ''}`}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <span className="task-meta">{timeAgo(n.createdAt)}</span>
              </div>
              {!n.read && (
                <button className="muted-link" onClick={() => markNotificationRead(n.id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
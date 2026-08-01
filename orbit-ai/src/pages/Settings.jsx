import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Settings() {
  const { state, auth, toggleTheme, logout, changePassword } = useApp()
  const navigate = useNavigate()
  const isLight = state.profile.theme === 'light'
  const isGuest = auth.status !== 'authed'

  // --- PWA install prompt ------------------------------------------------
  // The browser fires this event when the app is installable and hasn't
  // been installed yet; we stash it so "Install app" can trigger it on
  // demand instead of waiting for the browser's own UI to show up.
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
  )

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault()
      setInstallPrompt(e)
    }
    function handleInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstallClick() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwError('')
    setPwSaved(false)

    if (isGuest) {
      setPwError('Create an account first — guests have nothing to change a password on.')
      return
    }
    if (!newPw || !confirmPw) {
      setPwError('Fill in the new password fields.')
      return
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('New password and confirmation don\'t match.')
      return
    }

    setPwSaving(true)
    try {
      await changePassword(currentPw, newPw)
      setPwSaved(true)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setTimeout(() => setPwSaved(false), 2500)
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwSaving(false)
    }
  }

  function handleSignOut() {
    logout()
    navigate('/')
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Settings</span>
        <h1>App preferences</h1>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>App</h2>
        </div>
        <div className="task-row" style={{ borderBottom: 'none', padding: '4px' }}>
          <div>
            <strong>Install AETHER</strong>
            <span className="task-meta">
              {installed
                ? 'Installed — running as a standalone app.'
                : installPrompt
                  ? 'Add it to your home screen or app list for offline access and a faster launch.'
                  : "Not installable right now — your browser hasn't offered the install prompt yet (or it's already installed elsewhere on this device)."}
            </span>
          </div>
          {!installed && installPrompt && (
            <button className="btn btn-primary" onClick={handleInstallClick}>
              Install app
            </button>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Appearance</h2>
        </div>
        <div className="task-row" style={{ borderBottom: 'none', padding: '4px' }}>
          <div>
            <strong>Theme</strong>
            <span className="task-meta">{isLight ? 'Light' : 'Dark'} mode is currently active</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            role="switch"
            aria-checked={isLight}
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-icon theme-toggle-icon-sun">☀</span>
              <span className="theme-toggle-icon theme-toggle-icon-moon">☾</span>
              <span className="theme-toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>


      <div className="panel">
        <div className="panel-head">
          <h2>Security</h2>
        </div>
        {isGuest && (
          <p className="task-meta" style={{ marginBottom: 12 }}>
            You're browsing as a guest, so there's no account password to change yet.
          </p>
        )}
        <form className="onboard-form" onSubmit={handlePasswordSubmit}>
          <div className="onboard-field">
            <label htmlFor="current-pw">Current password</label>
            <input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              disabled={isGuest}
            />
          </div>
          <div className="onboard-row">
            <div className="onboard-field">
              <label htmlFor="new-pw">New password</label>
              <input
                id="new-pw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                disabled={isGuest}
              />
            </div>
            <div className="onboard-field">
              <label htmlFor="confirm-pw">Confirm new password</label>
              <input
                id="confirm-pw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                disabled={isGuest}
              />
            </div>
          </div>
          {pwError && (
            <p className="study-warning" style={{ marginTop: 0 }}>{pwError}</p>
          )}
          <button className="btn btn-primary" type="submit" disabled={isGuest || pwSaving}>
            {pwSaving ? 'Updating…' : pwSaved ? 'Password updated ✓' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Session</h2>
        </div>
        <button className="btn btn-ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
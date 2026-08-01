import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { Smartphone, Moon, Sun, Shield, LogOut, Download } from 'lucide-react'

export default function Settings() {
  const { state, auth, toggleTheme, logout, changePassword } = useApp()
  const navigate = useNavigate()
  const isLight = state.profile.theme === 'light'
  const isGuest = auth.status !== 'authed'

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
      <div className="page-head" style={{ marginBottom: 32 }}>
        <span className="eyebrow">Settings</span>
        <h1>App preferences</h1>
      </div>

      <div style={{ display: 'grid', gap: 24, maxWidth: 800 }}>
        
        {/* APP INSTALL PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <Smartphone size={20} color="var(--text)" />
            </div>
            <h2 style={{ margin: 0 }}>Install AETHER</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text)' }}>Standalone App</p>
              <span className="task-meta" style={{ display: 'block', marginTop: 4 }}>
                {installed
                  ? 'Installed — running as a standalone app.'
                  : installPrompt
                    ? 'Add it to your home screen or app list for offline access and a faster launch.'
                    : "Not installable right now — your browser hasn't offered the install prompt yet."}
              </span>
            </div>
            {!installed && installPrompt && (
              <button className="btn btn-primary" onClick={handleInstallClick} style={{ flexShrink: 0 }}>
                <Download size={16} /> Install App
              </button>
            )}
          </div>
        </div>

        {/* APPEARANCE PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              {isLight ? <Sun size={20} color="var(--text)" /> : <Moon size={20} color="var(--text)" />}
            </div>
            <h2 style={{ margin: 0 }}>Appearance</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text)' }}>Theme Preference</p>
              <span className="task-meta" style={{ display: 'block', marginTop: 4 }}>{isLight ? 'Light mode' : 'Dark mode'} is currently active</span>
            </div>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              role="switch"
              aria-checked={isLight}
              aria-label="Toggle theme"
              style={{ margin: 0 }}
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-icon theme-toggle-icon-sun">☀</span>
                <span className="theme-toggle-icon theme-toggle-icon-moon">☾</span>
                <span className="theme-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>

        {/* SECURITY PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <Shield size={20} color="var(--text)" />
            </div>
            <h2 style={{ margin: 0 }}>Security</h2>
          </div>

          {isGuest ? (
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 8, border: '1px solid var(--line)', color: 'var(--muted)' }}>
              You're browsing as a guest, so there's no account password to change yet. Create an account to secure your profile.
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="current-pw" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Current password</label>
                <input
                  id="current-pw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ width: '100%', maxWidth: 400 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="new-pw" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>New password</label>
                  <input
                    id="new-pw"
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 8 characters"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="confirm-pw" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Confirm new password</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              {pwError && (
                <div style={{ color: '#ef4444', fontSize: 14, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {pwError}
                </div>
              )}
              <div style={{ paddingTop: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : pwSaved ? 'Password updated ✓' : 'Update password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SESSION PANEL */}
        <div className="panel" style={{ padding: '24px 32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 8, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <LogOut size={20} color="var(--text)" />
            </div>
            <h2 style={{ margin: 0 }}>Session</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text)' }}>Sign Out</p>
              <span className="task-meta" style={{ display: 'block', marginTop: 4 }}>End your current session on this device.</span>
            </div>
            <button className="btn btn-secondary" onClick={handleSignOut} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
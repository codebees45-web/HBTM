import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import CursorTrail from '../components/CursorTrail.jsx'

export default function Login() {
  const { login, loginWithGoogle } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleCredential = useCallback(
    async (idToken) => {
      setError('')
      try {
        await loginWithGoogle(idToken)
        navigate('/onboarding')
      } catch (err) {
        setError(err.message || 'Google sign-in failed')
      }
    },
    [loginWithGoogle, navigate]
  )

  return (
    <div className="auth-split">
      {/* Branded Panel */}
      <div className="auth-brand">
        <CursorTrail />
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <span className="auth-brand-dot" />
            AETHER OS
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to AETHER</h1>
          <p className="auth-subtitle">
            Your roadmap, progress, and cognitive profile sync across devices.
          </p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <GoogleSignInButton text="signin_with" onCredential={handleGoogleCredential} />

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="login-password">Password</label>
              <div className="auth-pwd-wrapper">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer-links">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
            <Link to="/onboarding" className="auth-guest-link">
              Continue as guest — local only →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
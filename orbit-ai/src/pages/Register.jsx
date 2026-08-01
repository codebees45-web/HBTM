import { useCallback, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import CursorTrail from '../components/CursorTrail.jsx'

function getPasswordStrength(pwd) {
  if (!pwd) return { level: 0, label: '', cls: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 2) return { level: 1, label: 'Weak', cls: 'weak' }
  if (score <= 3) return { level: 2, label: 'Medium', cls: 'medium' }
  return { level: 3, label: 'Strong', cls: 'strong' }
}

export default function Register() {
  const { register, loginWithGoogle } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Registration failed')
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
          <span className="eyebrow">Get started</span>
          <h1>Create your account</h1>
          <p className="auth-subtitle">
            Your progress, roadmap, and cognitive profile will follow you to any device.
          </p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <GoogleSignInButton text="signup_with" onCredential={handleGoogleCredential} />

          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label htmlFor="reg-name">Name</label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-password">Password</label>
              <div className="auth-pwd-wrapper">
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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
              {password && (
                <>
                  <div className="auth-strength">
                    {[1, 2, 3].map((seg) => (
                      <div
                        key={seg}
                        className={`auth-strength-seg ${strength.level >= seg ? `active-${strength.cls}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`auth-strength-label ${strength.cls}`}>{strength.label}</span>
                </>
              )}
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="auth-spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer-links">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
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
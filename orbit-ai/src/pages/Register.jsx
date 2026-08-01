import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'

export default function Register() {
  const { register, loginWithGoogle } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
        // Same endpoint as the Login page — it creates the account on
        // first sign-in and logs in on every one after that.
        await loginWithGoogle(idToken)
        navigate('/onboarding')
      } catch (err) {
        setError(err.message || 'Google sign-in failed')
      }
    },
    [loginWithGoogle, navigate]
  )

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <span className="eyebrow">Get started</span>
        <h1>Create your account</h1>
        <p className="onboard-sub">
          Sets up a real account in the database — your progress, roadmap, and streak will
          follow you to any device.
        </p>
        <GoogleSignInButton text="signup_with" onCredential={handleGoogleCredential} />

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form className="onboard-form" onSubmit={handleSubmit}>
          <div>
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
          <div>
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
          <div>
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
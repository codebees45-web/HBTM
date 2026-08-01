import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'

export default function Login() {
  const { login, loginWithGoogle } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleCredential = useCallback(
    async (idToken) => {
      setError('')
      try {
        await loginWithGoogle(idToken)
        navigate('/dashboard')
      } catch (err) {
        setError(err.message || 'Google sign-in failed')
      }
    },
    [loginWithGoogle, navigate]
  )

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to AETHER</h1>
        <p className="onboard-sub">
          Your roadmap, streak, and progress sync across devices once you're signed in.
        </p>
        <GoogleSignInButton text="signin_with" onCredential={handleGoogleCredential} />

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form className="onboard-form" onSubmit={handleSubmit}>
          <div>
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
          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="auth-switch">
          <Link to="/dashboard">Continue as guest instead →</Link>
        </p>
      </div>
    </div>
  )
}
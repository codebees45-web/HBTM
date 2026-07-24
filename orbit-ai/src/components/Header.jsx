import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Header() {
  const { state, toggleTheme } = useApp()
  return (
    <header className="site-header">
      <nav className="wrap nav">
        <div className="logo">
          <span className="logo-ring" aria-hidden="true"></span> ORBIT AI
        </div>
        <div className="nav-links">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {state.profile.theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link className="muted" to="/login">Sign in</Link>
          <Link className="btn btn-primary" to="/onboarding">Get Started</Link>
        </div>
      </nav>
    </header>
  )
}
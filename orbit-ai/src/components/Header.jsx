import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  
  return (
    <>
      <nav className="l-nav">
        <div className="l-nav-inner">
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <button className="l-nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link to="/" className="l-nav-logo">
              <span className="l-nav-logo-dot" aria-hidden="true"></span>
              AETHER OS
            </Link>
          </div>
          
          <div className="l-nav-links">
            <a className="l-nav-link" href="#how">Systems</a>
            <a className="l-nav-link" href="#paths">Neuro-Sync</a>
            <Link className="l-nav-link" to="/dashboard/mentor">The Oracle</Link>
            <Link className="l-nav-link" to="/dashboard/community">HiveMind</Link>
          </div>
          
          <div className="l-nav-actions">
            <Link to="/login" className="l-pill l-pill-ghost l-pill-sm">Log In</Link>
            <Link to="/register" className="l-pill l-pill-primary l-pill-sm">Sign Up</Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <div className={`l-nav-mobile ${menuOpen ? 'open' : ''}`}>
        <a className="l-nav-link" href="#how" onClick={() => setMenuOpen(false)}>Systems</a>
        <a className="l-nav-link" href="#paths" onClick={() => setMenuOpen(false)}>Neuro-Sync</a>
        <Link className="l-nav-link" to="/dashboard/mentor" onClick={() => setMenuOpen(false)}>The Oracle</Link>
        <Link className="l-nav-link" to="/dashboard/community" onClick={() => setMenuOpen(false)}>HiveMind</Link>
        <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'16px'}}>
          <Link to="/login" className="l-pill l-pill-ghost" style={{width:'100%', justifyContent:'center'}} onClick={() => setMenuOpen(false)}>Log In</Link>
          <Link to="/register" className="l-pill l-pill-primary" style={{width:'100%', justifyContent:'center'}} onClick={() => setMenuOpen(false)}>Sign Up</Link>
        </div>
      </div>
      
      <div className="l-nav-spacer"></div>
    </>
  )
}
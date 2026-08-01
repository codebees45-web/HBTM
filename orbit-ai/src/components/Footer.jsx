import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="l-footer">
      <div className="l-footer-inner">
        {/* Column 1: Brand */}
        <div className="l-footer-col l-footer-brand">
          <Link to="/" className="l-nav-logo" style={{ marginBottom: '16px' }}>
            <span className="l-nav-logo-dot" aria-hidden="true"></span>
            AETHER
          </Link>
          <p className="l-footer-copy">Copyright © AETHER 2026</p>
        </div>

        {/* Column 2: Get to know us */}
        <div className="l-footer-col">
          <h4 className="l-footer-heading">Get to know us</h4>
          <a href="#" className="l-footer-link">About</a>
          <a href="#" className="l-footer-link">Blog</a>
          <a href="#" className="l-footer-link">Contact us</a>
        </div>

        {/* Column 3: Platform */}
        <div className="l-footer-col">
          <h4 className="l-footer-heading">AETHER platform</h4>
          <a href="#how" className="l-footer-link">How it works?</a>
          <a href="#paths" className="l-footer-link">Growth Paths</a>
          <Link to="/dashboard/mentor" className="l-footer-link">Mentors</Link>
          <Link to="/dashboard/community" className="l-footer-link">Community</Link>
          <a href="#curated" className="l-footer-link">Curated</a>
        </div>

        {/* Column 4: Legal */}
        <div className="l-footer-col">
          <h4 className="l-footer-heading">Legal</h4>
          <a href="#" className="l-footer-link">Cookie notice</a>
          <a href="#" className="l-footer-link">Privacy policy</a>
          <a href="#" className="l-footer-link">Terms of service</a>
        </div>

        {/* Column 5: Social */}
        <div className="l-footer-col">
          <h4 className="l-footer-heading">Social</h4>
          <div className="l-footer-socials">
            <a href="#" className="l-footer-social-link" aria-label="YouTube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
            <a href="#" className="l-footer-social-link" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="l-hero">
      <div className="l-hero-inner">
        <p className="l-eyebrow">AETHER OS // Neuro-Sync</p>
        <h1>Rewire your focus.<br />Build your legacy.</h1>
        <p>
          The ultimate AI operating system designed to intercept distractions, manage your cognitive load, and synchronize your ambitions. Enter the Deep Work Nexus and track your Identity Radar.
        </p>
        <div className="l-hero-actions">
          <Link to="/onboarding" className="l-pill l-pill-primary">Initialize Protocol</Link>
          <a href="#features" className="l-pill l-pill-ghost">Explore Systems</a>
        </div>
      </div>
    </section>
  )
}
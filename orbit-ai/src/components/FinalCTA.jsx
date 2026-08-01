import { Link } from 'react-router-dom'

export default function FinalCTA() {
  return (
    <section className="l-final-cta">
      <h2>Ready to initialize your legacy?</h2>
      <Link className="l-pill l-pill-primary" style={{padding:'15px 32px', fontSize:'16px'}} to="/onboarding">Initialize Protocol →</Link>
    </section>
  )
}

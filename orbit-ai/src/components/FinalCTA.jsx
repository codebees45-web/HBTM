import { Link } from 'react-router-dom'

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <h2>Ready to build a roadmap that actually adapts to you?</h2>
      <Link className="btn btn-primary btn-lg" to="/onboarding">Start Your Roadmap →</Link>
    </section>
  )
}

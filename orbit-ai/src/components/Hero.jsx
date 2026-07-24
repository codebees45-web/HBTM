import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <div className="orbit-field" aria-hidden="true">
        <svg viewBox="0 0 900 900" width="900" height="900">
          <circle className="ring spin-slow" cx="450" cy="450" r="230" />
          <circle className="ring spin-slower" cx="450" cy="450" r="330" />
          <circle className="ring-glow spin-slow" cx="450" cy="450" r="410" />
        </svg>
      </div>
      <div className="hero-inner">
        <span className="eyebrow">An AI Learning Operating System</span>
        <h1>Turning Learning Into<br />Measurable Success</h1>
        <p className="sub">
          ORBIT AI doesn't recommend courses. It understands your goal, builds a
          living roadmap, watches how you actually learn, and adapts — until
          you're genuinely ready.
        </p>
        <div className="hero-ctas">
          <Link className="btn btn-primary" to="/onboarding">Start Your Roadmap →</Link>
          <a className="btn btn-ghost" href="#how">How It Works</a>
        </div>
      </div>
    </section>
  )
}

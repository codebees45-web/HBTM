const FEATURES = [
  {
    n: '01',
    title: 'Understands Your Goal',
    body: 'Say what you want in plain language — ORBIT AI extracts your career target, timeline, and skill gaps.',
  },
  {
    n: '02',
    title: 'Living Roadmap',
    body: 'A dependency-aware plan that adapts every time you learn, practice, or take a quiz.',
  },
  {
    n: '03',
    title: 'Real Risk Detection',
    body: 'Falling behind gets caught early, with a clear reason and a concrete recovery step.',
  },
  {
    n: '04',
    title: 'Mastery, Not Completion',
    body: 'Progress is measured by demonstrated understanding — not videos watched.',
  },
  {
    n: '05',
    title: 'Explainable AI',
    body: 'Every roadmap change comes with a reason, the evidence behind it, and the expected benefit.',
  },
  {
    n: '06',
    title: 'AI Mentor, Daily',
    body: 'A single prioritized recommendation each day instead of an overwhelming dashboard.',
  },
]

export default function Features() {
  return (
    <section className="features" id="how">
      <div className="section-head">
        <span className="eyebrow">System</span>
        <h2>What makes it different</h2>
      </div>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.n}>
            <div className="feature-mark">{f.n}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

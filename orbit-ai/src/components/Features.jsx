const FEATURES = [
  { n: '01', title: 'Understands Your Identity', body: 'Tell us who you want to become — AETHER maps your aspirations, habits, and evolving identity to build a model of your ideal self.' },
  { n: '02', title: 'Curates Your Path', body: 'The right book, podcast, mentor, or experience — surfaced at exactly the right moment in your personal growth journey.' },
  { n: '03', title: 'Growth, Not Engagement', body: 'While other platforms optimize for screen time, AETHER optimizes for your potential — and explains every recommendation.' },
  { n: '04', title: 'For Every Stage of Life', body: 'Whether you\'re 18 or 80, starting a career or finding purpose in retirement — your path is uniquely yours.' },
  { n: '05', title: 'Learns & Adapts', body: 'As you evolve, so does your path. Every reflection, milestone, and feedback shapes what comes next.' },
  { n: '06', title: 'Your Growth Companion', body: 'One focused recommendation each day instead of an overwhelming feed — purposeful growth, not passive scrolling.' },
];

export default function Features() {
  return (
    <section className="l-features" id="how">
      <div className="l-section-head">
        <span className="l-eyebrow">System</span>
        <h2>How AETHER works</h2>
      </div>
      <div className="l-features-grid">
        {FEATURES.map(f => (
          <div key={f.n} className="l-feature-card">
            <span className="l-feature-num">{f.n}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

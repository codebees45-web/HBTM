const STEPS = ['Aspiration', 'AI Understanding', 'Curation', 'Growth', 'Reflection', 'Evolution'];

export default function Loop() {
  return (
    <section className="l-loop" id="paths">
      <span className="l-eyebrow">Continuous Cycle</span>
      <h2>The growth loop</h2>
      <div className="l-loop-diagram">
        <svg viewBox="0 0 400 400" className="l-loop-svg">
          <circle className="l-loop-track" cx="200" cy="200" r="160" />
          <circle className="l-loop-progress" cx="200" cy="200" r="160" />
          
          {STEPS.map((step, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const x = 200 + 160 * Math.cos(angle);
            const y = 200 + 160 * Math.sin(angle);
            return (
              <g key={step} className="l-loop-node" transform={`translate(${x},${y})`}>
                <circle className="l-loop-dot" r="8" />
                <text className="l-loop-num" y="-15" textAnchor="middle">{i + 1}</text>
                <text className="l-loop-lbl" y="25" textAnchor="middle">{step}</text>
              </g>
            );
          })}
          
          <g className="l-loop-center">
            <text x="200" y="190" style={{ fontSize: '48px', textAnchor: 'middle' }}>⟲</text>
            <text x="200" y="220" style={{ fontSize: '16px', textAnchor: 'middle', fill: '#666' }}>adapts continuously</text>
          </g>
        </svg>
      </div>
    </section>
  );
}
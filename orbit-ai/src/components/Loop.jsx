const STEPS = ['Goal', 'AI Planning', 'Learning', 'Assessment', 'Adaptation', 'Success']
const SIZE = 520
const CENTER = SIZE / 2
const RADIUS = 200

function nodePosition(index, total) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2 // start at top
  const x = CENTER + RADIUS * Math.cos(angle)
  const y = CENTER + RADIUS * Math.sin(angle)
  return { left: `${(x / SIZE) * 100}%`, top: `${(y / SIZE) * 100}%` }
}

export default function Loop() {
  return (
    <section className="loop">
      <span className="eyebrow">Continuous Cycle</span>
      <h2>The closed learning loop</h2>
      <div className="loop-diagram">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle className="loop-track" cx={CENTER} cy={CENTER} r={RADIUS} />
          <circle
            className="loop-progress"
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </svg>
        <div className="loop-center">
          <div className="num">⟲</div>
          <div className="lbl">
            adapts
            <br />
            continuously
          </div>
        </div>
        {STEPS.map((label, i) => {
          const pos = nodePosition(i, STEPS.length)
          return (
            <div className="loop-node" style={pos} key={label}>
              <div className="dot"></div>
              <span className="step">STAGE {i + 1}</span>
              <strong>{label}</strong>
            </div>
          )
        })}
      </div>
    </section>
  )
}

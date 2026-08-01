import { motion } from 'framer-motion'

export default function AboutTimeline() {
  const steps = [
    { year: '01', title: 'Calibration', desc: 'AETHER OS analyzes your goals and current cognitive load.' },
    { year: '02', title: 'Generation', desc: 'The Forge generates a personalized, dynamic roadmap.' },
    { year: '03', title: 'Execution', desc: 'You enter the Deep Work Nexus to execute tasks flawlessly.' },
    { year: '04', title: 'Evolution', desc: 'Identity Radar tracks your transformation into your future self.' }
  ]

  return (
    <section className="py-24 px-6 w-full" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="max-w-[1000px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '14px' }}>The Process</span>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '16px', color: 'var(--text-primary)' }}>How AETHER OS Works</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gray-200" style={{ background: 'var(--border-color)', transform: 'translateX(-50%)' }} />

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2 }}
              className={`relative flex items-center mb-16 md:mb-24 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Center Dot */}
              <div className="absolute left-[24px] md:left-1/2 w-4 h-4 rounded-full z-10" style={{ background: 'var(--gold)', transform: 'translate(-50%, 0)', boxShadow: '0 0 20px rgba(16,185,129,0.5)' }} />
              
              <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${i % 2 === 0 ? 'md:pl-16 text-left' : 'md:pr-16 md:text-right'}`}>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--border-color)', lineHeight: 1, marginBottom: '8px' }}>{step.year}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

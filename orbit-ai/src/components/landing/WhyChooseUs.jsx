import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

export default function WhyChooseUs() {
  const comparison = [
    { feature: 'Personalized Roadmaps', us: true, them: false },
    { feature: 'Cognitive Load Calibration', us: true, them: false },
    { feature: 'Streak Protection', us: true, them: false },
    { feature: 'Real-time AI Mentoring', us: true, them: false },
    { feature: 'Basic Task Tracking', us: true, them: true }
  ]

  return (
    <section className="py-24 px-6 w-full" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="max-w-[1000px] mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '40px' }}
        >
          AETHER vs Traditional Tools
        </motion.h2>

        <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
          <table style={{ w: '100%', minWidth: '600px', borderCollapse: 'collapse', margin: '0 auto', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '24px', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Capabilities</th>
                <th style={{ padding: '24px', fontSize: '1.25rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', borderRadius: '16px 16px 0 0', border: '1px solid var(--gold)', borderBottom: 'none' }}>AETHER OS</th>
                <th style={{ padding: '24px', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Others</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '24px', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ padding: '24px', background: 'var(--bg-primary)', borderLeft: '1px solid var(--gold)', borderRight: '1px solid var(--gold)', borderBottom: i === comparison.length - 1 ? '1px solid var(--gold)' : 'none', borderRadius: i === comparison.length - 1 ? '0 0 16px 16px' : '0' }}>
                    {row.us ? <Check color="var(--gold)" size={24} className="mx-auto" /> : <X color="var(--text-muted)" size={24} className="mx-auto" />}
                  </td>
                  <td style={{ padding: '24px' }}>
                    {row.them ? <Check color="var(--text-muted)" size={24} className="mx-auto" /> : <X color="#ef4444" size={24} className="mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

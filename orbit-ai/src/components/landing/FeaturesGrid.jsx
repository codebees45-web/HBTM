import { motion } from 'framer-motion'
import { Brain, Zap, Target, Shield, Focus, Activity } from 'lucide-react'

const features = [
  { icon: <Brain size={24} />, title: 'Neuro-Sync', desc: 'Calibrate your mental bandwidth to your tasks.' },
  { icon: <Zap size={24} />, title: 'Hyper-Focus', desc: 'Eliminate distractions with our Deep Work Nexus.' },
  { icon: <Target size={24} />, title: 'Dynamic Roadmaps', desc: 'AI-generated curriculum that adapts as you grow.' },
  { icon: <Shield size={24} />, title: 'Streak Preservation', desc: 'Earn freezes to protect your momentum on bad days.' },
  { icon: <Focus size={24} />, title: 'The Oracle', desc: 'A cybernetic mentor that answers any question instantly.' },
  { icon: <Activity size={24} />, title: 'HiveMind Ledger', desc: 'See global user activity and feel the collective momentum.' }
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 max-w-[1200px] mx-auto w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}
        >
          Systems Engineered for Excellence
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}
        >
          Every feature is meticulously crafted to eliminate friction and maximize your cognitive output.
        </motion.p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '24px', 
              padding: '32px',
              boxShadow: 'var(--shadow-base)'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gold-dim)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

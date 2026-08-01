import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ServicesGrid() {
  const services = [
    { title: 'The Oracle Protocol', desc: 'Real-time AI mentoring designed to unblock you instantly.', link: '/dashboard/mentor', color: '#10b981' },
    { title: 'Identity Radar', desc: 'Visual analytics mapping your cognitive and physical growth.', link: '/dashboard/analytics', color: '#3b82f6' },
    { title: 'Deep Work Nexus', desc: 'A cinematic focus state that eliminates distractions.', link: '/focus', color: '#8b5cf6' }
  ]

  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>Premium Services</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginTop: '16px', maxWidth: '500px' }}>
            Elevate your workflow with enterprise-grade personal development tools.
          </p>
        </div>
        <Link to="/onboarding" className="l-pill l-pill-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: 'fit-content' }}>
          View All Systems <ArrowRight size={16} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '40px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-base)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: s.color }} />
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>{s.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px', flex: 1 }}>{s.desc}</p>
            <Link to={s.link} style={{ color: s.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Initialize <ArrowRight size={16} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

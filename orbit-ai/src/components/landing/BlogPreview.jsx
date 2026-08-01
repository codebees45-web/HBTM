import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'

export default function BlogPreview() {
  const blogs = [
    { title: 'The Neuroscience of Deep Work', tag: 'Science', read: '5 min read' },
    { title: 'How to Build an Indestructible Streak', tag: 'Habits', read: '4 min read' },
    { title: 'Why Multi-tasking is Destroying Your Focus', tag: 'Productivity', read: '6 min read' }
  ]

  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-end mb-16">
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' }}>Latest Intel</h2>
        <a href="#" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          View All <ArrowRight size={16} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {blogs.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '32px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-base)'
            }}
          >
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--gold-dim)', color: 'var(--gold)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, mb: '16px', marginBottom: '16px' }}>
              {b.tag}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.4 }}>{b.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Clock size={16} /> {b.read}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

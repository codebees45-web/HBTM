import { motion } from 'framer-motion'

export default function PortfolioMasonry() {
  const images = [
    { title: 'The Dashboard', size: 'large' },
    { title: 'Cognitive Load Modal', size: 'small' },
    { title: 'Deep Work Nexus', size: 'medium' },
    { title: 'Identity Radar', size: 'small' },
    { title: 'The Oracle', size: 'medium' },
    { title: 'HiveMind Ledger', size: 'large' },
  ]

  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center mb-16">
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' }}>Inside AETHER OS</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginTop: '16px' }}>Glimpse the systems that will rebuild your focus.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', gridAutoRows: '200px' }}>
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              gridRowEnd: img.size === 'large' ? 'span 2' : img.size === 'medium' ? 'span 2' : 'span 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-base)',
              cursor: 'pointer'
            }}
          >
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--bg-primary)', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✨
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{img.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function TestimonialCarousel() {
  const testimonials = [
    { text: "AETHER OS didn't just organize my tasks. It literally rewired how my brain processes deep work.", author: "Alex Rivera", role: "Software Architect" },
    { text: "The Cognitive Load Calibration is a game changer. It knows when I'm burning out before I do.", author: "Sarah Chen", role: "Product Designer" },
    { text: "I've hit a 40-day streak of pure focused output. The Identity Radar visualizes my progress perfectly.", author: "David Kim", role: "Founder" }
  ]

  return (
    <section className="py-24 px-6 w-full" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div className="max-w-[1200px] mx-auto">
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '64px' }}>Elite Performers Swear By It</h2>
        
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '32px', scrollSnapType: 'x mandatory' }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                minWidth: '350px',
                flex: 1,
                scrollSnapAlign: 'start',
                background: 'var(--bg-primary)',
                padding: '40px',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-base)'
              }}
            >
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', color: 'var(--gold)' }}>
                {[1,2,3,4,5].map(star => <Star key={star} fill="currentColor" size={20} />)}
              </div>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '32px', fontStyle: 'italic', lineHeight: 1.6 }}>"{t.text}"</p>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{t.author}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

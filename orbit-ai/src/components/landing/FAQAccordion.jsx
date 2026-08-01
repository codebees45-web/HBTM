import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

export default function FAQAccordion() {
  const [open, setOpen] = useState(null)

  const faqs = [
    { q: 'How does Cognitive Load Calibration work?', a: 'Every day, AETHER asks for your mental bandwidth. If you are depleted, it automatically breaks your tasks into 15-minute micro-sessions.' },
    { q: 'Can I connect AETHER OS to my existing tools?', a: 'We currently run as a standalone neuro-sync platform to guarantee a distraction-free Deep Work Nexus.' },
    { q: 'Is The Oracle powered by real AI?', a: 'Yes. The Oracle uses an advanced LLM backend to analyze your specific roadmap and answer your personal blockers.' },
    { q: 'What happens if I break my streak?', a: 'If you complete 7 days perfectly, you earn a "Streak Freeze" which automatically protects your streak if you miss a day.' }
  ]

  return (
    <section className="py-24 px-6 w-full max-w-[800px] mx-auto">
      <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <button 
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'left' }}>{faq.q}</span>
              {open === i ? <Minus color="var(--gold)" /> : <Plus color="var(--text-secondary)" />}
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}

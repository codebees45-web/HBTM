import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function AnimatedHero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full opacity-20 blur-[120px]" style={{ background: 'var(--gold)' }} />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--gold)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'var(--btn-bg)', border: '1px solid var(--border-color)' }}
        >
          <Sparkles size={16} color="var(--gold)" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Welcome to the Future of Learning</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          style={{ color: 'var(--text-primary)', lineHeight: 1.1, fontSize: '5rem', fontWeight: 800, marginBottom: '24px' }}
        >
          Rewire Your Brain.<br />
          <span style={{ color: 'var(--gold)' }}>Master Anything.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', marginBottom: '40px' }}
        >
          AETHER OS is the world's most advanced neuro-sync learning protocol. Stop scrolling. Start building your legacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link
            to="/onboarding"
            className="l-pill l-pill-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Initialize Protocol <ArrowRight size={20} />
          </Link>
          <a
            href="#features"
            className="l-pill l-pill-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Explore Systems
          </a>
        </motion.div>
      </div>
    </section>
  )
}

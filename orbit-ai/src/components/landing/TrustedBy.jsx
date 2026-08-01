import { motion } from 'framer-motion'

const LOGOS = [
  "Microsoft", "Google", "Stripe", "Vercel", "Framer", "Linear", 
  "Notion", "OpenAI", "Meta", "Amazon"
]

export default function TrustedBy() {
  return (
    <section className="py-12 border-y" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', overflow: 'hidden' }}>
      <div className="text-center mb-6">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Trusted by elite performers at
        </p>
      </div>
      
      <div className="relative flex overflow-hidden w-full">
        <div className="absolute left-0 top-0 w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-secondary), transparent)' }} />
        <div className="absolute right-0 top-0 w-32 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-secondary), transparent)' }} />
        
        <motion.div
          className="flex whitespace-nowrap gap-16 items-center"
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20
          }}
          style={{ display: 'flex', gap: '4rem', paddingLeft: '4rem' }}
        >
          {/* Duplicate list to make infinite scroll smooth */}
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <div key={i} style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)', opacity: 0.5 }}>
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

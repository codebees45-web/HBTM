import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PricingToggle() {
  const [isYearly, setIsYearly] = useState(true)

  const plans = [
    { name: 'Standard', priceMonthly: 19, priceYearly: 15, features: ['Daily Goal Tracking', 'Basic Analytics', '3 Streak Freezes/mo'], popular: false },
    { name: 'AETHER Pro', priceMonthly: 49, priceYearly: 39, features: ['Unlimited The Oracle AI', 'Deep Work Nexus (All modes)', 'Identity Radar Metrics', 'Priority Support'], popular: true }
  ]

  return (
    <section className="py-24 px-6 w-full max-w-[1000px] mx-auto">
      <div className="text-center mb-16">
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' }}>Transparent Pricing</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
          <span style={{ color: !isYearly ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            style={{ width: '64px', height: '32px', background: 'var(--bg-secondary)', borderRadius: '99px', position: 'relative', border: '1px solid var(--border-color)', cursor: 'pointer' }}
          >
            <motion.div
              layout
              style={{ width: '24px', height: '24px', background: 'var(--gold)', borderRadius: '50%', position: 'absolute', top: '3px', left: isYearly ? '35px' : '3px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span style={{ color: isYearly ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Yearly <span style={{ color: 'var(--gold)', fontSize: '0.875rem' }}>(-20%)</span></span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center' }}>
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            style={{
              flex: '1 1 300px',
              maxWidth: '400px',
              background: plan.popular ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              border: plan.popular ? '2px solid var(--gold)' : '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '40px',
              position: 'relative',
              boxShadow: plan.popular ? 'var(--shadow-glow)' : 'var(--shadow-base)'
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', padding: '4px 16px', borderRadius: '99px', fontWeight: 700, fontSize: '0.875rem' }}>
                MOST POPULAR
              </div>
            )}
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{plan.name}</h3>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '32px' }}>
              ${isYearly ? plan.priceYearly : plan.priceMonthly}
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <Check size={20} color="var(--gold)" /> {f}
                </li>
              ))}
            </ul>

            <Link to="/onboarding" className={`l-pill ${plan.popular ? 'l-pill-primary' : 'l-pill-ghost'}`} style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              Get Started
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
